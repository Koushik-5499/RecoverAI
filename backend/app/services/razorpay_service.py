from ..config import settings
from ..models.payment import Payment
import razorpay
import hmac
import hashlib

class RazorpayService:
    def __init__(self):
        if not settings.razorpay_key_id or not settings.razorpay_key_secret:
            raise ValueError("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) must be set in environment.")
        self.client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

    def create_order(self, amount: float, currency: str, receipt: str, notes: dict = None) -> dict:
        """
        Creates a real Razorpay order. Amount should be in decimal (e.g. 500.00).
        Razorpay expects amount in paise (multiply by 100).
        """
        amount_in_paise = int(amount * 100)
        data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1 # Auto capture
        }
        if notes:
            data["notes"] = notes

        # This will raise razorpay.errors.BadRequestError or similar if it fails
        order = self.client.order.create(data=data)
        return order

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verifies the Razorpay payment signature.
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False

    def verify_webhook_signature(self, body: str, signature: str) -> bool:
        """
        Verifies webhook signature using RAZORPAY_WEBHOOK_SECRET.
        """
        if not settings.razorpay_webhook_secret:
            raise ValueError("RAZORPAY_WEBHOOK_SECRET is not configured.")
        
        expected_signature = hmac.new(
            settings.razorpay_webhook_secret.encode('utf-8'),
            body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)

    def initiate_retry(self, payment: Payment) -> bool:
        """
        Attempts to retry the payment.
        Since we don't have stored tokens in this simplified model, we will return False
        to indicate that a seamless backend retry is not supported without a checkout flow.
        """
        # A real implementation would use client.payment.create(...) with a stored token.
        return False

razorpay_service = RazorpayService()
