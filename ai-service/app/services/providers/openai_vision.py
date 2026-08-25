"""
OpenAI Vision Provider
Uses GPT-4o for food image recognition and nutrition estimation.
Requires OPENAI_API_KEY in environment.
"""

import base64
import json
import re
from pathlib import Path
from loguru import logger
from openai import AsyncOpenAI


class OpenAIVisionProvider:
    PROVIDER_NAME = "openai"

    def __init__(self, api_key: str, model: str = "gpt-4o", max_tokens: int = 2048):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        logger.info(f"OpenAI Vision Provider initialized with model: {model}")

    def _encode_image(self, image_path: str) -> tuple[str, str]:
        suffix = Path(image_path).suffix.lower()
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                    ".png": "image/png", ".webp": "image/webp"}
        mime = mime_map.get(suffix, "image/jpeg")
        with open(image_path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
        return data, mime

    def _parse_json_response(self, text: str) -> dict:
        """Robustly extract JSON from LLM response."""
        # Try direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        # Try extracting from markdown code block
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        # Try finding any JSON object
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse JSON from response: {text[:200]}")

    async def analyze_food_image(self, image_path: str) -> dict:
        logger.info(f"OpenAI analyzing food image: {image_path}")
        image_data, mime_type = self._encode_image(image_path)

        system_prompt = """You are a precise food recognition and nutrition expert.
Analyze the food image and return ONLY a valid JSON object (no markdown, no explanation).

JSON structure:
{
  "detected_foods": [
    {
      "name": "Food name in English",
      "confidence": 0.85,
      "category": "curry|bread|rice_dish|salad|snack|dessert|beverage|other",
      "serving_size": 200,
      "serving_unit": "grams",
      "nutrition_per_serving": {
        "calories": 250,
        "protein": 12.5,
        "carbs": 30.2,
        "fat": 8.4,
        "fiber": 3.1,
        "sugar": 4.2,
        "sodium": 350,
        "serving_size": 200,
        "serving_unit": "grams",
        "is_estimated": true,
        "source": "ai_estimated"
      },
      "alternatives": ["similar food 1", "similar food 2"]
    }
  ],
  "meal_description": "Brief description of the overall meal"
}

Rules:
- Identify ALL visible food items
- Use realistic nutritional values based on standard serving sizes
- confidence: 0.0-1.0 (how certain you are about the identification)
- If you cannot identify food clearly, include the item with lower confidence
- Always set is_estimated: true since this is from image analysis
- For Indian foods, use common English names + Indian name in parentheses"""

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_data}",
                                "detail": "high",
                            },
                        },
                        {"type": "text", "text": "Analyze this food image and return the JSON response."},
                    ],
                },
            ],
        )

        content = response.choices[0].message.content
        result = self._parse_json_response(content)

        # Calculate total nutrition
        foods = result.get("detected_foods", [])
        total = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0,
                 "fiber": 0, "sugar": 0, "sodium": 0}
        total_serving = 0
        for food in foods:
            n = food.get("nutrition_per_serving", {})
            for key in total:
                total[key] += n.get(key, 0)
            total_serving += food.get("serving_size", 0)

        return {
            "detected_foods": foods,
            "nutrition": {
                **total,
                "serving_size": total_serving,
                "serving_unit": "grams",
                "is_estimated": True,
                "source": "openai_vision",
            },
            "meal_description": result.get("meal_description", ""),
            "provider": self.PROVIDER_NAME,
            "model": self.model,
            "is_demo": False,
            "is_estimated": True,
        }

    async def generate_diet_plan(self, profile: dict, preferences: dict) -> dict:
        logger.info("OpenAI generating diet plan")
        profile_json = json.dumps(profile, indent=2)
        pref_json = json.dumps(preferences or {}, indent=2)

        system_prompt = """You are an expert nutritionist and registered dietitian specializing in regional Indian cuisine and nutrition science.
Generate a personalized 7-day diet plan. Return ONLY valid JSON, no markdown.

JSON structure:
{
  "title": "Plan title",
  "description": "2-3 sentence plan description",
  "days": [
    {
      "day_number": 1,
      "day_name": "Monday",
      "meals": [
        {
          "meal_type": "breakfast|mid_morning|lunch|evening_snack|dinner",
          "time": "8:00 AM",
          "foods": [
            {
              "name": "Food name",
              "quantity": "1 bowl (200g)",
              "calories": 250,
              "protein": 12.5,
              "carbs": 30,
              "fat": 8,
              "approximate_cost_inr": 30,
              "alternatives": ["alt1", "alt2"],
              "is_regional": true
            }
          ],
          "total_calories": 250,
          "total_protein": 12.5,
          "total_carbs": 30,
          "total_fat": 8,
          "total_cost_inr": 30,
          "notes": "Optional meal notes"
        }
      ],
      "total_calories": 1800,
      "total_protein": 75,
      "total_carbs": 240,
      "total_fat": 55,
      "total_cost_inr": 180
    }
  ]
}

Rules:
- Generate all 7 days
- Use foods appropriate to the user's region and cuisine preferences
- Respect dietary restrictions and allergies strictly
- Mark locally available foods as is_regional: true
- Keep costs within daily budget
- Aim for calorie target ± 100 calories
- Prices in INR (Indian Rupees), mark as approximate
- Include 5 meals per day: breakfast, mid_morning, lunch, evening_snack, dinner
- Prefer regional and seasonal Indian foods
- Include 2-3 alternatives for each main food"""

        user_msg = f"""Generate a 7-day personalized diet plan for this user:

PROFILE:
{profile_json}

ADDITIONAL PREFERENCES:
{pref_json}

Focus on:
1. Regional foods from {profile.get('city', '')} {profile.get('state', '')} {profile.get('country', 'India')}
2. Goal: {profile.get('primaryGoal', 'general_wellness')}
3. Diet type: {profile.get('dietType', 'non_vegetarian')}
4. Daily budget: ₹{profile.get('dailyBudgetINR', 200)}
5. Allergies to avoid: {', '.join(profile.get('allergies', [])) or 'None'}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        result = self._parse_json_response(content)
        result["provider"] = self.PROVIDER_NAME
        result["model"] = self.model
        result["is_demo"] = False
        return result

    async def chat(self, messages: list, context: dict) -> dict:
        system_content = self._build_system_prompt(context)
        openai_messages = [{"role": "system", "content": system_content}]
        for msg in messages[-20:]:
            if msg["role"] in ["user", "assistant"]:
                openai_messages.append({"role": msg["role"], "content": msg["content"]})

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=1024,
            messages=openai_messages,
        )

        return {
            "message": response.choices[0].message.content,
            "provider": self.PROVIDER_NAME,
            "model": self.model,
            "is_demo": False,
            "tokens_used": response.usage.total_tokens if response.usage else None,
        }

    async def get_recommendations(self, profile: dict, recent_meals: list) -> dict:
        profile_json = json.dumps(profile, indent=2)
        meals_json = json.dumps(recent_meals[:5], indent=2)

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=1024,
            messages=[
                {
                    "role": "system",
                    "content": "You are a nutrition expert. Return JSON: {\"recommendations\": [{\"type\": \"tip|food|substitution|warning\", \"title\": \"...\", \"message\": \"...\", \"priority\": \"low|normal|high\"}]}",
                },
                {
                    "role": "user",
                    "content": f"Give 4-5 personalized nutrition recommendations.\nProfile: {profile_json}\nRecent meals: {meals_json}",
                },
            ],
            response_format={"type": "json_object"},
        )

        result = self._parse_json_response(response.choices[0].message.content)
        result["provider"] = self.PROVIDER_NAME
        result["is_demo"] = False
        return result

    async def modify_diet_plan(self, current_plan: dict, instruction: str, user_profile: dict) -> dict:
        plan_summary = json.dumps({
            "title": current_plan.get("title"),
            "days": current_plan.get("days", [])[:2],  # Send first 2 days as context
        }, indent=2)

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "system",
                    "content": "You are a nutrition expert. Modify the diet plan based on the instruction. Return the complete modified plan as JSON with the same structure (all 7 days). Return ONLY JSON.",
                },
                {
                    "role": "user",
                    "content": f"Modify this diet plan: {plan_summary}\n\nInstruction: {instruction}\n\nUser profile: {json.dumps(user_profile, indent=2)}\n\nReturn the complete 7-day modified plan as JSON.",
                },
            ],
            response_format={"type": "json_object"},
        )

        result = self._parse_json_response(response.choices[0].message.content)
        result["provider"] = self.PROVIDER_NAME
        result["model"] = self.model
        result["is_demo"] = False
        return result

    def _build_system_prompt(self, context: dict) -> str:
        profile = context.get("user_profile") or {}
        plan = context.get("active_diet_plan")

        parts = [
            "You are NutriAI, an expert AI nutrition assistant specializing in Indian regional cuisine, "
            "personalized nutrition, and evidence-based dietary guidance.",
            "You provide practical, actionable advice tailored to the user's profile, goals, region, and budget.",
            "You are friendly, concise, and knowledgeable.",
            "IMPORTANT: You do not provide medical diagnoses or prescriptions. Always recommend consulting a nutritionist for medical dietary needs.",
            "",
            "DISCLAIMER: All nutrition information is for educational purposes only.",
        ]

        if profile:
            parts.append(f"\nUSER PROFILE:")
            parts.append(f"- Goal: {profile.get('primaryGoal', 'general wellness')}")
            parts.append(f"- Diet: {profile.get('dietType', 'not specified')}")
            parts.append(f"- Region: {profile.get('region', 'India')}")
            parts.append(f"- Daily calorie target: {profile.get('dailyCalorieTarget', 2000)} kcal")
            if profile.get("allergies"):
                parts.append(f"- Allergies: {', '.join(profile['allergies'])}")
            if profile.get("dailyBudgetINR"):
                parts.append(f"- Daily budget: ₹{profile['dailyBudgetINR']}")

        if plan:
            parts.append(f"\nACTIVE DIET PLAN: {plan.get('title', 'Current Plan')}")

        return "\n".join(parts)
