from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Resolve .env relative to this file (backend/.env), not the CWD
_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "RecoverAI"
    app_env: str = "development"
    mock_mode: bool = True

    # Database
    database_url: str = "sqlite:///./recoverai.db"

    # Security
    secret_key: str = "your-super-secret-key-change-me"

    # External APIs
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    razorpay_webhook_secret: Optional[str] = None
    gemini_api_key: Optional[str] = None

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @model_validator(mode="after")
    def validate_gemini_key(self) -> "Settings":
        """Warn clearly if GEMINI_API_KEY is missing."""
        key = self.gemini_api_key
        if not key:
            logger.warning(
                "GEMINI_API_KEY is NOT set in %s. "
                "AI Analysis will fall back to mock/heuristic mode. "
                "Add GEMINI_API_KEY=<your-key> to backend/.env to enable live AI.",
                _ENV_FILE,
            )
        return self


settings = Settings()
