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
    # Start instantly 
    # Gemini is initialized lazily on first real request
    logger.info("=" * 60)
    logger.info("🤖 NutriAI Python AI Service Starting")
    logger.info(f"   AI Mode:         {settings.AI_MODE.upper()}")
    logger.info(f"   Vision Provider: {settings.VISION_PROVIDER}")
    logger.info(f"   LLM Provider:    {settings.LLM_PROVIDER}")
    logger.info("   Providers:       Lazy init on first request")
    logger.info("=" * 60)
    logger.info("✅ Service started instantly — ready for requests")

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

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {
        "status":          "healthy",
        "service":         "nutriai-ai-service",
        "ai_mode":         settings.AI_MODE,
        "vision_provider": settings.VISION_PROVIDER,
        "llm_provider":    settings.LLM_PROVIDER,
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