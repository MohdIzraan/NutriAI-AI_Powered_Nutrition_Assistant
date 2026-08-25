from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # AI Mode
    AI_MODE: str = "demo"

    # Vision Provider
    VISION_PROVIDER: str = "demo"

    # LLM Provider
    LLM_PROVIDER: str = "demo"

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 4096

    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_VISION_MODEL: str = "claude-3-5-sonnet-20241022"
    ANTHROPIC_CHAT_MODEL: str = "claude-3-5-sonnet-20241022"
    ANTHROPIC_MAX_TOKENS: int = 4096

    # Google Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_VISION_MODEL: str = "gemini-3.6-flash"
    GEMINI_CHAT_MODEL: str = "gemini-3.6-flash"

    # USDA
    USDA_API_KEY: Optional[str] = None

    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Logging
    LOG_LEVEL: str = "INFO"

    # HuggingFace
    HF_HOME: str = "./model_cache"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

    def is_production(self) -> bool:
        return self.AI_MODE.lower() == "production"

    def is_demo(self) -> bool:
        return self.AI_MODE.lower() == "demo"

    def get_vision_provider(self) -> str:
        if self.is_demo():
            return "demo"
        return self.VISION_PROVIDER.lower()

    def get_llm_provider(self) -> str:
        if self.is_demo():
            return "demo"
        return self.LLM_PROVIDER.lower()


settings = Settings()