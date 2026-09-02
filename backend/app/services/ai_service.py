"""
ai_service.py — Google Gemini AI integration for RecoverAI.

Architecture guarantee:
  This service ONLY produces a recommendation dict.
  The policy_engine is ALWAYS the final authority — it approves/rejects.
  Gemini never bypasses or replaces the policy engine.
"""

import json
import logging
from pydantic import BaseModel, Field
from ..config import settings
from ..models.payment import Payment
from ..models.recovery_action import ActionType

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Valid action types — Gemini must not invent new ones
# ---------------------------------------------------------------------------
VALID_ACTION_TYPES = {a.value for a in ActionType}

# ---------------------------------------------------------------------------
# Gemini model to use
# ---------------------------------------------------------------------------
_GEMINI_MODEL = "gemini-3.6-flash"

# ---------------------------------------------------------------------------
# System prompt  (identical decision guidelines to the old OpenAI prompt)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are an expert payment recovery AI for a financial SaaS platform.
Your job is to analyze failed payment transactions and recommend the single best recovery action.

Available recovery actions (you MUST use one of these exact values):
- SMART_RETRY: Automatically retry the payment transaction.
- EMAIL_REMINDER: Send the customer an email prompting them to update their payment details.
- DISCOUNT_OFFER: Offer the customer a small discount to encourage them to complete the payment.
- MANUAL_REVIEW: Escalate to a human agent for manual review (use for high-risk or ambiguous cases).

Decision guidelines:
- INSUFFICIENT_FUNDS → prefer SMART_RETRY (retry on payday) or EMAIL_REMINDER.
- EXPIRED_CARD → prefer EMAIL_REMINDER (customer must update card).
- DO_NOT_HONOR / FRAUD flags → prefer MANUAL_REVIEW.
- LIMIT_EXCEEDED → prefer EMAIL_REMINDER or DISCOUNT_OFFER.
- High value transactions (>$1000) → prefer MANUAL_REVIEW.
- High retry count (>=2) → do NOT recommend SMART_RETRY again.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON object.
"""

class RecoveryActionSchema(BaseModel):
    action_type: str = Field(description="Must be SMART_RETRY, EMAIL_REMINDER, DISCOUNT_OFFER, or MANUAL_REVIEW")
    confidence_score: int = Field(description="Integer 0-100")
    reasoning: str = Field(description="Clear one-sentence explanation")

class AIService:
    def __init__(self):
        self._client = None          # google.genai.Client instance
        self._configured = False

        if settings.gemini_api_key:
            try:
                from google import genai as _genai
                self._client = _genai.Client(api_key=settings.gemini_api_key)
                self._configured = True
                logger.info(
                    "Gemini client initialised (model=%s).",
                    _GEMINI_MODEL,
                )
            except Exception as e:
                logger.error(
                    "Failed to initialise Gemini client: %s.",
                    type(e).__name__,
                )
        else:
            logger.warning(
                "GEMINI_API_KEY is not set. "
                "AI Analysis will fail."
            )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def is_live(self) -> bool:
        """True when a real Gemini client is configured."""
        return self._configured

    def analyze_payment_failure(self, payment: Payment) -> dict:
        """
        Analyzes a failed payment and recommends a recovery action.

        Returns dict with: action_type, confidence_score, reasoning, ai_mode.
        Raises RuntimeError on Gemini failure (callers handle it).
        """
        if not self.is_live:
            raise RuntimeError("Gemini is not configured. Live AI is required.")
        
        result = self._real_analysis(payment)

        # Tag which mode was used — stored in audit log, never sent to client
        result["ai_mode"] = "live"
        return result

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _real_analysis(self, payment: Payment) -> dict:
        """Call Gemini and return a validated recommendation dict."""
        from google import genai as _genai
        from google.genai import types as _types

        user_message = (
            f"Analyze this failed payment and recommend a recovery action:\n\n"
            f"Transaction ID: {payment.transaction_id}\n"
            f"Customer ID: {payment.customer_id}\n"
            f"Customer Email: {payment.customer_email or 'N/A'}\n"
            f"Amount: {payment.amount} {payment.currency}\n"
            f"Failure Code: {payment.failure_code}\n"
            f"Failure Reason: {payment.failure_reason}\n"
            f"Recovery Retries So Far: {payment.recovery_retries}\n\n"
            f"Respond with valid JSON only."
        )

        try:
            response = self._client.models.generate_content(
                model=_GEMINI_MODEL,
                contents=user_message,
                config=_types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=RecoveryActionSchema,
                    temperature=0.2,
                    max_output_tokens=1000,
                ),
            )

            raw_content = response.text
            logger.info(
                "Gemini returned analysis for transaction %s.",
                payment.transaction_id,
            )
            # When using response_schema with a Pydantic model, google-genai sets response.parsed
            if response.parsed:
                return response.parsed.model_dump()
            return self._validate_response(response.text)

        except Exception as e:
            error_type = type(e).__name__
            logger.error(
                "Gemini API call failed (%s: %s).",
                error_type,
                str(e),
            )
            raise RuntimeError(f"Gemini API call failed: {error_type} - {str(e)}") from e

    def _validate_response(self, raw_content: str) -> dict:
        """Parse and validate the model's JSON response."""
        # Strip markdown if Gemini included it
        cleaned = str(raw_content).strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except (json.JSONDecodeError, TypeError) as e:
            raise RuntimeError(
                f"Gemini returned non-JSON response: {str(raw_content)[:100]}"
            ) from e

        action_type = data.get("action_type", "")
        if action_type not in VALID_ACTION_TYPES:
            raise RuntimeError(
                f"Gemini returned unknown action_type '{action_type}'. "
                f"Expected one of: {VALID_ACTION_TYPES}"
            )

        confidence = data.get("confidence_score", 0)
        if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 100):
            confidence = 50  # safe default

        return {
            "action_type": action_type,
            "confidence_score": int(confidence),
            "reasoning": str(data.get("reasoning", "No reasoning provided."))[:500],
        }



ai_service = AIService()
