"""
AI Provider Factory
Selects the right AI provider based on environment config.

Vision tasks  → VISION_PROVIDER setting
LLM tasks     → LLM_PROVIDER setting

You can mix providers:
  VISION_PROVIDER=gemini + LLM_PROVIDER=gemini
  VISION_PROVIDER=local  + LLM_PROVIDER=gemini
  VISION_PROVIDER=openai + LLM_PROVIDER=gemini
"""

from loguru import logger
from app.core.config import settings


class AIProviderFactory:
    _vision_instance = None
    _llm_instance    = None
    _demo_instance   = None

    # Demo singleton 
    @classmethod
    def _demo(cls):
        if cls._demo_instance is None:
            from app.services.providers.demo import DemoProvider
            cls._demo_instance = DemoProvider()
        return cls._demo_instance

    # Gemini singleton 
    @classmethod
    def _gemini(cls):
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is required when using gemini provider. "
                "Add GEMINI_API_KEY=your-key to ai-service/.env"
            )
        from app.services.providers.gemini_provider import GeminiProvider
        return GeminiProvider(
            api_key      = settings.GEMINI_API_KEY,
            vision_model = settings.GEMINI_VISION_MODEL,
            chat_model   = settings.GEMINI_CHAT_MODEL,
        )

    # Vision Provider 
    @classmethod
    def get_vision_provider(cls):
        if cls._vision_instance is not None:
            return cls._vision_instance

        # If master switch is demo, always use demo
        name = "demo" if settings.is_demo() else settings.VISION_PROVIDER.lower()
        logger.info(f"Initialising vision provider: {name}")

        if name == "demo":
            cls._vision_instance = cls._demo()

        elif name == "gemini":
            try:
                cls._vision_instance = cls._gemini()
                logger.info("✅ Gemini vision provider ready")
            except Exception as e:
                logger.error(f"Failed to init Gemini vision: {e}")
                logger.warning("Falling back to demo vision provider")
                cls._vision_instance = cls._demo()

        elif name == "local":
            try:
                from app.services.providers.local_vision import LocalVisionProvider
                cls._vision_instance = LocalVisionProvider()
                logger.info("✅ Local HuggingFace ViT vision provider ready")
            except Exception as e:
                logger.error(f"Failed to init local vision provider: {e}")
                logger.warning("Falling back to demo vision provider")
                cls._vision_instance = cls._demo()

        elif name == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY is required when VISION_PROVIDER=openai."
                )
            from app.services.providers.openai_vision import OpenAIVisionProvider
            cls._vision_instance = OpenAIVisionProvider(
                api_key    = settings.OPENAI_API_KEY,
                model      = settings.OPENAI_MODEL,
                max_tokens = settings.OPENAI_MAX_TOKENS,
            )
            logger.info(f"✅ OpenAI vision provider ready")

        elif name == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError(
                    "ANTHROPIC_API_KEY is required when VISION_PROVIDER=anthropic."
                )
            from app.services.providers.anthropic_vision import AnthropicVisionProvider
            cls._vision_instance = AnthropicVisionProvider(
                api_key      = settings.ANTHROPIC_API_KEY,
                vision_model = settings.ANTHROPIC_VISION_MODEL,
                chat_model   = settings.ANTHROPIC_CHAT_MODEL,
                max_tokens   = settings.ANTHROPIC_MAX_TOKENS,
            )
            logger.info("✅ Anthropic vision provider ready")

        else:
            logger.warning(
                f"Unknown VISION_PROVIDER '{name}', using demo"
            )
            cls._vision_instance = cls._demo()

        return cls._vision_instance

    # LLM Provider 
    @classmethod
    def get_llm_provider(cls):
        if cls._llm_instance is not None:
            return cls._llm_instance

        # If master switch is demo, always use demo
        name = "demo" if settings.is_demo() else settings.LLM_PROVIDER.lower()
        logger.info(f"Initialising LLM provider: {name}")

        if name == "demo":
            cls._llm_instance = cls._demo()

        elif name == "gemini":
            try:
                cls._llm_instance = cls._gemini()
                logger.info("✅ Gemini LLM provider ready")
            except Exception as e:
                logger.error(f"Failed to init Gemini LLM: {e}")
                logger.warning("Falling back to demo LLM provider")
                cls._llm_instance = cls._demo()

        elif name == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY is required when LLM_PROVIDER=openai."
                )
            from app.services.providers.openai_vision import OpenAIVisionProvider
            cls._llm_instance = OpenAIVisionProvider(
                api_key    = settings.OPENAI_API_KEY,
                model      = settings.OPENAI_MODEL,
                max_tokens = settings.OPENAI_MAX_TOKENS,
            )
            logger.info("✅ OpenAI LLM provider ready")

        elif name == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError(
                    "ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic."
                )
            from app.services.providers.anthropic_vision import AnthropicVisionProvider
            cls._llm_instance = AnthropicVisionProvider(
                api_key      = settings.ANTHROPIC_API_KEY,
                vision_model = settings.ANTHROPIC_VISION_MODEL,
                chat_model   = settings.ANTHROPIC_CHAT_MODEL,
                max_tokens   = settings.ANTHROPIC_MAX_TOKENS,
            )
            logger.info("✅ Anthropic LLM provider ready")

        else:
            logger.warning(
                f"Unknown LLM_PROVIDER '{name}', using demo"
            )
            cls._llm_instance = cls._demo()

        return cls._llm_instance

    # Reset (used in testing) 
    @classmethod
    def reset(cls):
        cls._vision_instance = None
        cls._llm_instance    = None
        cls._demo_instance   = None