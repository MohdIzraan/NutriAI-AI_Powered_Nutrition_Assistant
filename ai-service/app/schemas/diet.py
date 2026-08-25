from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any


class UserProfile(BaseModel):
    model_config = ConfigDict(extra='allow')

    age: Optional[int] = None
    gender: Optional[str] = None
    heightCm: Optional[float] = None
    weightKg: Optional[float] = None
    activityLevel: Optional[str] = "moderately_active"
    primaryGoal: Optional[str] = "general_wellness"
    dietType: Optional[str] = "non_vegetarian"
    allergies: List[str] = Field(default_factory=list)
    avoidFoods: List[str] = Field(default_factory=list)
    favoriteFoods: List[str] = Field(default_factory=list)
    cuisinePreferences: List[str] = Field(default_factory=list)
    country: str = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    dailyBudgetINR: Optional[float] = None
    dailyCalorieTarget: Optional[float] = 2000
    dailyProteinTarget: Optional[float] = 60
    mealsPerDay: int = 3


class DietPreferences(BaseModel):
    model_config = ConfigDict(extra='allow')

    additional_instructions: Optional[str] = None


class DietGenerationRequest(BaseModel):
    profile: UserProfile
    preferences: Optional[DietPreferences] = None


class FoodEntry(BaseModel):
    name: str
    quantity: str
    calories: float = 0.0
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    approximate_cost_inr: Optional[float] = None
    alternatives: List[str] = Field(default_factory=list)
    is_regional: bool = False


class DietMeal(BaseModel):
    meal_type: str
    time: Optional[str] = None
    foods: List[FoodEntry] = Field(default_factory=list)
    total_calories: float = 0.0
    total_protein: float = 0.0
    total_carbs: float = 0.0
    total_fat: float = 0.0
    total_cost_inr: Optional[float] = None
    notes: Optional[str] = None


class DietDay(BaseModel):
    day_number: int
    day_name: str
    meals: List[DietMeal] = Field(default_factory=list)
    total_calories: float = 0.0
    total_protein: float = 0.0
    total_carbs: float = 0.0
    total_fat: float = 0.0
    total_cost_inr: Optional[float] = None


class DietPlanResponse(BaseModel):
    title: str
    description: Optional[str] = None
    days: List[DietDay] = Field(default_factory=list)
    provider: str
    model: Optional[str] = None
    is_demo: bool = False
    disclaimer: str = (
        "This AI-generated diet plan provides general wellness "
        "guidance only. Consult a registered dietitian for medical "
        "dietary advice. Prices are approximate and may vary by location."
    )


class ModifyDietRequest(BaseModel):
    current_plan: Any
    instruction: str
    user_profile: Optional[Any] = None