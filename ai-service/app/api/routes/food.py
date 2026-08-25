import time
from pathlib import Path
import tempfile
import os
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from loguru import logger
from app.core.providers import AIProviderFactory
from app.schemas.food import FoodAnalysisResponse

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10MB


@router.post("/analyze", response_model=FoodAnalysisResponse)
async def analyze_food(
    image: UploadFile = File(..., description="Food image (JPG, PNG, or WEBP)"),
    user_id: str = Form(None, description="Optional user ID for logging"),
):
    """
    Analyze a food image using AI computer vision.
    
    - Validates image format and size
    - Runs AI food recognition
    - Returns detected foods with confidence scores and estimated nutrition
    """
    start_time = time.time()

    # Validate content type
    content_type = image.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type: {content_type}. Supported: JPG, PNG, WEBP",
        )

    # Read and validate file size
    content = await image.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Maximum size: 10MB, got: {len(content) / 1024 / 1024:.1f}MB",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty image file provided")

    # Save to temp file for processing
    suffix = Path(image.filename or "image.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        logger.info(f"Analyzing food image: {image.filename} ({len(content)} bytes), user: {user_id}")

        provider = AIProviderFactory.get_vision_provider()
        result = await provider.analyze_food_image(tmp_path)

        processing_ms = int((time.time() - start_time) * 1000)
        result["processing_time_ms"] = processing_ms

        logger.info(
            f"Food analysis complete in {processing_ms}ms. "
            f"Provider: {result.get('provider')}, "
            f"Foods: {[f['name'] for f in result.get('detected_foods', [])]}"
        )

        return FoodAnalysisResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Food analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {str(e)}")
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
