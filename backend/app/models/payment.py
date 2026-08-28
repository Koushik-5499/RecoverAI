from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum
from sqlalchemy.sql import func
import enum
from ..database import Base

class PaymentStatus(str, enum.Enum):
    FAILED = "FAILED"
    RECOVERED = "RECOVERED"
    PENDING_RECOVERY = "PENDING_RECOVERY"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    customer_id = Column(String, index=True)
    customer_email = Column(String)
    amount = Column(Float)
    currency = Column(String, default="USD")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.FAILED)
    failure_code = Column(String)
    failure_reason = Column(String)
    recovery_retries = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
