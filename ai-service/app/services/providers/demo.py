"""
Demo Provider - Controlled responses for development and testing.

IMPORTANT: This provider is ONLY used when AI_MODE=demo.
It provides realistic structured responses to allow UI/UX development without incurring AI API costs. All responses are clearly labeled as demo.

In production (AI_MODE=production), this provider is NEVER used silently.
"""

import random
from typing import Optional
from loguru import logger

DEMO_FOODS = [
    {
        "name": "Dal Makhani",
        "confidence": 0.87,
        "category": "legume_dish",
        "serving_size": 200,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 198,
            "protein": 10.2,
            "carbs": 24.6,
            "fat": 6.8,
            "fiber": 5.2,
            "sugar": 2.1,
            "sodium": 380,
        },
        "alternatives": ["Rajma Chawal", "Chana Dal", "Moong Dal"],
    },
    {
        "name": "Chapati (Wheat Flatbread)",
        "confidence": 0.93,
        "category": "bread",
        "serving_size": 40,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 104,
            "protein": 3.2,
            "carbs": 18.9,
            "fat": 2.1,
            "fiber": 2.4,
            "sugar": 0.5,
            "sodium": 120,
        },
        "alternatives": ["Paratha", "Rice", "Bajra Roti"],
    },
    {
        "name": "Paneer Butter Masala",
        "confidence": 0.81,
        "category": "curry",
        "serving_size": 200,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 312,
            "protein": 14.8,
            "carbs": 16.2,
            "fat": 22.4,
            "fiber": 2.8,
            "sugar": 5.6,
            "sodium": 520,
        },
        "alternatives": ["Tofu Masala", "Chicken Tikka Masala", "Palak Paneer"],
    },
    {
        "name": "Idli (2 pieces)",
        "confidence": 0.91,
        "category": "south_indian",
        "serving_size": 100,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 132,
            "protein": 3.8,
            "carbs": 26.4,
            "fat": 1.2,
            "fiber": 1.6,
            "sugar": 0.8,
            "sodium": 200,
        },
        "alternatives": ["Dosa", "Uttapam", "Poha"],
    },
    {
        "name": "Chicken Biryani",
        "confidence": 0.85,
        "category": "rice_dish",
        "serving_size": 300,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 420,
            "protein": 24.6,
            "carbs": 48.2,
            "fat": 14.8,
            "fiber": 2.2,
            "sugar": 3.4,
            "sodium": 680,
        },
        "alternatives": ["Veg Biryani", "Mutton Biryani", "Pulao"],
    },
    {
        "name": "Poha",
        "confidence": 0.78,
        "category": "breakfast",
        "serving_size": 150,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 204,
            "protein": 4.2,
            "carbs": 34.8,
            "fat": 6.4,
            "fiber": 1.8,
            "sugar": 2.2,
            "sodium": 280,
        },
        "alternatives": ["Upma", "Sheera", "Oats"],
    },
    {
        "name": "Mixed Salad",
        "confidence": 0.72,
        "category": "salad",
        "serving_size": 200,
        "serving_unit": "grams",
        "nutrition": {
            "calories": 82,
            "protein": 2.8,
            "carbs": 14.6,
            "fat": 2.4,
            "fiber": 4.2,
            "sugar": 6.8,
            "sodium": 120,
        },
        "alternatives": ["Raita", "Kachumber", "Sprouts"],
    },
]

DEMO_CHAT_RESPONSES = {
    "protein": "For a high-protein vegetarian option, I'd recommend adding paneer (cottage cheese), moong dal, or sprouts to your meals. A 100g serving of paneer provides about 18g of protein — excellent for a vegetarian diet. [DEMO MODE]",
    "replace": "Great choice! Here are some healthy substitutes depending on what you're replacing: Paneer → Tofu or Soya chunks; Rice → Quinoa or Millets (jowar/bajra); Maida → Atta (whole wheat flour). [DEMO MODE]",
    "budget": "To make your meals more budget-friendly, consider: (1) Seasonal vegetables cost 30-50% less; (2) Dal/legumes are the most cost-effective protein in India; (3) Buy rice/flour in bulk; (4) Homemade curd costs ₹15-20 vs ₹40 packaged. [DEMO MODE]",
    "regional": "Based on your Uttar Pradesh profile, here are locally popular and accessible foods: Sattu (roasted gram), Bajra roti, Arvi (taro), Makki ki roti, Chana, Sarson ka saag, and Lassi. These are nutritious, regional, and typically affordable. [DEMO MODE]",
    "default": "I'm your AI Nutrition Assistant. I can help you with meal planning, substitutions, regional food suggestions, and nutrition questions. What would you like to know? Note: This is demo mode — connect an AI provider for personalized responses. [DEMO MODE]",
}


