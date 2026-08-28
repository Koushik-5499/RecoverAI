from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.payment import PaymentStatus

class PaymentBase(BaseModel):
    transaction_id: str
    customer_id: str
    customer_email: str
    amount: float
    currency: str = "USD"
    failure_code: Optional[str] = None
    failure_reason: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    status: PaymentStatus
    recovery_retries: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
