from fastapi import APIRouter, Depends, Query, Request, status
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
from order_service.src.services.order_service import (
    create_order,
    get_order,
    list_orders,
    list_seller_sales,
    cancel_order,
    update_order_status,
)
from order_service.src.services.product_client import get_my_seller_products

router = APIRouter(prefix="/orders", tags=["Orders"])


def _extract_token(request: Request) -> str:
    return request.headers.get("Authorization", "").removeprefix("Bearer ").strip()


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Validates stock, creates order, reserves inventory, emits ORDER_CREATED event.",
)
async def create_order_endpoint(
    payload: OrderCreate,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_order(db, current_user.id, payload, _extract_token(request))


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
    description="Allowed only for pending/paid orders. Releases stock and emits ORDER_CANCELLED event.",
)
async def cancel_order_endpoint(
    order_id: UUID,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await cancel_order(db, order_id, current_user.id, _extract_token(request))


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