class DemoProvider:
    """
    Provides clearly-labeled demo responses for development.
    Never used silently in production.
    """

    PROVIDER_NAME = "demo"
    MODEL_NAME = "demo-v1"

    def __init__(self):
        logger.warning(
            "⚠️  DEMO MODE ACTIVE: AI responses are pre-configured samples, not real AI inference. "
            "Set AI_MODE=production to use actual AI models."
        )

    async def analyze_food_image(self, image_path: str) -> dict:
        """Returns a realistic demo food analysis result."""
        logger.info(f"[DEMO] Analyzing food image: {image_path}")

        # Pick 1-2 foods for a realistic demo
        num_foods = random.randint(1, 2)
        selected = random.sample(DEMO_FOODS, min(num_foods, len(DEMO_FOODS)))

        detected = []
        total_nutrition = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sugar": 0,
            "sodium": 0,
        }

        for food in selected:
            detected.append(
                {
                    "name": food["name"],
                    "confidence": food["confidence"],
                    "category": food.get("category"),
                    "serving_size": food["serving_size"],
                    "serving_unit": food["serving_unit"],
                    "nutrition_per_serving": {
                        **food["nutrition"],
                        "serving_size": food["serving_size"],
                        "serving_unit": food["serving_unit"],
                        "is_estimated": True,
                        "source": "demo",
                    },
                    "alternatives": food.get("alternatives", []),
                }
            )
            for key in total_nutrition:
                total_nutrition[key] += food["nutrition"].get(key, 0)

        return {
            "detected_foods": detected,
            "nutrition": {
                **total_nutrition,
                "serving_size": sum(f["serving_size"] for f in selected),
                "serving_unit": "grams",
                "is_estimated": True,
                "source": "demo",
            },
            "meal_description": f"Detected: {', '.join(f['name'] for f in selected)}",
            "provider": self.PROVIDER_NAME,
            "model": self.MODEL_NAME,
            "is_demo": True,
            "is_estimated": True,
        }

    async def generate_diet_plan(self, profile: dict, preferences: dict) -> dict:
        """Returns a realistic 7-day regional Indian demo diet plan."""
        logger.info("[DEMO] Generating diet plan")
        return _build_demo_diet_plan(profile)

    async def chat(self, messages: list, context: dict) -> dict:
        """Returns a contextual demo response."""
        logger.info("[DEMO] Generating chat response")

        last_msg = messages[-1]["content"].lower() if messages else ""

        response = DEMO_CHAT_RESPONSES["default"]
        if any(w in last_msg for w in ["protein", "muscle", "strength"]):
            response = DEMO_CHAT_RESPONSES["protein"]
        elif any(w in last_msg for w in ["replace", "substitute", "instead", "alternative"]):
            response = DEMO_CHAT_RESPONSES["replace"]
        elif any(w in last_msg for w in ["budget", "cheap", "cost", "expensive", "money"]):
            response = DEMO_CHAT_RESPONSES["budget"]
        elif any(w in last_msg for w in ["region", "local", "uttar pradesh", "lucknow", "india"]):
            response = DEMO_CHAT_RESPONSES["regional"]

        return {
            "message": response,
            "provider": self.PROVIDER_NAME,
            "model": self.MODEL_NAME,
            "is_demo": True,
        }

    async def get_recommendations(self, profile: dict, recent_meals: list) -> dict:
        """Returns demo recommendations."""
        goal = profile.get("primaryGoal", "general_wellness")
        diet_type = profile.get("dietType", "non_vegetarian")

        recommendations = [
            {
                "type": "tip",
                "title": "Stay Hydrated",
                "message": "Aim for 8-10 glasses of water daily. Hydration affects metabolism and energy levels.",
                "priority": "normal",
            },
            {
                "type": "food",
                "title": "Regional Protein Source",
                "message": "Chana (chickpeas) and Moong dal are high-protein, affordable, and widely available in your region.",
                "priority": "normal",
            },
        ]

        if goal == "weight_loss":
            recommendations.append(
                {
                    "type": "tip",
                    "title": "Calorie Awareness",
                    "message": "Your goal is weight loss. Focus on high-fiber foods like vegetables, dal, and whole grains which keep you full longer.",
                    "priority": "high",
                }
            )
        elif goal in ["weight_gain", "muscle_gain"]:
            recommendations.append(
                {
                    "type": "food",
                    "title": "Calorie-Dense Foods",
                    "message": "Include nuts, ghee (in moderation), paneer, and whole milk to increase calorie intake healthily.",
                    "priority": "high",
                }
            )

        if diet_type == "vegetarian":
            recommendations.append(
                {
                    "type": "food",
                    "title": "Complete Protein Combination",
                    "message": "Combine rice with dal or chapati with curd to get all essential amino acids in a vegetarian diet.",
                    "priority": "normal",
                }
            )

        return {
            "recommendations": recommendations,
            "provider": self.PROVIDER_NAME,
            "is_demo": True,
        }

    async def modify_diet_plan(self, current_plan: dict, instruction: str, user_profile: dict) -> dict:
        """Returns modified demo plan with instruction applied."""
        logger.info(f"[DEMO] Modifying diet plan: {instruction}")
        modified = _build_demo_diet_plan(user_profile or {})
        modified["description"] = f"Modified: {instruction} [DEMO MODE - Connect AI for real modifications]"
        return modified


