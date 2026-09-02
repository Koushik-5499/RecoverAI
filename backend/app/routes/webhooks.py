from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.razorpay_service import razorpay_service
from ..models.payment import Payment, PaymentStatus
from ..models.audit_log import AuditLog
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("x-razorpay-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    try:
        # Verify signature
        is_valid = razorpay_service.verify_webhook_signature(body.decode('utf-8'), signature)
        if not is_valid:
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
    except ValueError as e:
        logger.error(f"Webhook verification configuration error: {e}")
        raise HTTPException(status_code=500, detail="Server configuration error")
        
    payload = json.loads(body)
    event = payload.get("event")
    
    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        payment_id = notes.get("payment_id")
        
        if payment_id:
            payment = db.query(Payment).filter(Payment.id == int(payment_id)).first()
            if payment and payment.status != PaymentStatus.RECOVERED:
                payment.status = PaymentStatus.RECOVERED
                payment.transaction_id = payment_entity.get("id")
                
                log = AuditLog(
                    entity_type="PAYMENT",
                    entity_id=payment.id,
                    action="WEBHOOK_PAYMENT_RECOVERED",
                    details=json.dumps({"razorpay_payment_id": payment.transaction_id})
                )
                db.add(log)
                db.commit()
    
    # We must acknowledge the webhook with a 200 OK
    return {"status": "ok"}
