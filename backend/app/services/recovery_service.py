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
        action_error = None
        
        if action.action_type == ActionType.SMART_RETRY:
            # We don't do automatic retry without frontend checkout flow, so it fails or initiates
            success = razorpay_service.initiate_retry(payment)
            if not success:
                action_error = "SMART_RETRY requires user interaction or stored token."
        elif action.action_type == ActionType.EMAIL_REMINDER:
            success = False
            action_error = "NOT_CONFIGURED: Email provider not integrated."
        elif action.action_type == ActionType.DISCOUNT_OFFER:
            success = False
            action_error = "NOT_CONFIGURED: Discount engine not integrated."
        elif action.action_type == ActionType.MANUAL_REVIEW:
            success = False
            action_error = "Manual review pending."

        if success:
            action.status = ActionStatus.EXECUTED
            payment.recovery_retries += 1
            if action.action_type == ActionType.SMART_RETRY:
                payment.status = PaymentStatus.RECOVERED
        else:
            action.status = ActionStatus.FAILED

        db.commit()
        
        audit_details = {"action_type": action.action_type.value, "success": success}
        if action_error:
            audit_details["error"] = action_error

        self._log_audit(db, "RECOVERY_ACTION", action.id, "ACTION_EXECUTED" if success else "ACTION_FAILED", audit_details)

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
