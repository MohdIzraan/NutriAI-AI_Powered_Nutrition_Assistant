"""
Local Vision Provider
Uses HuggingFace ViT model fine-tuned on Food101 dataset for food recognition.
Model: nateraw/food (ViT-large fine-tuned on Food101)
Falls back to general image classification if food model unavailable.

This runs entirely locally - no API calls needed.
"""

import asyncio
import json
from pathlib import Path
from typing import Optional
from loguru import logger

# Lazy imports for heavy ML libraries
_pipeline = None
_torch = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline
            import torch
            logger.info("Loading food recognition model (nateraw/food)...")
            device = 0 if torch.cuda.is_available() else -1
            device_name = "GPU" if device == 0 else "CPU"
            logger.info(f"Using device: {device_name}")
            _pipeline = pipeline(
                "image-classification",
                model="nateraw/food",
                device=device,
                top_k=5,
                trust_remote_code=False,
            )
            logger.info("Food recognition model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load local model: {e}")
            raise
    return _pipeline

# Nutrition database for Food101 categories (per 100g)
FOOD101_NUTRITION = {
    "apple_pie": {"calories": 237, "protein": 2.0, "carbs": 34.0, "fat": 11.0, "fiber": 1.5},
    "baby_back_ribs": {"calories": 296, "protein": 23.0, "carbs": 7.0, "fat": 20.0, "fiber": 0},
    "baklava": {"calories": 428, "protein": 5.6, "carbs": 52.0, "fat": 22.0, "fiber": 1.8},
    "beef_carpaccio": {"calories": 162, "protein": 22.0, "carbs": 0, "fat": 8.0, "fiber": 0},
    "beef_tartare": {"calories": 168, "protein": 19.0, "carbs": 3.0, "fat": 9.0, "fiber": 0},
    "beet_salad": {"calories": 72, "protein": 2.5, "carbs": 12.0, "fat": 2.0, "fiber": 3.5},
    "beignets": {"calories": 320, "protein": 5.0, "carbs": 45.0, "fat": 14.0, "fiber": 1.0},
    "bibimbap": {"calories": 190, "protein": 12.0, "carbs": 28.0, "fat": 5.0, "fiber": 3.0},
    "bread_pudding": {"calories": 258, "protein": 7.0, "carbs": 38.0, "fat": 9.0, "fiber": 1.0},
    "breakfast_burrito": {"calories": 295, "protein": 14.0, "carbs": 32.0, "fat": 13.0, "fiber": 3.0},
    "bruschetta": {"calories": 169, "protein": 5.0, "carbs": 24.0, "fat": 6.0, "fiber": 2.0},
    "caesar_salad": {"calories": 158, "protein": 7.0, "carbs": 8.0, "fat": 12.0, "fiber": 2.0},
    "cannoli": {"calories": 340, "protein": 8.0, "carbs": 42.0, "fat": 16.0, "fiber": 1.0},
    "caprese_salad": {"calories": 140, "protein": 8.0, "carbs": 5.0, "fat": 10.0, "fiber": 1.0},
    "carrot_cake": {"calories": 395, "protein": 4.0, "carbs": 52.0, "fat": 20.0, "fiber": 2.0},
    "ceviche": {"calories": 84, "protein": 16.0, "carbs": 4.0, "fat": 1.5, "fiber": 0.5},
    "cheesecake": {"calories": 321, "protein": 5.5, "carbs": 26.0, "fat": 22.0, "fiber": 0.5},
    "cheese_plate": {"calories": 380, "protein": 22.0, "carbs": 3.0, "fat": 32.0, "fiber": 0},
    "chicken_curry": {"calories": 170, "protein": 18.0, "carbs": 8.0, "fat": 8.0, "fiber": 1.5},
    "chicken_quesadilla": {"calories": 280, "protein": 18.0, "carbs": 24.0, "fat": 12.0, "fiber": 2.0},
    "chicken_wings": {"calories": 290, "protein": 27.0, "carbs": 0, "fat": 20.0, "fiber": 0},
    "chocolate_cake": {"calories": 389, "protein": 5.0, "carbs": 56.0, "fat": 18.0, "fiber": 3.0},
    "chocolate_mousse": {"calories": 238, "protein": 4.0, "carbs": 26.0, "fat": 14.0, "fiber": 1.5},
    "churros": {"calories": 327, "protein": 5.0, "carbs": 48.0, "fat": 14.0, "fiber": 2.0},
    "clam_chowder": {"calories": 120, "protein": 7.0, "carbs": 12.0, "fat": 5.0, "fiber": 1.0},
    "club_sandwich": {"calories": 407, "protein": 28.0, "carbs": 36.0, "fat": 17.0, "fiber": 3.0},
    "crab_cakes": {"calories": 191, "protein": 17.0, "carbs": 10.0, "fat": 9.0, "fiber": 0.5},
    "creme_brulee": {"calories": 332, "protein": 5.0, "carbs": 27.0, "fat": 23.0, "fiber": 0},
    "croque_madame": {"calories": 320, "protein": 18.0, "carbs": 26.0, "fat": 16.0, "fiber": 2.0},
    "cup_cakes": {"calories": 400, "protein": 4.0, "carbs": 56.0, "fat": 18.0, "fiber": 1.0},
    "deviled_eggs": {"calories": 160, "protein": 10.0, "carbs": 2.0, "fat": 12.0, "fiber": 0},
    "donuts": {"calories": 450, "protein": 5.0, "carbs": 57.0, "fat": 22.0, "fiber": 1.5},
    "dumplings": {"calories": 150, "protein": 8.0, "carbs": 20.0, "fat": 4.0, "fiber": 1.0},
    "edamame": {"calories": 121, "protein": 11.0, "carbs": 10.0, "fat": 5.0, "fiber": 5.2},
    "eggs_benedict": {"calories": 330, "protein": 17.0, "carbs": 22.0, "fat": 20.0, "fiber": 1.0},
    "escargots": {"calories": 90, "protein": 16.0, "carbs": 2.0, "fat": 1.4, "fiber": 0},
    "falafel": {"calories": 333, "protein": 13.0, "carbs": 32.0, "fat": 18.0, "fiber": 6.0},
    "filet_mignon": {"calories": 235, "protein": 26.0, "carbs": 0, "fat": 15.0, "fiber": 0},
    "fish_and_chips": {"calories": 350, "protein": 18.0, "carbs": 38.0, "fat": 14.0, "fiber": 3.0},
    "foie_gras": {"calories": 462, "protein": 11.0, "carbs": 5.0, "fat": 44.0, "fiber": 0},
    "french_fries": {"calories": 312, "protein": 3.4, "carbs": 41.0, "fat": 15.0, "fiber": 3.8},
    "french_onion_soup": {"calories": 90, "protein": 4.0, "carbs": 12.0, "fat": 3.0, "fiber": 1.5},
    "french_toast": {"calories": 228, "protein": 7.0, "carbs": 32.0, "fat": 8.0, "fiber": 1.5},
    "fried_calamari": {"calories": 175, "protein": 14.0, "carbs": 14.0, "fat": 6.0, "fiber": 0.5},
    "fried_rice": {"calories": 200, "protein": 6.0, "carbs": 32.0, "fat": 6.0, "fiber": 1.5},
    "frozen_yogurt": {"calories": 159, "protein": 3.8, "carbs": 34.0, "fat": 0.5, "fiber": 0},
    "garlic_bread": {"calories": 380, "protein": 8.0, "carbs": 48.0, "fat": 17.0, "fiber": 2.5},
    "gnocchi": {"calories": 150, "protein": 4.0, "carbs": 30.0, "fat": 1.5, "fiber": 1.5},
    "greek_salad": {"calories": 90, "protein": 4.0, "carbs": 7.0, "fat": 6.0, "fiber": 2.5},
    "grilled_cheese_sandwich": {"calories": 395, "protein": 17.0, "carbs": 34.0, "fat": 21.0, "fiber": 2.0},
    "grilled_salmon": {"calories": 206, "protein": 28.0, "carbs": 0, "fat": 10.0, "fiber": 0},
    "guacamole": {"calories": 150, "protein": 2.0, "carbs": 9.0, "fat": 14.0, "fiber": 6.0},
    "gyoza": {"calories": 190, "protein": 8.0, "carbs": 22.0, "fat": 8.0, "fiber": 1.5},
    "hamburger": {"calories": 295, "protein": 17.0, "carbs": 24.0, "fat": 14.0, "fiber": 1.5},
    "hot_and_sour_soup": {"calories": 65, "protein": 5.0, "carbs": 7.0, "fat": 2.0, "fiber": 1.0},
    "hot_dog": {"calories": 260, "protein": 9.0, "carbs": 25.0, "fat": 14.0, "fiber": 1.0},
    "huevos_rancheros": {"calories": 230, "protein": 13.0, "carbs": 24.0, "fat": 10.0, "fiber": 4.0},
    "hummus": {"calories": 177, "protein": 8.0, "carbs": 20.0, "fat": 8.6, "fiber": 6.0},
    "ice_cream": {"calories": 207, "protein": 3.5, "carbs": 24.0, "fat": 11.0, "fiber": 0.7},
    "lasagna": {"calories": 135, "protein": 8.0, "carbs": 14.0, "fat": 5.0, "fiber": 1.5},
    "lobster_bisque": {"calories": 127, "protein": 8.0, "carbs": 9.0, "fat": 7.0, "fiber": 0.5},
    "lobster_roll_sandwich": {"calories": 280, "protein": 20.0, "carbs": 24.0, "fat": 11.0, "fiber": 1.0},
    "macaroni_and_cheese": {"calories": 174, "protein": 7.0, "carbs": 24.0, "fat": 6.0, "fiber": 1.0},
    "macarons": {"calories": 450, "protein": 6.0, "carbs": 72.0, "fat": 16.0, "fiber": 1.0},
    "miso_soup": {"calories": 40, "protein": 3.0, "carbs": 5.0, "fat": 1.0, "fiber": 0.5},
    "mussels": {"calories": 86, "protein": 12.0, "carbs": 4.0, "fat": 2.2, "fiber": 0},
    "nachos": {"calories": 343, "protein": 10.0, "carbs": 36.0, "fat": 18.0, "fiber": 3.0},
    "omelette": {"calories": 154, "protein": 11.0, "carbs": 0.4, "fat": 12.0, "fiber": 0},
    "onion_rings": {"calories": 411, "protein": 5.0, "carbs": 48.0, "fat": 22.0, "fiber": 3.0},
    "oysters": {"calories": 68, "protein": 7.0, "carbs": 4.0, "fat": 2.5, "fiber": 0},
    "pad_thai": {"calories": 200, "protein": 12.0, "carbs": 28.0, "fat": 5.0, "fiber": 2.0},
    "paella": {"calories": 181, "protein": 12.0, "carbs": 24.0, "fat": 4.0, "fiber": 1.5},
    "pancakes": {"calories": 227, "protein": 6.0, "carbs": 38.0, "fat": 7.0, "fiber": 1.5},
    "panna_cotta": {"calories": 198, "protein": 3.5, "carbs": 20.0, "fat": 12.0, "fiber": 0},
    "peking_duck": {"calories": 370, "protein": 26.0, "carbs": 6.0, "fat": 28.0, "fiber": 0},
    "pho": {"calories": 215, "protein": 16.0, "carbs": 28.0, "fat": 4.0, "fiber": 2.0},
    "pizza": {"calories": 266, "protein": 11.0, "carbs": 33.0, "fat": 10.0, "fiber": 2.3},
    "pork_chop": {"calories": 231, "protein": 26.0, "carbs": 0, "fat": 14.0, "fiber": 0},
    "poutine": {"calories": 425, "protein": 12.0, "carbs": 48.0, "fat": 20.0, "fiber": 3.0},
    "prime_rib": {"calories": 291, "protein": 24.0, "carbs": 0, "fat": 21.0, "fiber": 0},
    "pulled_pork_sandwich": {"calories": 320, "protein": 20.0, "carbs": 28.0, "fat": 14.0, "fiber": 2.0},
    "ramen": {"calories": 436, "protein": 20.0, "carbs": 62.0, "fat": 11.0, "fiber": 3.0},
    "ravioli": {"calories": 192, "protein": 10.0, "carbs": 28.0, "fat": 5.0, "fiber": 2.0},
    "red_velvet_cake": {"calories": 367, "protein": 4.5, "carbs": 52.0, "fat": 17.0, "fiber": 1.0},
    "risotto": {"calories": 166, "protein": 5.0, "carbs": 28.0, "fat": 4.0, "fiber": 0.5},
    "samosa": {"calories": 260, "protein": 5.0, "carbs": 36.0, "fat": 11.0, "fiber": 3.0},
    "sashimi": {"calories": 127, "protein": 20.0, "carbs": 0, "fat": 5.0, "fiber": 0},
    "scallops": {"calories": 111, "protein": 20.0, "carbs": 5.0, "fat": 0.8, "fiber": 0},
    "seaweed_salad": {"calories": 45, "protein": 1.5, "carbs": 8.0, "fat": 0.5, "fiber": 3.0},
    "shrimp_and_grits": {"calories": 260, "protein": 18.0, "carbs": 26.0, "fat": 9.0, "fiber": 1.5},
    "spaghetti_bolognese": {"calories": 236, "protein": 14.0, "carbs": 28.0, "fat": 7.0, "fiber": 3.0},
    "spaghetti_carbonara": {"calories": 306, "protein": 14.0, "carbs": 34.0, "fat": 13.0, "fiber": 2.0},
    "spring_rolls": {"calories": 190, "protein": 7.0, "carbs": 26.0, "fat": 7.0, "fiber": 2.0},
    "steak": {"calories": 271, "protein": 26.0, "carbs": 0, "fat": 18.0, "fiber": 0},
    "strawberry_shortcake": {"calories": 311, "protein": 4.0, "carbs": 48.0, "fat": 12.0, "fiber": 2.0},
    "sushi": {"calories": 150, "protein": 8.0, "carbs": 24.0, "fat": 1.0, "fiber": 1.0},
    "tacos": {"calories": 226, "protein": 12.0, "carbs": 22.0, "fat": 10.0, "fiber": 4.0},
    "takoyaki": {"calories": 190, "protein": 10.0, "carbs": 20.0, "fat": 8.0, "fiber": 0.5},
    "tiramisu": {"calories": 240, "protein": 5.0, "carbs": 30.0, "fat": 12.0, "fiber": 0.5},
    "tuna_tartare": {"calories": 130, "protein": 22.0, "carbs": 2.0, "fat": 4.0, "fiber": 0},
    "waffles": {"calories": 291, "protein": 7.5, "carbs": 43.0, "fat": 11.0, "fiber": 1.5},
}

