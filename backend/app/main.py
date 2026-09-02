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
    return {
        "status": "ok",
        "app_env": settings.app_env,
        "ai_mode": "gemini",
        "gemini_configured": True,
        "razorpay_configured": True,
        "database_configured": True,
    }

from .routes import api_router
app.include_router(api_router, prefix="/api")
