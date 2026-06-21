"""Background task that cancels orders stuck in PENDING_STOCK_CONFIRMATION."""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from order_service.src.core.database import AsyncSessionLocal
from order_service.src.core.config.settings import settings
from order_service.src.models.order import Order, OrderStatus
from order_service.src.schemas.events import build_envelope

logger = logging.getLogger(__name__)


async def _cancel_timed_out_orders() -> None:
    cutoff = datetime.utcnow() - timedelta(seconds=settings.ORDER_CONFIRMATION_TIMEOUT_SECONDS)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Order).where(
                Order.status == OrderStatus.pending_stock_confirmation,
                Order.created_at < cutoff,
            )
        )
        timed_out = result.scalars().all()

        if not timed_out:
            return

        from order_service.src.events.publisher import event_publisher

        for order in timed_out:
            order.status = OrderStatus.cancelled
            logger.warning(
                "[timeout_worker] order=%s timed out — marking cancelled", order.id
            )

        await db.commit()

        for order in timed_out:
            correlation_id = str(order.saga_id or uuid.uuid4())
            envelope = build_envelope(
                "ORDER_CANCELLED",
                {
                    "order_id": str(order.id),
                    "reason": "timeout",
                    "reservation_id": str(order.reservation_id) if order.reservation_id else None,
                },
                correlation_id,
            )
            published = event_publisher.publish_saga("order.cancelled", envelope)
            if not published:
                logger.error("[timeout_worker] failed to publish ORDER_CANCELLED for order=%s", order.id)


async def run_timeout_worker() -> None:
    """Loop that checks for timed-out orders every 10 seconds."""
    logger.info("timeout_worker started (interval=10s, cutoff=%ss)", settings.ORDER_CONFIRMATION_TIMEOUT_SECONDS)
    while True:
        try:
            await _cancel_timed_out_orders()
        except Exception as exc:
            logger.error("timeout_worker error: %s", exc, exc_info=True)
        await asyncio.sleep(10)