def _build_demo_diet_plan(profile: dict) -> dict:
    """Build a realistic 7-day Indian diet plan demo."""
    diet_type = profile.get("dietType", "non_vegetarian")
    region = profile.get("city") or profile.get("state") or "India"
    goal = profile.get("primaryGoal", "general_wellness")
    budget = profile.get("dailyBudgetINR", 200)
    calorie_target = profile.get("dailyCalorieTarget", 2000)
    cuisine_prefs = profile.get("cuisinePreferences", ["north_indian"])

    is_veg = diet_type in ["vegetarian", "vegan", "eggetarian"]

    day_plans = []
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    breakfast_options_veg = [
        {"name": "Poha with peanuts", "qty": "1.5 cups", "cal": 240, "pro": 7, "carb": 38, "fat": 7, "cost": 15, "alt": ["Upma", "Daliya"]},
        {"name": "Moong dal cheela (2 pieces)", "qty": "2 pieces", "cal": 180, "pro": 10, "carb": 24, "fat": 4, "cost": 20, "alt": ["Besan cheela", "Oats"]},
        {"name": "Idli (3 pieces) with sambar", "qty": "3 idli + sambar", "cal": 280, "pro": 9, "carb": 52, "fat": 3, "cost": 30, "alt": ["Dosa", "Uttapam"]},
        {"name": "Oats porridge with banana", "qty": "1 bowl", "cal": 260, "pro": 8, "carb": 48, "fat": 4, "cost": 25, "alt": ["Daliya", "Cornflakes"]},
        {"name": "Aloo paratha with curd", "qty": "2 paratha + curd", "cal": 380, "pro": 10, "carb": 58, "fat": 12, "cost": 25, "alt": ["Methi paratha", "Chapati with sabzi"]},
        {"name": "Sprouts chaat with lemon", "qty": "1 bowl", "cal": 180, "pro": 12, "carb": 28, "fat": 2, "cost": 15, "alt": ["Chana chaat", "Moong sprouts"]},
        {"name": "Peanut butter toast with banana", "qty": "2 slices + 1 banana", "cal": 320, "pro": 11, "carb": 46, "fat": 10, "cost": 30, "alt": ["Egg toast", "Soya toast"]},
    ]

    lunch_options_veg = [
        {
            "name": "Dal + Chapati + Vegetable sabzi + Curd",
            "qty": "2 chapati, 1 bowl dal, 1 bowl sabzi, 1 bowl curd",
            "cal": 480, "pro": 18, "carb": 72, "fat": 12, "cost": 60,
            "alt": ["Brown rice dal", "Khichdi"],
        },
        {
            "name": "Rajma Chawal",
            "qty": "1 plate (200g rice + 150g rajma)",
            "cal": 520, "pro": 20, "carb": 88, "fat": 8, "cost": 50,
            "alt": ["Dal chawal", "Chole chawal"],
        },
        {
            "name": "Paneer sabzi + Roti + Dal",
            "qty": "2 roti, 1 bowl paneer sabzi, 1 bowl dal",
            "cal": 560, "pro": 24, "carb": 68, "fat": 18, "cost": 80,
            "alt": ["Tofu sabzi", "Soya chunks curry"],
        },
        {
            "name": "Mixed vegetable pulao + Raita",
            "qty": "1.5 cups rice, 1 bowl raita",
            "cal": 420, "pro": 12, "carb": 76, "fat": 8, "cost": 55,
            "alt": ["Veg biryani", "Khichdi"],
        },
        {
            "name": "Chole + Bhature (2 pieces)",
            "qty": "2 bhature + chole",
            "cal": 620, "pro": 18, "carb": 96, "fat": 18, "cost": 65,
            "alt": ["Puri sabzi", "Paratha with chole"],
        },
        {
            "name": "Palak dal + 2 Chapati + Salad",
            "qty": "2 chapati, 1 bowl palak dal, 1 salad",
            "cal": 420, "pro": 16, "carb": 64, "fat": 10, "cost": 55,
            "alt": ["Methi dal", "Lauki sabzi roti"],
        },
        {
            "name": "Moong dal khichdi + Papad + Curd",
            "qty": "1.5 cups khichdi, 1 curd",
            "cal": 380, "pro": 16, "carb": 62, "fat": 6, "cost": 45,
            "alt": ["Lauki khichdi", "Dal rice"],
        },
    ]

    snack_options = [
        {"name": "Roasted makhana", "qty": "1 bowl (30g)", "cal": 110, "pro": 4, "carb": 20, "fat": 1, "cost": 20, "alt": ["Roasted chana", "Puffed rice"]},
        {"name": "Chana chaat with tamarind", "qty": "1 bowl", "cal": 180, "pro": 8, "carb": 28, "fat": 3, "cost": 15, "alt": ["Sprouts chaat", "Fruit chaat"]},
        {"name": "Lassi (unsweetened)", "qty": "1 glass (250ml)", "cal": 120, "pro": 6, "carb": 12, "fat": 5, "cost": 20, "alt": ["Chaas", "Coconut water"]},
        {"name": "Seasonal fruits (banana, apple, orange)", "qty": "1-2 fruits", "cal": 100, "pro": 1, "carb": 24, "fat": 0, "cost": 20, "alt": ["Papaya", "Guava"]},
        {"name": "Peanuts + Jaggery", "qty": "30g peanuts + 10g jaggery", "cal": 190, "pro": 7, "carb": 18, "fat": 11, "cost": 10, "alt": ["Mixed nuts", "Chikki"]},
    ]

    dinner_options_veg = [
        {
            "name": "Dal fry + 2 Chapati + Cucumber salad",
            "qty": "2 chapati, 1 bowl dal, salad",
            "cal": 380, "pro": 15, "carb": 62, "fat": 8, "cost": 50,
            "alt": ["Moong dal soup", "Arhar dal"],
        },
        {
            "name": "Vegetable khichdi + Papad",
            "qty": "1 big bowl khichdi, 1 papad",
            "cal": 340, "pro": 12, "carb": 58, "fat": 6, "cost": 40,
            "alt": ["Dal rice", "Sabudana khichdi"],
        },
        {
            "name": "Palak paneer + Roti + Salad",
            "qty": "2 roti, 1 bowl palak paneer",
            "cal": 460, "pro": 20, "carb": 54, "fat": 16, "cost": 75,
            "alt": ["Lauki kofta", "Tofu palak"],
        },
        {
            "name": "Sambar rice + Curd",
            "qty": "1 cup rice, 1 bowl sambar, curd",
            "cal": 380, "pro": 13, "carb": 72, "fat": 4, "cost": 45,
            "alt": ["Rasam rice", "Curd rice"],
        },
        {
            "name": "Bajra roti + Sarson saag + Lassi",
            "qty": "2 bajra roti, 1 bowl saag, lassi",
            "cal": 420, "pro": 14, "carb": 66, "fat": 10, "cost": 50,
            "alt": ["Makki roti", "Spinach curry"],
        },
        {
            "name": "Lauki sabzi + Dal + Chapati",
            "qty": "2 chapati, lauki sabzi, dal",
            "cal": 360, "pro": 14, "carb": 58, "fat": 8, "cost": 45,
            "alt": ["Tinda sabzi", "Karela sabzi"],
        },
        {
            "name": "Oats vegetable soup + Toast",
            "qty": "1 bowl soup, 2 slices toast",
            "cal": 280, "pro": 10, "carb": 46, "fat": 5, "cost": 35,
            "alt": ["Dal soup", "Veg broth"],
        },
    ]

    for i in range(7):
        bf = breakfast_options_veg[i % len(breakfast_options_veg)]
        ln = lunch_options_veg[i % len(lunch_options_veg)]
        sn = snack_options[i % len(snack_options)]
        dn = dinner_options_veg[i % len(dinner_options_veg)]

        meals = [
            {
                "meal_type": "breakfast",
                "time": "8:00 AM",
                "foods": [{"name": bf["name"], "quantity": bf["qty"], "calories": bf["cal"],
                           "protein": bf["pro"], "carbs": bf["carb"], "fat": bf["fat"],
                           "approximate_cost_inr": bf["cost"], "alternatives": bf.get("alt", []),
                           "is_regional": True}],
                "total_calories": bf["cal"], "total_protein": bf["pro"],
                "total_carbs": bf["carb"], "total_fat": bf["fat"],
                "total_cost_inr": bf["cost"],
            },
            {
                "meal_type": "mid_morning",
                "time": "11:00 AM",
                "foods": [{"name": sn["name"], "quantity": sn["qty"], "calories": sn["cal"],
                           "protein": sn["pro"], "carbs": sn["carb"], "fat": sn["fat"],
                           "approximate_cost_inr": sn["cost"], "alternatives": sn.get("alt", []),
                           "is_regional": True}],
                "total_calories": sn["cal"], "total_protein": sn["pro"],
                "total_carbs": sn["carb"], "total_fat": sn["fat"],
                "total_cost_inr": sn["cost"],
            },
            {
                "meal_type": "lunch",
                "time": "1:00 PM",
                "foods": [{"name": ln["name"], "quantity": ln["qty"], "calories": ln["cal"],
                           "protein": ln["pro"], "carbs": ln["carb"], "fat": ln["fat"],
                           "approximate_cost_inr": ln["cost"], "alternatives": ln.get("alt", []),
                           "is_regional": True}],
                "total_calories": ln["cal"], "total_protein": ln["pro"],
                "total_carbs": ln["carb"], "total_fat": ln["fat"],
                "total_cost_inr": ln["cost"],
            },
            {
                "meal_type": "evening_snack",
                "time": "4:30 PM",
                "foods": [{"name": "Chai + Biscuits or fruit", "quantity": "1 cup + 2 biscuits",
                           "calories": 120, "protein": 3, "carbs": 20, "fat": 4,
                           "approximate_cost_inr": 10, "alternatives": ["Green tea", "Coconut water"],
                           "is_regional": True}],
                "total_calories": 120, "total_protein": 3,
                "total_carbs": 20, "total_fat": 4, "total_cost_inr": 10,
            },
            {
                "meal_type": "dinner",
                "time": "7:30 PM",
                "foods": [{"name": dn["name"], "quantity": dn["qty"], "calories": dn["cal"],
                           "protein": dn["pro"], "carbs": dn["carb"], "fat": dn["fat"],
                           "approximate_cost_inr": dn["cost"], "alternatives": dn.get("alt", []),
                           "is_regional": True}],
                "total_calories": dn["cal"], "total_protein": dn["pro"],
                "total_carbs": dn["carb"], "total_fat": dn["fat"],
                "total_cost_inr": dn["cost"],
            },
        ]

        day_total_cal = sum(m["total_calories"] for m in meals)
        day_total_pro = sum(m["total_protein"] for m in meals)
        day_total_carb = sum(m["total_carbs"] for m in meals)
        day_total_fat = sum(m["total_fat"] for m in meals)
        day_total_cost = sum(m.get("total_cost_inr", 0) for m in meals)

        day_plans.append({
            "day_number": i + 1,
            "day_name": day_names[i],
            "meals": meals,
            "total_calories": round(day_total_cal, 1),
            "total_protein": round(day_total_pro, 1),
            "total_carbs": round(day_total_carb, 1),
            "total_fat": round(day_total_fat, 1),
            "total_cost_inr": round(day_total_cost, 0),
        })

    goal_map = {
        "weight_loss": "Weight Loss",
        "weight_gain": "Weight Gain",
        "maintain_weight": "Maintenance",
        "general_wellness": "General Wellness",
        "muscle_gain": "Muscle Gain",
    }

    return {
        "title": f"7-Day {goal_map.get(goal, 'Personalized')} Diet Plan — {region}",
        "description": (
            f"A regionally-adapted {'vegetarian' if is_veg else 'balanced'} diet plan "
            f"for {region}, optimized for {goal_map.get(goal, 'wellness')}. "
            f"Daily budget: ₹{budget or 200} (approx). "
            "[DEMO MODE — Connect an AI provider for a fully personalized plan]"
        ),
        "days": day_plans,
        "provider": "demo",
        "model": "demo-v1",
        "is_demo": True,
    }
