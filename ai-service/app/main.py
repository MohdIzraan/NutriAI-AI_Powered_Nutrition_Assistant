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
        logger.warning(
            "⚠️  DEMO MODE: All AI responses are pre-configured samples."
        )

    try:
        from app.core.providers import AIProviderFactory
        AIProviderFactory.get_vision_provider()
        AIProviderFactory.get_llm_provider()
        logger.info("✅ AI providers initialised successfully")
    except Exception as e:
        logger.error(f"⛔ Provider initialisation failed: {e}")
        if settings.is_production():
            raise

    yield

    logger.info("🛑 NutriAI AI Service shutting down")


# FastAPI App 
app = FastAPI(
    title="NutriAI — AI Service",
    description="AI-powered food recognition and diet planning.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware 
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
app.include_router(food.router, prefix="/ai/food", tags=["Food Recognition"])
app.include_router(diet.router, prefix="/ai/diet", tags=["Diet Planning"])
app.include_router(chat.router, prefix="/ai",      tags=["Chat & Recommendations"])


# Health Check 
@app.get("/health", tags=["Health"])
async def health_check():
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