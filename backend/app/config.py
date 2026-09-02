from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Resolve .env relative to this file (backend/.env), not the CWD
_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "RecoverAI"
    app_env: str = "production"

    # Database
    database_url: str

    # Security
    secret_key: str = "your-super-secret-key-change-me"

    # External APIs
    razorpay_key_id: str
    razorpay_key_secret: str
    razorpay_webhook_secret: Optional[str] = None
    gemini_api_key: str

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()
