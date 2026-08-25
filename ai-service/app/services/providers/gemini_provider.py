"""
Google Gemini Provider — Compatible with google-genai 2.x
Uses Google Gemini API for food recognition, diet generation, and chat.
Free tier: 15 requests per minute, 1500 requests per day.
"""

import json
import re
import asyncio
import PIL.Image
from loguru import logger

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.error(
        "google-genai not installed. "
        "Run: pip install google-genai"
    )


class GeminiProvider:
    PROVIDER_NAME = "gemini"

    def __init__(
        self,
        api_key: str,
        vision_model: str = "gemini-1.5-flash",
        chat_model: str = "gemini-1.5-flash",
    ):
        if not GEMINI_AVAILABLE:
            raise RuntimeError(
                "google-genai package not installed. "
                "Run: pip install google-genai"
            )

        self.client            = genai.Client(api_key=api_key)
        self.vision_model_name = vision_model
        self.chat_model_name   = chat_model

        logger.info(
            f"✅ Gemini Provider ready — "
            f"Vision: {vision_model}, Chat: {chat_model}"
        )

    # ── JSON parsing helper ───────────────────────────────────────────
    def _parse_json(self, text: str) -> dict:
        """Robustly extract JSON from Gemini response."""
        text = text.strip()

        # Try direct parse first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try extracting from markdown code block
        match = re.search(
            r'```(?:json)?\s*(\{.*?\})\s*```',
            text,
            re.DOTALL
        )
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Try finding any JSON object in the response
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        raise ValueError(
            f"Could not parse JSON from response: {text[:300]}"
        )

    # ── Simple generate helper ────────────────────────────────────────
    def _generate(self, prompt: str) -> str:
        """Simple text generation — works with all google-genai versions."""
        response = self.client.models.generate_content(
            model=self.chat_model_name,
            contents=prompt,
        )
        return response.text

    # ── Food Image Recognition ────────────────────────────────────────
    async def analyze_food_image(self, image_path: str) -> dict:
        logger.info(f"Gemini analysing food image: {image_path}")

        def _analyze():
            img = PIL.Image.open(image_path)

            prompt = """Analyse this food image carefully.
Return ONLY a valid JSON object.
No markdown, no explanation, no text before or after the JSON.

{
  "detected_foods": [
    {
      "name": "Food name (e.g. Chicken Biryani, Dal Makhani, Pizza)",
      "confidence": 0.90,
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
        "source": "gemini_vision"
      },
      "alternatives": ["similar food 1", "similar food 2"]
    }
  ],
  "meal_description": "Short description of the overall meal"
}

Rules:
- Identify ALL visible food items
- Use realistic nutritional values
- confidence is 0.0 to 1.0
- Always set is_estimated to true
- For Indian dishes be specific
- Return at least one food item"""

            response = self.client.models.generate_content(
                model=self.vision_model_name,
                contents=[img, prompt],
            )
            return response.text

        loop = asyncio.get_running_loop()
        text = await loop.run_in_executor(None, _analyze)

        logger.info(f"Gemini vision raw: {text[:200]}")

        try:
            result = self._parse_json(text)
        except ValueError as e:
            logger.error(f"Vision parse error: {e}")
            result = {
                "detected_foods": [{
                    "name": "Food Item",
                    "confidence": 0.4,
                    "category": "other",
                    "serving_size": 150,
                    "serving_unit": "grams",
                    "nutrition_per_serving": {
                        "calories": 200,
                        "protein": 8,
                        "carbs": 25,
                        "fat": 7,
                        "fiber": 2,
                        "sugar": 3,
                        "sodium": 200,
                        "serving_size": 150,
                        "serving_unit": "grams",
                        "is_estimated": True,
                        "source": "gemini_fallback",
                    },
                    "alternatives": [],
                }],
                "meal_description": "Could not fully analyse image",
            }

        foods         = result.get("detected_foods", [])
        total         = {
            "calories": 0, "protein": 0, "carbs": 0,
            "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0,
        }
        total_serving = 0

        for food in foods:
            n = food.get("nutrition_per_serving", {})
            for key in total:
                total[key] += n.get(key, 0)
            total_serving += food.get("serving_size", 0)

        return {
            "detected_foods":    foods,
            "nutrition": {
                **total,
                "serving_size":  total_serving,
                "serving_unit":  "grams",
                "is_estimated":  True,
                "source":        "gemini_vision",
            },
            "meal_description":  result.get("meal_description", ""),
            "provider":          self.PROVIDER_NAME,
            "model":             self.vision_model_name,
            "is_demo":           False,
            "is_estimated":      True,
        }

    # ── AI Chat Assistant ─────────────────────────────────────────────
    async def chat(self, messages: list, context: dict) -> dict:
        """
        Chat using simple generate_content.
        This approach works reliably with google-genai 2.x
        by passing the full conversation as a single prompt.
        """
        system_prompt = self._build_system_prompt(context)

        def _chat():
            # Build the full conversation as plain text
            # This is the most reliable approach across all SDK versions
            conversation_parts = [system_prompt, ""]

            for msg in messages:
                role    = msg.get("role", "user")
                content = msg.get("content", "")

                if role == "user":
                    conversation_parts.append(f"User: {content}")
                elif role == "assistant":
                    conversation_parts.append(f"Assistant: {content}")

            # Add the final prompt for the assistant to respond
            conversation_parts.append("Assistant:")

            full_prompt = "\n".join(conversation_parts)

            response = self.client.models.generate_content(
                model=self.chat_model_name,
                contents=full_prompt,
            )
            return response.text

        loop = asyncio.get_running_loop()
        text = await loop.run_in_executor(None, _chat)

        # Clean up response — remove "Assistant:" prefix if present
        text = text.strip()
        if text.startswith("Assistant:"):
            text = text[len("Assistant:"):].strip()

        return {
            "message":  text,
            "provider": self.PROVIDER_NAME,
            "model":    self.chat_model_name,
            "is_demo":  False,
        }

    # ── Diet Plan Generation ──────────────────────────────────────────
    async def generate_diet_plan(
        self, profile: dict, preferences: dict
    ) -> dict:
        logger.info("Gemini generating diet plan")
        profile_str = json.dumps(profile, indent=2)

        def _generate():
            prompt = f"""You are an expert nutritionist specialising
in Indian regional cuisine.
Generate a personalised 7-day diet plan.
Return ONLY valid JSON — no markdown, no explanation.

User Profile:
{profile_str}

Return this exact structure for ALL 7 days:
{{
  "title": "Plan title",
  "description": "2-3 sentence description",
  "days": [
    {{
      "day_number": 1,
      "day_name": "Monday",
      "meals": [
        {{
          "meal_type": "breakfast",
          "time": "8:00 AM",
          "foods": [
            {{
              "name": "Food name",
              "quantity": "1 bowl (200g)",
              "calories": 250,
              "protein": 12,
              "carbs": 30,
              "fat": 8,
              "approximate_cost_inr": 30,
              "alternatives": ["alt1", "alt2"],
              "is_regional": true
            }}
          ],
          "total_calories": 250,
          "total_protein": 12,
          "total_carbs": 30,
          "total_fat": 8,
          "total_cost_inr": 30
        }}
      ],
      "total_calories": 1800,
      "total_protein": 75,
      "total_carbs": 240,
      "total_fat": 55,
      "total_cost_inr": 180
    }}
  ]
}}

Important rules:
- Generate ALL 7 days Monday to Sunday
- Region: {profile.get('city','')} {profile.get('state','')} {profile.get('country','India')}
- Diet type: {profile.get('dietType','non_vegetarian')} — follow strictly
- Goal: {profile.get('primaryGoal','general_wellness')}
- Daily budget: Rs {profile.get('dailyBudgetINR', 200)}
- Target calories: {profile.get('dailyCalorieTarget', 2000)} kcal per day
- Avoid: {', '.join(profile.get('allergies', [])) or 'None'}
- Include 5 meals per day
- Use locally available regional Indian foods
- Set is_regional true for regional foods
- All costs in Indian Rupees"""

            response = self.client.models.generate_content(
                model=self.chat_model_name,
                contents=prompt,
            )
            return response.text

        loop = asyncio.get_running_loop()
        text = await loop.run_in_executor(None, _generate)

        try:
            result = self._parse_json(text)
        except ValueError as e:
            logger.error(f"Diet parse error: {e}")
            raise ValueError(
                "Gemini returned invalid diet plan format. "
                "Please try again."
            )

        result["provider"] = self.PROVIDER_NAME
        result["model"]    = self.chat_model_name
        result["is_demo"]  = False
        return result

    # ── Recommendations ───────────────────────────────────────────────
    async def get_recommendations(
        self, profile: dict, recent_meals: list
    ) -> dict:
        def _recommend():
            prompt = f"""You are a nutrition expert.
Give 4 personalised nutrition recommendations.
Return ONLY valid JSON — no markdown:
{{
  "recommendations": [
    {{
      "type": "tip",
      "title": "Short title",
      "message": "Helpful advice in 1-2 sentences",
      "priority": "normal"
    }}
  ]
}}

Profile: {json.dumps(profile, indent=2)}
Recent meals: {json.dumps(recent_meals[:5], indent=2)}

Type options: tip, food, substitution, warning
Priority options: low, normal, high"""

            response = self.client.models.generate_content(
                model=self.chat_model_name,
                contents=prompt,
            )
            return response.text

        loop = asyncio.get_running_loop()
        text = await loop.run_in_executor(None, _recommend)

        try:
            result = self._parse_json(text)
        except ValueError:
            result = {
                "recommendations": [{
                    "type":     "tip",
                    "title":    "Stay Consistent",
                    "message":  "Log your meals regularly for better AI recommendations.",
                    "priority": "normal",
                }]
            }

        result["provider"] = self.PROVIDER_NAME
        result["is_demo"]  = False
        return result

    # ── Modify Diet Plan ──────────────────────────────────────────────
    async def modify_diet_plan(
        self,
        current_plan: dict,
        instruction: str,
        user_profile: dict,
    ) -> dict:
        plan_summary = json.dumps({
            "title": current_plan.get("title"),
            "days":  current_plan.get("days", [])[:2],
        }, indent=2)

        def _modify():
            prompt = f"""You are a nutrition expert.
Modify this diet plan based on the instruction.
Return the COMPLETE modified 7-day plan as JSON.
Return ONLY valid JSON — no markdown.

Current plan (first 2 days for context):
{plan_summary}

Instruction: {instruction}
User profile: {json.dumps(user_profile, indent=2)}

Return all 7 days with the same JSON structure."""

            response = self.client.models.generate_content(
                model=self.chat_model_name,
                contents=prompt,
            )
            return response.text

        loop = asyncio.get_running_loop()
        text = await loop.run_in_executor(None, _modify)

        try:
            result = self._parse_json(text)
        except ValueError as e:
            raise ValueError(
                f"Gemini returned invalid format: {e}"
            )

        result["provider"] = self.PROVIDER_NAME
        result["model"]    = self.chat_model_name
        result["is_demo"]  = False
        return result

    # ── System Prompt Builder ─────────────────────────────────────────
    def _build_system_prompt(self, context: dict) -> str:
        profile = context.get("user_profile") or {}
        plan    = context.get("active_diet_plan")

        parts = [
            "You are NutriAI, an expert AI nutrition assistant "
            "specialising in Indian regional cuisine and evidence-based "
            "dietary guidance.",
            "Provide practical, actionable advice tailored to the "
            "user profile, goals, region, and budget.",
            "Be friendly, clear, and concise.",
            "Do not provide medical diagnoses.",
            "Recommend consulting a nutritionist for medical needs.",
        ]

        if profile:
            parts.append("\nUser profile:")
            parts.append(
                f"- Goal: {profile.get('primaryGoal','general wellness')}"
            )
            parts.append(
                f"- Diet: {profile.get('dietType','not specified')}"
            )
            parts.append(
                f"- Region: {profile.get('region','India')}"
            )
            parts.append(
                f"- Daily calories: "
                f"{profile.get('dailyCalorieTarget', 2000)} kcal"
            )
            if profile.get("allergies"):
                parts.append(
                    f"- Allergies: {', '.join(profile['allergies'])}"
                )
            if profile.get("dailyBudgetINR"):
                parts.append(
                    f"- Budget: Rs{profile['dailyBudgetINR']}/day"
                )

        if plan:
            parts.append(
                f"\nActive diet plan: "
                f"{plan.get('title','Current Plan')}"
            )

        return "\n".join(parts)