from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.payment import Payment, PaymentStatus
from ..schemas.payment import PaymentResponse
from ..services.razorpay_service import razorpay_service
from ..models.audit_log import AuditLog
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CreateOrderRequest(BaseModel):
    payment_id: int

class VerifyPaymentRequest(BaseModel):
    payment_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.get("", response_model=List[PaymentResponse])
def get_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/create-order")
def create_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == request.payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    try:
        # Note: In a real flow, you might want to adjust the amount if offering a discount
        order = razorpay_service.create_order(
            amount=payment.amount,
            currency=payment.currency,
            receipt=f"retry_{payment.id}",
            notes={"payment_id": str(payment.id)}
        )
        return {"order_id": order["id"]}
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@router.post("/verify")
def verify_payment(request: VerifyPaymentRequest, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == request.payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    is_valid = razorpay_service.verify_payment_signature(
        request.razorpay_order_id,
        request.razorpay_payment_id,
        request.razorpay_signature
    )

    if not is_valid:
        # Log failure
        log = AuditLog(
            entity_type="PAYMENT",
            entity_id=payment.id,
            action="PAYMENT_VERIFICATION_FAILED",
            details=json.dumps({"error": "Invalid signature"})
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Payment succeeded
    payment.status = PaymentStatus.RECOVERED
    payment.transaction_id = request.razorpay_payment_id
    
    log = AuditLog(
        entity_type="PAYMENT",
        entity_id=payment.id,
        action="PAYMENT_RECOVERED",
        details=json.dumps({"razorpay_payment_id": request.razorpay_payment_id})
    )
    db.add(log)
    db.commit()

    return {"status": "success"}
