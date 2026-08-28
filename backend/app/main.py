from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
import logging

# Import models so they are registered with SQLAlchemy
from . import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables (For local dev, usually we'd use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="AI revenue recovery platform for merchants",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In prod, specify frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    from .services.ai_service import ai_service
    return {
        "status": "ok",
        "app_env": settings.app_env,
        "mock_mode": settings.mock_mode,
        "ai_mode": "gemini" if ai_service.is_live else "mock",
        "gemini_configured": bool(settings.gemini_api_key),
    }

from .routes import api_router
app.include_router(api_router, prefix="/api")

# Seed data on startup
@app.on_event("startup")
def startup_event():
    # Validate Gemini configuration
    if not settings.gemini_api_key:
        logger.warning(
            "GEMINI_API_KEY is not set in environment. "
            "AI Analysis will run in mock/demo mode. "
            "Set GEMINI_API_KEY in backend/.env to enable live AI."
        )
    else:
        logger.info("GEMINI_API_KEY detected. AI Analysis is configured for live mode.")

    if settings.mock_mode:
        logger.info("MOCK_MODE is True — seeding mock data if not already present.")
        from .database import SessionLocal
        from .utils.mock_data import seed_mock_data
        db = SessionLocal()
        try:
            seed_mock_data(db)
        finally:
            db.close()
