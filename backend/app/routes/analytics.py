from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.payment import Payment, PaymentStatus

router = APIRouter()

@router.get("/revenue-at-risk")
def get_revenue_at_risk(db: Session = Depends(get_db)):
    # Calculate total revenue at risk (failed + pending recovery)
    total_at_risk = db.query(func.sum(Payment.amount)).filter(
        Payment.status.in_([PaymentStatus.FAILED, PaymentStatus.PENDING_RECOVERY])
    ).scalar() or 0.0

    recovered = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.RECOVERED
    ).scalar() or 0.0

    return {
        "revenue_at_risk": total_at_risk,
        "recovered_revenue": recovered
    }

@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    # Overall stats for the dashboard
    total_failed = db.query(Payment).filter(Payment.status == PaymentStatus.FAILED).count()
    total_recovered = db.query(Payment).filter(Payment.status == PaymentStatus.RECOVERED).count()
    
    # Simple success rate
    total = total_failed + total_recovered
    success_rate = (total_recovered / total * 100) if total > 0 else 0

    return {
        "total_failed_count": total_failed,
        "total_recovered_count": total_recovered,
        "recovery_success_rate": round(success_rate, 1)
    }
