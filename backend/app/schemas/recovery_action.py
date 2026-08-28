from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.recovery_action import ActionType, ActionStatus

class RecoveryActionBase(BaseModel):
    action_type: ActionType
    ai_confidence_score: int
    ai_reasoning: str

class RecoveryActionCreate(RecoveryActionBase):
    payment_id: int

class RecoveryActionResponse(RecoveryActionBase):
    id: int
    payment_id: int
    status: ActionStatus
    executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
