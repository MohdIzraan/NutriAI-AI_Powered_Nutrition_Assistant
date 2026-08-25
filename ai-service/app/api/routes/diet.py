from fastapi import APIRouter, HTTPException
from loguru import logger
from app.core.providers import AIProviderFactory
from app.schemas.diet import DietGenerationRequest, DietPlanResponse, ModifyDietRequest

router = APIRouter()


@router.post("/generate", response_model=DietPlanResponse)
async def generate_diet_plan(request: DietGenerationRequest):
    """
    Generate a personalized 7-day diet plan using AI.
    
    Takes user profile (age, weight, goals, region, budget, dietary restrictions)
    and generates a complete meal plan with regional food preferences.
    """
    try:
        logger.info(
            f"Generating diet plan: goal={request.profile.primaryGoal}, "
            f"diet={request.profile.dietType}, "
            f"region={request.profile.city}, {request.profile.state}"
        )

        provider = AIProviderFactory.get_llm_provider()
        result = await provider.generate_diet_plan(
            profile=request.profile.model_dump(),
            preferences=request.preferences.model_dump() if request.preferences else {},
        )

        logger.info(f"Diet plan generated. Provider: {result.get('provider')}")
        return DietPlanResponse(**result)

    except NotImplementedError as e:
        raise HTTPException(
            status_code=501,
            detail=f"Diet generation not supported by current provider. {str(e)}",
        )
    except Exception as e:
        logger.error(f"Diet generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Diet plan generation failed: {str(e)}")


@router.post("/modify", response_model=DietPlanResponse)
async def modify_diet_plan(request: ModifyDietRequest):
    """
    Modify an existing diet plan using natural language instructions.
    
    Examples:
    - "Replace paneer with tofu"
    - "Make lunches cheaper"
    - "Use more local Uttar Pradesh foods"
    - "Add more protein to breakfast"
    """
    try:
        if not request.instruction or len(request.instruction.strip()) < 5:
            raise HTTPException(status_code=400, detail="Please provide a more specific modification instruction")

        logger.info(f"Modifying diet plan: {request.instruction}")

        provider = AIProviderFactory.get_llm_provider()
        result = await provider.modify_diet_plan(
            current_plan=request.current_plan,
            instruction=request.instruction,
            user_profile=request.user_profile or {},
        )

        return DietPlanResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Diet modification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Diet plan modification failed: {str(e)}")
