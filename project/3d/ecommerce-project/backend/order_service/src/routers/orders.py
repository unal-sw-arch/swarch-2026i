from fastapi import APIRouter, BackgroundTasks, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from order_service.src.core.database import get_db
from order_service.src.core.security import get_current_user, get_current_admin, CurrentUser
from order_service.src.models.order import OrderStatus
from order_service.src.schemas.orders import (
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    SellerSalesListResponse,
    OrderStatusUpdate,
)
from order_service.src.schemas.events import build_envelope
from order_service.src.services.order_service import (
    create_order,
    get_order,
    list_orders,
    list_seller_sales,
    cancel_order,
    update_order_status,
    _order_to_dict,
)
from order_service.src.services.product_client import get_my_seller_products
from order_service.src.events.publisher import event_publisher
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


def _extract_token(request: Request) -> str:
    return request.headers.get("Authorization", "").removeprefix("Bearer ").strip()


def _extract_correlation_id(request: Request) -> str:
    return request.headers.get("X-Request-ID", "") or request.headers.get("X-Correlation-ID", "")


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Creates order in PENDING_STOCK_CONFIRMATION state and emits ORDER_CREATED saga event.",
)
async def create_order_endpoint(
    payload: OrderCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await create_order(db, current_user.id, payload)
    correlation_id = _extract_correlation_id(request) or str(order.saga_id)

    order_dict = _order_to_dict(order)

    def publish_order_created():
        # Broadcast to fanout `events` exchange (for AI service, notifications)
        published = event_publisher.publish("ORDER_CREATED", order_dict)
        if not published:
            logger.warning("ORDER_CREATED fanout event failed for order_id=%s", order.id)

        # Saga routing to `commerce.saga` topic exchange
        envelope = build_envelope(
            "ORDER_CREATED",
            {
                "order_id": str(order.id),
                "user_id": str(order.user_id),
                "saga_id": str(order.saga_id),
                "items": [
                    {
                        "product_id": str(item["product_id"]),
                        "quantity": item["quantity"],
                        "unit_price": item["price"],
                        "product_name": item.get("product_name"),
                    }
                    for item in order_dict["items"]
                ],
                "total": order_dict["total_amount"],
            },
            correlation_id,
        )
        published = event_publisher.publish_saga("order.created", envelope)
        if not published:
            logger.warning("ORDER_CREATED saga event failed for order_id=%s", order.id)

    background_tasks.add_task(publish_order_created)

    return order


@router.get(
    "/",
    response_model=OrderListResponse,
    summary="List authenticated user's orders",
)
async def list_orders_endpoint(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    order_status: Optional[OrderStatus] = Query(default=None, alias="status"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders, total = await list_orders(db, current_user.id, page, page_size, order_status)
    return OrderListResponse(total=total, page=page, page_size=page_size, items=orders)


@router.get(
    "/sales/mine",
    response_model=SellerSalesListResponse,
    summary="List authenticated seller sales",
)
async def list_my_sales_endpoint(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    order_status: Optional[OrderStatus] = Query(default=None, alias="status"),
    _: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = _extract_token(request)
    seller_products = await get_my_seller_products(token)
    items, total = await list_seller_sales(db, seller_products, page, page_size, order_status)
    return SellerSalesListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get a specific order",
)
async def get_order_endpoint(
    order_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_order(db, order_id, current_user.id)


@router.put(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    summary="Cancel an order",
    description="Allowed for pending/confirmed orders. Emits ORDER_CANCELLED saga event.",
)
async def cancel_order_endpoint(
    order_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await cancel_order(db, order_id, current_user.id)
    correlation_id = _extract_correlation_id(request) or str(order.saga_id or order.id)

    order_dict = _order_to_dict(order)

    def publish_order_cancelled():
        # Broadcast to fanout `events` exchange
        published = event_publisher.publish("ORDER_CANCELLED", order_dict)
        if not published:
            logger.warning("ORDER_CANCELLED fanout event failed for order_id=%s", order.id)

        # Saga routing — product_service will release stock if reservation_id is set
        envelope = build_envelope(
            "ORDER_CANCELLED",
            {
                "order_id": str(order.id),
                "reason": "user_cancelled",
                "reservation_id": str(order.reservation_id) if order.reservation_id else None,
            },
            correlation_id,
        )
        published = event_publisher.publish_saga("order.cancelled", envelope)
        if not published:
            logger.warning("ORDER_CANCELLED saga event failed for order_id=%s", order.id)

    background_tasks.add_task(publish_order_cancelled)

    return order


@router.put(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="Update order status (admin/system only)",
    description="Transitions order to any status. Emits ORDER_UPDATED event.",
)
async def update_order_status_endpoint(
    order_id: UUID,
    payload: OrderStatusUpdate,
    _: CurrentUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await update_order_status(db, order_id, payload.status)
