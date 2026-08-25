from fastapi import APIRouter, HTTPException
from loguru import logger
from app.core.providers import AIProviderFactory
from app.schemas.chat import (
    ChatRequest, ChatResponse,
    RecommendationsRequest, RecommendationsResponse
)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI nutrition assistant.
    Supports context-aware responses about diet plans,
    food substitutions, and regional food recommendations.
    """
    try:
        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty"
            )

        provider = AIProviderFactory.get_llm_provider()
        result = await provider.chat(
            messages=[m.model_dump() for m in request.messages],
            context=request.context or {},
        )

        logger.info(
            "Chat response generated. Provider: {}",
            result.get("provider")
        )
        return ChatResponse(**result)

    except HTTPException:
        raise
    except NotImplementedError as e:
        raise HTTPException(
            status_code=501,
            detail=f"Chat not supported by current provider: {str(e)}",
        )
    except Exception as e:
        # Use repr() to safely log errors that contain { } characters
        logger.error("Chat error: {}", repr(e))
        raise HTTPException(
            status_code=500,
            detail="AI chat service is currently unavailable. Please try again."
        )


@router.post("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(request: RecommendationsRequest):
    """Get personalised AI nutrition recommendations."""
    try:
        provider = AIProviderFactory.get_llm_provider()
        result = await provider.get_recommendations(
            profile=request.profile or {},
            recent_meals=request.recent_meals or [],
        )
        return RecommendationsResponse(**result)

    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        # Use repr() to safely log errors that contain { } characters
        logger.error("Recommendations error: {}", repr(e))
        # Return safe fallback instead of crashing
        return RecommendationsResponse(
            recommendations=[{
                "type":     "tip",
                "title":    "Stay Consistent",
                "message":  "Log your meals regularly for better AI recommendations.",
                "priority": "normal",
            }],
            provider="fallback",
            is_demo=False,
        )