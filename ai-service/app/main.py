"""
NutriAI Python FastAPI Service
AI-powered food recognition, diet planning, and nutrition analysis with Google Gemini support.
"""

import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.routes import food, diet, chat
from app.core.config import settings

# Logging Setup 
logger.remove()
logger.add(
    sys.stdout,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan> - "
        "<level>{message}</level>"
    ),
    level=settings.LOG_LEVEL,
    colorize=True,
)


# Startup and Shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("🤖 NutriAI Python AI Service Starting")
    logger.info(f"   AI Mode:         {settings.AI_MODE.upper()}")
    logger.info(f"   Vision Provider: {settings.VISION_PROVIDER}")
    logger.info(f"   LLM Provider:    {settings.LLM_PROVIDER}")
    logger.info("=" * 60)

    if settings.is_demo():
        logger.warning("⚠️  DEMO MODE: Using sample responses.")

    try:
        from app.core.providers import AIProviderFactory
        AIProviderFactory.get_vision_provider()
        AIProviderFactory.get_llm_provider()
        logger.info("✅ AI providers initialised successfully")
    except Exception as e:
        logger.error(f"⛔ Provider initialisation failed: {e}")
        if settings.is_production():
            raise

    # Start keep-alive task in production
    import asyncio
    import httpx
    import os

    keep_alive_task = None

    async def keep_alive():
        """Ping self every 10 minutes to prevent Render free tier sleeping."""
        port = int(os.environ.get("PORT", 8000))
        url  = f"http://localhost:{port}/health"
        while True:
            await asyncio.sleep(10 * 60)  # Wait 10 minutes
            try:
                async with httpx.AsyncClient() as client:
                    await client.get(url, timeout=10)
                logger.debug("Self keep-alive ping sent")
            except Exception:
                logger.debug("Self keep-alive ping failed")

    if settings.is_production():
        keep_alive_task = asyncio.create_task(keep_alive())
        logger.info("✅ Keep-alive task started")

    yield

    if keep_alive_task:
        keep_alive_task.cancel()

    logger.info("🛑 NutriAI AI Service shutting down")
        


# FastAPI App 
app = FastAPI(
    title="NutriAI — AI Service",
    description="""
## NutriAI Python AI Service

Provides AI-powered:
- **Food Recognition** — Computer vision analysis of food images
- **Diet Planning** — Personalised 7-day regional diet plans
- **Chat** — AI nutrition assistant
- **Recommendations** — Personalised wellness suggestions

### Supported AI Providers
- `gemini`    — Google Gemini 1.5 Flash (FREE)
- `demo`      — Development mode (no API keys needed)
- `local`     — HuggingFace ViT Food101 model (FREE, offline)
- `openai`    — GPT-4o Vision (paid)
- `anthropic` — Claude 3.5 Vision (paid)

Configure via environment variables in ai-service/.env
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes 
app.include_router(
    food.router,
    prefix="/ai/food",
    tags=["Food Recognition"],
)
app.include_router(
    diet.router,
    prefix="/ai/diet",
    tags=["Diet Planning"],
)
app.include_router(
    chat.router,
    prefix="/ai",
    tags=["Chat & Recommendations"],
)


# Health Check 
@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check."""
    return {
        "status":          "healthy",
        "service":         "nutriai-ai-service",
        "ai_mode":         settings.AI_MODE,
        "vision_provider": settings.get_vision_provider(),
        "llm_provider":    settings.get_llm_provider(),
        "is_demo":         settings.is_demo(),
    }


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "NutriAI Python AI Service",
        "version": "1.0.0",
        "status":  "running",
        "docs":    "/docs",
    }
