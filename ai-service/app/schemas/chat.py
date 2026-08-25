from pydantic import BaseModel, Field
from typing import Optional, List, Any


class ChatMessage(BaseModel):
    role: str  # user | assistant | system
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Any] = None


class ChatResponse(BaseModel):
    message: str
    provider: str
    model: Optional[str] = None
    is_demo: bool = False
    tokens_used: Optional[int] = None


class RecommendationsRequest(BaseModel):
    profile: Optional[Any] = None
    recent_meals: List[Any] = Field(default_factory=list)


class Recommendation(BaseModel):
    type: str  # tip | food | substitution | warning
    title: str
    message: str
    priority: str = "normal"  # low | normal | high


class RecommendationsResponse(BaseModel):
    recommendations: List[Recommendation] = Field(default_factory=list)
    provider: str
    is_demo: bool = False
