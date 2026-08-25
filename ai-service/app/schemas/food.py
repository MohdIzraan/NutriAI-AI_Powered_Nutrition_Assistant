from pydantic import BaseModel, Field
from typing import Optional, List


class NutritionInfo(BaseModel):
    calories: float = 0.0
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    fiber: float = 0.0
    sugar: float = 0.0
    sodium: float = 0.0
    serving_size: float = 100.0
    serving_unit: str = "grams"
    is_estimated: bool = True
    source: str = "ai_estimated"


class DetectedFood(BaseModel):
    name: str
    confidence: Optional[float] = None
    category: Optional[str] = None
    serving_size: float = 100.0
    serving_unit: str = "grams"
    nutrition_per_serving: Optional[NutritionInfo] = None
    alternatives: List[str] = Field(default_factory=list)


class FoodAnalysisResponse(BaseModel):
    detected_foods: List[DetectedFood] = Field(default_factory=list)
    nutrition: Optional[NutritionInfo] = None
    meal_description: Optional[str] = None
    provider: str = "unknown"
    model: Optional[str] = None
    is_demo: bool = False
    is_estimated: bool = True
    processing_time_ms: Optional[int] = None
    disclaimer: str = (
        "Nutritional values are AI-estimated. "
        "Actual values depend on exact ingredients, preparation method, and portion size."
    )
    error: Optional[str] = None