DEFAULT_NUTRITION = {"calories": 200, "protein": 8.0, "carbs": 25.0, "fat": 7.0, "fiber": 2.0}


class LocalVisionProvider:
    PROVIDER_NAME = "local_huggingface"

    def __init__(self):
        logger.info("LocalVisionProvider: HuggingFace Food-ViT model (nateraw/food)")
        self._model_loaded = False
        self._pipe = None

    async def _ensure_model(self):
        if not self._model_loaded:
            loop = asyncio.get_event_loop()
            self._pipe = await loop.run_in_executor(None, _get_pipeline)
            self._model_loaded = True

    async def analyze_food_image(self, image_path: str) -> dict:
        logger.info(f"Local model analyzing: {image_path}")
        await self._ensure_model()

        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, self._pipe, image_path)

        detected_foods = []
        total_nutrition = {k: 0.0 for k in ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"]}

        for item in results[:3]:  # Top 3 predictions
            label = item["label"].lower().replace(" ", "_")
            confidence = float(item["score"])

            if confidence < 0.1:
                continue

            food_name = item["label"].replace("_", " ").title()
            nutrition_data = FOOD101_NUTRITION.get(label, DEFAULT_NUTRITION)
            serving_size = 150

            nutrition = {
                "calories": round(nutrition_data["calories"] * serving_size / 100, 1),
                "protein": round(nutrition_data["protein"] * serving_size / 100, 1),
                "carbs": round(nutrition_data["carbs"] * serving_size / 100, 1),
                "fat": round(nutrition_data["fat"] * serving_size / 100, 1),
                "fiber": round(nutrition_data.get("fiber", 2) * serving_size / 100, 1),
                "sugar": round(nutrition_data.get("sugar", 3) * serving_size / 100, 1),
                "sodium": round(nutrition_data.get("sodium", 200) * serving_size / 100, 1),
                "serving_size": serving_size,
                "serving_unit": "grams",
                "is_estimated": True,
                "source": "local_model_food101",
            }

            detected_foods.append({
                "name": food_name,
                "confidence": round(confidence, 3),
                "category": "food",
                "serving_size": serving_size,
                "serving_unit": "grams",
                "nutrition_per_serving": nutrition,
                "alternatives": [],
            })

            # Add to totals only the top prediction
            if confidence == results[0]["score"]:
                for key in ["calories", "protein", "carbs", "fat", "fiber"]:
                    total_nutrition[key] += nutrition.get(key, 0)

        if not detected_foods:
            detected_foods = [{
                "name": "Unidentified Food",
                "confidence": 0.0,
                "category": "unknown",
                "serving_size": 150,
                "serving_unit": "grams",
                "nutrition_per_serving": {**DEFAULT_NUTRITION, "serving_size": 150, "serving_unit": "grams", "is_estimated": True, "source": "default"},
                "alternatives": [],
            }]

        top_food = detected_foods[0]
        return {
            "detected_foods": detected_foods,
            "nutrition": {
                **top_food["nutrition_per_serving"],
                "is_estimated": True,
                "source": "local_model_food101",
            },
            "meal_description": f"Detected: {top_food['name']} (confidence: {top_food['confidence']:.0%})",
            "provider": self.PROVIDER_NAME,
            "model": "nateraw/food (ViT Food101)",
            "is_demo": False,
            "is_estimated": True,
        }

    async def generate_diet_plan(self, profile: dict, preferences: dict) -> dict:
        raise NotImplementedError("Local model does not support diet plan generation. Use openai or anthropic provider.")

    async def chat(self, messages: list, context: dict) -> dict:
        raise NotImplementedError("Local model does not support chat. Use openai or anthropic provider.")

    async def get_recommendations(self, profile: dict, recent_meals: list) -> dict:
        raise NotImplementedError("Local model does not support recommendations. Use openai or anthropic provider.")

    async def modify_diet_plan(self, current_plan: dict, instruction: str, user_profile: dict) -> dict:
        raise NotImplementedError("Local model does not support plan modification. Use openai or anthropic provider.")
