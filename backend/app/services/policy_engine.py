from ..models.payment import Payment
from ..models.recovery_action import RecoveryAction, ActionType, ActionStatus
import json

class PolicyEngine:
    MAX_RETRIES = 2
    ALLOWED_ACTIONS = [ActionType.SMART_RETRY, ActionType.EMAIL_REMINDER, ActionType.DISCOUNT_OFFER, ActionType.MANUAL_REVIEW]
    HIGH_VALUE_THRESHOLD = 1000.0

    def evaluate(self, payment: Payment, recommended_action: dict) -> dict:
        """
        Validates the AI recommendation against deterministic policies.
        Returns the evaluation result and audit log details.
        """
        action_type_str = recommended_action.get("action_type")
        
        try:
            action_type = ActionType(action_type_str)
        except ValueError:
            return {
                "approved": False,
                "reason": "UNKNOWN_ACTION",
                "details": f"Action {action_type_str} is not recognized."
            }

        # 1. Stop recovery after successful payment
        if payment.status == "RECOVERED":
            return {
                "approved": False,
                "reason": "ALREADY_RECOVERED",
                "details": "Payment has already been recovered."
            }

        # 2. Maximum retries
        if payment.recovery_retries >= self.MAX_RETRIES:
            return {
                "approved": False,
                "reason": "MAX_RETRIES_EXCEEDED",
                "details": f"Payment has reached the maximum of {self.MAX_RETRIES} retries."
            }
        
        # 3. Escalate high-value cases
        if payment.amount >= self.HIGH_VALUE_THRESHOLD and action_type != ActionType.MANUAL_REVIEW:
            return {
                "approved": False,
                "reason": "HIGH_VALUE_ESCALATION",
                "details": f"Payment amount {payment.amount} exceeds threshold {self.HIGH_VALUE_THRESHOLD}. Escalating to MANUAL_REVIEW.",
                "override_action": ActionType.MANUAL_REVIEW
            }

        return {
            "approved": True,
            "reason": "POLICY_PASSED",
            "details": "Action complies with all policies.",
            "final_action": action_type
        }

policy_engine = PolicyEngine()
