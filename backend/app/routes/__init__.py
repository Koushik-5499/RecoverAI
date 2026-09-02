from fastapi import APIRouter

# We will import and gather all routers here
from .payments import router as payments_router
from .recovery import router as recovery_router
from .analytics import router as analytics_router
from .audit import router as audit_router
from .webhooks import router as webhooks_router

api_router = APIRouter()
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(recovery_router, prefix="/recovery", tags=["Recovery"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(audit_router, prefix="/audit-logs", tags=["Audit"])
api_router.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])

