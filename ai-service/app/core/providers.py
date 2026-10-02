from loguru import logger
from app.core.config import settings

class AIProviderFactory:
    _vision_instance = None
    _llm_instance    = None
    _demo_instance   = None

    @classmethod
    def _demo(cls):
        if cls._demo_instance is None:
            from app.services.providers.demo import DemoProvider
            cls._demo_instance = DemoProvider()
        return cls._demo_instance

    @classmethod
    def _create_gemini(cls):
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is missing. Add it to Render environment variables."
            )
        from app.services.providers.gemini_provider import GeminiProvider
        return GeminiProvider(
            api_key      = settings.GEMINI_API_KEY,
            vision_model = settings.GEMINI_VISION_MODEL,
            chat_model   = settings.GEMINI_CHAT_MODEL,
        )

    @classmethod
    def get_vision_provider(cls):
        # Return cached instance if available
        if cls._vision_instance is not None:
            return cls._vision_instance

        name = "demo" if settings.is_demo() else settings.VISION_PROVIDER.lower()
        logger.info(f"Initialising vision provider: {name}")

        if name == "demo":
            cls._vision_instance = cls._demo()

        elif name == "gemini":
            try:
                cls._vision_instance = cls._create_gemini()
                logger.info("✅ Gemini vision provider ready")
            except Exception as e:
                logger.error(f"Gemini vision failed: {e}")
                logger.warning("Falling back to demo vision provider")
                cls._vision_instance = cls._demo()

        elif name == "local":
            try:
                from app.services.providers.local_vision import LocalVisionProvider
                cls._vision_instance = LocalVisionProvider()
                logger.info("✅ Local vision provider ready")
            except Exception as e:
                logger.error(f"Local vision failed: {e}")
                cls._vision_instance = cls._demo()

        elif name == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required.")
            from app.services.providers.openai_vision import OpenAIVisionProvider
            cls._vision_instance = OpenAIVisionProvider(
                api_key    = settings.OPENAI_API_KEY,
                model      = settings.OPENAI_MODEL,
                max_tokens = settings.OPENAI_MAX_TOKENS,
            )

        else:
            logger.warning(f"Unknown provider '{name}', using demo")
            cls._vision_instance = cls._demo()

        return cls._vision_instance

    @classmethod
    def get_llm_provider(cls):
        if cls._llm_instance is not None:
            return cls._llm_instance

        name = "demo" if settings.is_demo() else settings.LLM_PROVIDER.lower()
        logger.info(f"Initialising LLM provider: {name}")

        if name == "demo":
            cls._llm_instance = cls._demo()

        elif name == "gemini":
            try:
                cls._llm_instance = cls._create_gemini()
                logger.info("✅ Gemini LLM provider ready")
            except Exception as e:
                logger.error(f"Gemini LLM failed: {e}")
                logger.warning("Falling back to demo LLM provider")
                cls._llm_instance = cls._demo()

        elif name == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required.")
            from app.services.providers.openai_vision import OpenAIVisionProvider
            cls._llm_instance = OpenAIVisionProvider(
                api_key    = settings.OPENAI_API_KEY,
                model      = settings.OPENAI_MODEL,
                max_tokens = settings.OPENAI_MAX_TOKENS,
            )

        else:
            logger.warning(f"Unknown LLM provider '{name}', using demo")
            cls._llm_instance = cls._demo()

        return cls._llm_instance

    @classmethod
    def reset(cls):
        cls._vision_instance = None
        cls._llm_instance    = None
        cls._demo_instance   = None