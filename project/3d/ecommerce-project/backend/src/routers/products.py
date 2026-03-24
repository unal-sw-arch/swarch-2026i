"""Products router for catalog browsing and filtering."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies.get_db import get_db
from src.services.product_service import ProductService
from src.schemas.product import CategoryResponse, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductResponse])
async def get_products(
    category_slug: str | None = Query(None, description="Filtrar por categoría"),
    db: AsyncSession = Depends(get_db),
):
    """Return product catalog, optionally filtered by category slug."""
    service = ProductService(db)
    return await service.get_all_products(category_slug)


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Return all active categories."""
    service = ProductService(db)
    return await service.get_all_categories()


@router.get("/search", response_model=list[ProductResponse])
async def search_products(
    q: str = Query(
        ...,
        min_length=1,
        max_length=100,
        description="Search query (name or description)",
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Search products by name or description (case-insensitive).

    Args:
        q: Search query string (minimum 1 character).
        db: Database session dependency.

    Returns:
        List of ProductResponse objects matching the search query.

    Example:
        GET /products/search?q=usb
        Returns all products with "usb" in name or description
    """
    service = ProductService(db)
    return await service.search_products(q)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    """Return a product by its ID."""
    service = ProductService(db)
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product
