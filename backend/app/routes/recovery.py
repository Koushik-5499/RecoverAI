from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.recovery_action import RecoveryAction
from ..schemas.recovery_action import RecoveryActionResponse
from ..services.recovery_service import recovery_service

router = APIRouter()

@router.get("/actions", response_model=List[RecoveryActionResponse])
def get_actions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    actions = db.query(RecoveryAction).order_by(RecoveryAction.created_at.desc()).offset(skip).limit(limit).all()
    return actions

@router.post("/analyze/{payment_id}")
def analyze_payment(payment_id: int, db: Session = Depends(get_db)):
    result = recovery_service.analyze_payment(db, payment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Payment not found or analysis failed")
    if isinstance(result, dict):
        status = result.get("status")
        if status == "rejected":
            return result
        if status == "error":
            raise HTTPException(
                status_code=503,
                detail={"reason": result.get("reason"), "detail": result.get("detail")}
            )
    return {"status": "success", "action_id": result.id}

@router.post("/execute/{action_id}")
def execute_action(action_id: int, db: Session = Depends(get_db)):
    result = recovery_service.execute_action(db, action_id)
    if not result:
        raise HTTPException(status_code=400, detail="Action not found or already executed")
    return {"status": "success", "executed": result.status == "EXECUTED"}
