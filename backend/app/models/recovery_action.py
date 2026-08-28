from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class ActionType(str, enum.Enum):
    SMART_RETRY = "SMART_RETRY"
    EMAIL_REMINDER = "EMAIL_REMINDER"
    DISCOUNT_OFFER = "DISCOUNT_OFFER"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class ActionStatus(str, enum.Enum):
    RECOMMENDED = "RECOMMENDED"
    EXECUTED = "EXECUTED"
    FAILED = "FAILED"
    REJECTED = "REJECTED"

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"))
    action_type = Column(Enum(ActionType))
    status = Column(Enum(ActionStatus), default=ActionStatus.RECOMMENDED)
    ai_confidence_score = Column(Integer) # 0-100
    ai_reasoning = Column(String)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    payment = relationship("Payment", backref="recovery_actions")
