from sqlalchemy.orm import Session
from ..models.payment import Payment, PaymentStatus
from ..models.recovery_action import RecoveryAction, ActionStatus, ActionType
from ..models.audit_log import AuditLog
from .ai_service import ai_service
from .policy_engine import policy_engine
from .razorpay_service import razorpay_service
import json
import logging

logger = logging.getLogger(__name__)

class RecoveryService:
    def analyze_payment(self, db: Session, payment_id: int):
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            return None

        # Call AI for recommendation
        try:
            recommendation = ai_service.analyze_payment_failure(payment)
        except RuntimeError as e:
            # OpenAI failed — log it and return a controlled error (do NOT execute any action)
            logger.error(f"AI analysis failed for payment {payment_id}: {e}")
            self._log_audit(db, "PAYMENT", payment.id, "AI_ANALYSIS_FAILED", {
                "error": str(e),
                "payment_id": payment_id,
            })
            return {"status": "error", "reason": "AI_UNAVAILABLE", "detail": str(e)}

        # Policy Engine Evaluation
        evaluation = policy_engine.evaluate(payment, recommendation)

        audit_action = "AI_ANALYSIS_COMPLETED"
        audit_details = {
            "recommendation": recommendation,
            "policy_evaluation": evaluation,
            "ai_mode": "live" if ai_service.is_live else "mock",
        }

        if not evaluation["approved"]:
            if "override_action" in evaluation:
                final_action_type = evaluation["override_action"]
                audit_action = "POLICY_ESCALATED"
            else:
                # Log rejection and return
                self._log_audit(db, "PAYMENT", payment.id, "POLICY_REJECTED", audit_details)
                return {"status": "rejected", "reason": evaluation["reason"]}
        else:
            final_action_type = evaluation["final_action"]

        # Save the action
        action = RecoveryAction(
            payment_id=payment.id,
            action_type=final_action_type,
            status=ActionStatus.RECOMMENDED,
            ai_confidence_score=recommendation.get("confidence_score", 0),
            ai_reasoning=recommendation.get("reasoning", "")
        )
        db.add(action)
        db.commit()
        db.refresh(action)

        # Log
        self._log_audit(db, "RECOVERY_ACTION", action.id, audit_action, audit_details)

        return action

    def execute_action(self, db: Session, action_id: int):
        action = db.query(RecoveryAction).filter(RecoveryAction.id == action_id).first()
        if not action or action.status != ActionStatus.RECOMMENDED:
            return None

        payment = db.query(Payment).filter(Payment.id == action.payment_id).first()

        success = False
        if action.action_type == ActionType.SMART_RETRY:
            success = razorpay_service.initiate_retry(payment)
        elif action.action_type == ActionType.EMAIL_REMINDER:
            # Mock email sending
            success = True
        elif action.action_type == ActionType.DISCOUNT_OFFER:
            # Mock discount logic
            success = True
        elif action.action_type == ActionType.MANUAL_REVIEW:
            # Manual review doesn't auto execute
            success = False

        if success:
            action.status = ActionStatus.EXECUTED
            payment.recovery_retries += 1
            if action.action_type == ActionType.SMART_RETRY:
                payment.status = PaymentStatus.RECOVERED
        else:
            action.status = ActionStatus.FAILED

        db.commit()
        
        self._log_audit(db, "RECOVERY_ACTION", action.id, "ACTION_EXECUTED" if success else "ACTION_FAILED", {"action_type": action.action_type.value, "success": success})

        return action

    def _log_audit(self, db: Session, entity_type: str, entity_id: int, action: str, details: dict):
        log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            details=json.dumps(details)
        )
        db.add(log)
        db.commit()

recovery_service = RecoveryService()
