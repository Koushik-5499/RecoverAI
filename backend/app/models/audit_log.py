from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String) # e.g. "PAYMENT", "RECOVERY_ACTION"
    entity_id = Column(Integer)
    action = Column(String) # e.g. "AI_ANALYSIS_REQUESTED", "POLICY_REJECTED", "ACTION_EXECUTED"
    details = Column(String) # JSON string with more details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
