"""Simulated payment gateway for orders.

Deterministic simulation rules (for testing both outcomes):
- card number ending in "0000" -> payment fails with "card_declined"
- any other card, or method "transfer" -> payment succeeds

A successful payment transitions the order to OrderStatus.paid.
"""

import asyncio
import logging
from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from order_service.src.models.order import Order, OrderStatus
from order_service.src.models.payment import Payment, PaymentStatus
from order_service.src.schemas.payments import PaymentCreate
from order_service.src.services.order_service import get_order

logger = logging.getLogger(__name__)

# Simulated gateway latency (seconds). Kept short so the request stays synchronous.
SIMULATED_PROCESSING_DELAY_SECONDS = 1.5
DECLINED_CARD_SUFFIX = "0000"

PAYABLE_STATUSES = {OrderStatus.confirmed}


async def pay_order(
    db: AsyncSession,
    order_id: UUID,
    user_id: UUID,
    payload: PaymentCreate,
) -> tuple[Payment, Order]:
    """Process a simulated payment for an order owned by the user.

    Locks the order row pessimistically to prevent concurrent double payments.
    Returns the payment attempt (completed or failed) and the order.
    """
    result = await db.execute(
        select(Order).where(Order.id == order_id).with_for_update()
    )
    order = result.scalars().first()

    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    if order.status == OrderStatus.paid:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order is already paid.",
        )
    if order.status not in PAYABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order in status '{order.status.value}' cannot be paid. Only confirmed orders are payable.",
        )

    payment = Payment(
        order_id=order.id,
        user_id=user_id,
        status=PaymentStatus.processing,
        amount=order.total_amount,
        method=payload.method,
        card_last4=payload.card_number[-4:] if payload.card_number else None,
    )
    db.add(payment)
    await db.flush()

    # Simulated gateway round-trip (async sleep — never blocks the event loop).
    await asyncio.sleep(SIMULATED_PROCESSING_DELAY_SECONDS)

    declined = payload.method == "card" and payload.card_number.endswith(DECLINED_CARD_SUFFIX)
    payment.processed_at = datetime.utcnow()

    if declined:
        payment.status = PaymentStatus.failed
        payment.failure_reason = "card_declined"
        logger.info("Payment %s declined for order_id=%s", payment.id, order.id)
    else:
        payment.status = PaymentStatus.completed
        order.status = OrderStatus.paid
        logger.info("Payment %s completed for order_id=%s", payment.id, order.id)

    await db.flush()
    await db.refresh(payment)
    await db.refresh(order)
    return payment, order


async def list_payments(
    db: AsyncSession,
    order_id: UUID,
    user_id: UUID,
) -> list[Payment]:
    """Return payment attempts for an order owned by the user (newest first)."""
    await get_order(db, order_id, user_id)  # validates existence and ownership

    result = await db.execute(
        select(Payment)
        .where(Payment.order_id == order_id)
        .order_by(Payment.created_at.desc())
    )
    return list(result.scalars().all())
