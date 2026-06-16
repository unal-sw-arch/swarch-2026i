"""Internal inventory endpoints for service-to-service order flows."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from product_service.src.core.dependencies.get_current_user import (
    AuthenticatedUser,
    get_current_user,
)
from product_service.src.core.dependencies.get_db import get_db
from product_service.src.schemas.product import (
    StockInfoRequest,
    StockInfoResponse,
    StockOperationRequest,
    StockOperationResponse,
)
from product_service.src.services.product_service import ProductService

router = APIRouter(prefix="/internal/products", tags=["internal-products"])


@router.post("/stock-info", response_model=StockInfoResponse)
async def stock_info(
    payload: StockInfoRequest,
    _: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return stock and pricing info for a list of products."""
    service = ProductService(db)
    items = await service.get_stock_info(payload.product_ids)
    return StockInfoResponse(items=items)


@router.post("/reserve", response_model=StockOperationResponse)
async def reserve_stock(
    payload: StockOperationRequest,
    _: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reserve stock atomically for checkout flow."""
    service = ProductService(db)
    await service.reserve_stock([item.model_dump() for item in payload.items])
    return StockOperationResponse(success=True, message="Stock reserved.")


@router.post("/release", response_model=StockOperationResponse)
async def release_stock(
    payload: StockOperationRequest,
    _: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Release reserved stock when order is cancelled or creation fails."""
    service = ProductService(db)
    await service.release_stock([item.model_dump() for item in payload.items])
    return StockOperationResponse(success=True, message="Stock released.")
