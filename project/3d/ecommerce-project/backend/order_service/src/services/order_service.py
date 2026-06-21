"""Order business logic for create/read/cancel/status operations."""

import logging
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from order_service.src.events.publisher import EventPublisher
from order_service.src.core.config import settings
from order_service.src.models.order import Order, OrderItem, OrderStatus
from order_service.src.schemas.orders import OrderCreate
from order_service.src.services.product_client import (
    get_products_stock,
    reserve_stock,
    release_stock,
)

publisher = EventPublisher(
    host=settings.RABBITMQ_HOST,
    exchange=settings.RABBITMQ_EXCHANGE,
)
logger = logging.getLogger(__name__)


def _order_to_dict(order: Order) -> dict:
    return {
        "id": str(order.id),
        "user_id": str(order.user_id),
        "status": order.status.value,
        "total_amount": str(order.total_amount),
        "shipping_address": order.shipping_address,
        "notes": order.notes,
        "items": [
            {
                "id": str(i.id),
                "product_id": str(i.product_id),
                "quantity": i.quantity,
                "price": str(i.price),
                "product_name": i.product_name,
            }
            for i in order.items
        ],
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
    }


async def create_order(
    db: AsyncSession,
    user_id: UUID,
    payload: OrderCreate,
    auth_token: str,
) -> Order:
    """Validate stock, persist order, reserve inventory and emit ORDER_CREATED event."""
    product_ids = [item.product_id for item in payload.items]

    try:
        stock_info = await get_products_stock(product_ids, auth_token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach product service. Please try again later.",
        )

    for item in payload.items:
        info = stock_info.get(item.product_id)
        if not info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found.",
            )
        if not info.available or info.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for '{info.name}'. Available: {info.stock}, requested: {item.quantity}.",
            )

    total = Decimal("0")
    for item in payload.items:
        total += stock_info[item.product_id].price * item.quantity

    reservations = [
        {"product_id": str(item.product_id), "quantity": item.quantity}
        for item in payload.items
    ]
    reserved = await reserve_stock(reservations, auth_token)
    if not reserved:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Failed to reserve stock. Some items may have sold out.",
        )

    order = Order(
        user_id=user_id,
        status=OrderStatus.pending,
        total_amount=total,
        shipping_address=payload.shipping_address.model_dump(),
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    for item in payload.items:
        info = stock_info[item.product_id]
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=info.price,
            product_name=info.name,
        ))

    await db.flush()
    await db.refresh(order)

    published = publisher.publish("ORDER_CREATED", _order_to_dict(order))
    if not published:
        logger.warning("ORDER_CREATED event could not be published for order_id=%s", order.id)

    return order


async def get_order(db: AsyncSession, order_id: UUID, user_id: UUID) -> Order:
    """Return a single order belonging to the authenticated user."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()

    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return order


async def list_orders(
    db: AsyncSession,
    user_id: UUID,
    page: int = 1,
    page_size: int = 20,
    order_status: Optional[OrderStatus] = None,
) -> tuple[list, int]:
    """Return paginated orders for the authenticated user."""
    query = select(Order).where(Order.user_id == user_id)
    count_query = select(func.count()).select_from(Order).where(Order.user_id == user_id)

    if order_status:
        query = query.where(Order.status == order_status)
        count_query = count_query.where(Order.status == order_status)

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    orders = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    return orders, total


async def list_seller_sales(
    db: AsyncSession,
    seller_products: dict[UUID, str],
    page: int = 1,
    page_size: int = 20,
    order_status: Optional[OrderStatus] = None,
) -> tuple[list[dict], int]:
    """Return paginated sales rows for products owned by authenticated seller."""
    if not seller_products:
        return [], 0

    product_ids = list(seller_products.keys())

    query = (
        select(OrderItem, Order)
        .join(Order, OrderItem.order_id == Order.id)
        .where(OrderItem.product_id.in_(product_ids))
    )
    count_query = (
        select(func.count())
        .select_from(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .where(OrderItem.product_id.in_(product_ids))
    )

    if order_status:
        query = query.where(Order.status == order_status)
        count_query = count_query.where(Order.status == order_status)

    query = query.order_by(Order.created_at.desc(), OrderItem.id.asc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    items: list[dict] = []
    for order_item, order in rows:
        unit_price = order_item.price or Decimal("0")
        paid_amount = unit_price * order_item.quantity

        items.append(
            {
                "order_id": order.id,
                "order_status": order.status,
                "buyer_user_id": order.user_id,
                "product_id": order_item.product_id,
                "product_name": order_item.product_name or seller_products.get(order_item.product_id),
                "quantity": order_item.quantity,
                "unit_price": unit_price,
                "paid_amount": paid_amount,
                "created_at": order.created_at,
            }
        )

    return items, total


async def cancel_order(
    db: AsyncSession,
    order_id: UUID,
    user_id: UUID,
    auth_token: str,
) -> Order:
    """Cancel an order if its status allows it and release reserved stock."""
    order = await get_order(db, order_id, user_id)

    if not order.can_cancel():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order in status '{order.status.value}' cannot be cancelled.",
        )

    order.status = OrderStatus.cancelled
    await db.flush()
    await db.refresh(order)

    reservations = [
        {"product_id": str(item.product_id), "quantity": item.quantity}
        for item in order.items
    ]
    await release_stock(reservations, auth_token)

    published = publisher.publish("ORDER_CANCELLED", _order_to_dict(order))
    if not published:
        logger.warning("ORDER_CANCELLED event could not be published for order_id=%s", order.id)

    return order


async def update_order_status(
    db: AsyncSession,
    order_id: UUID,
    new_status: OrderStatus,
) -> Order:
    """Transition an order to a new status. Admin/system use only."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()

    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order.status = new_status
    await db.flush()
    await db.refresh(order)

    published = publisher.publish("ORDER_UPDATED", _order_to_dict(order))
    if not published:
        logger.warning("ORDER_UPDATED event could not be published for order_id=%s", order.id)

    return order