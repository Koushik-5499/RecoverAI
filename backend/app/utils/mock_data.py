import random
from sqlalchemy.orm import Session
from ..models.payment import Payment, PaymentStatus
import uuid

def seed_mock_data(db: Session):
    # Check if data already exists
    if db.query(Payment).first():
        return

    print("Seeding mock payment data...")
    failure_codes = ["INSUFFICIENT_FUNDS", "EXPIRED_CARD", "DO_NOT_HONOR", "LIMIT_EXCEEDED"]
    failure_reasons = {
        "INSUFFICIENT_FUNDS": "Not enough balance on the card.",
        "EXPIRED_CARD": "The card has expired.",
        "DO_NOT_HONOR": "The issuing bank declined the transaction.",
        "LIMIT_EXCEEDED": "Transaction limit exceeded."
    }

    payments = []
    for i in range(1, 21):
        code = random.choice(failure_codes)
        amount = round(random.uniform(20.0, 1500.0), 2)
        status = PaymentStatus.FAILED if random.random() > 0.3 else PaymentStatus.RECOVERED
        
        payments.append(Payment(
            transaction_id=f"txn_{uuid.uuid4().hex[:10]}",
            customer_id=f"cus_{random.randint(1000,9999)}",
            customer_email=f"customer{i}@example.com",
            amount=amount,
            currency="USD",
            status=status,
            failure_code=code,
            failure_reason=failure_reasons[code],
            recovery_retries=random.randint(0, 2)
        ))

    db.add_all(payments)
    db.commit()
    print("Mock data seeded successfully.")
