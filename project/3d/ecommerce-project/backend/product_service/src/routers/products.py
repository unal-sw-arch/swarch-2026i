"""Products router for catalog browsing and filtering."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from product_service.src.core.dependencies.get_db import get_db
from product_service.src.core.dependencies.get_current_user import (
    AuthenticatedUser,
    get_current_user,
)
from product_service.src.services.product_service import ProductService
from product_service.src.services.category_service import CategoryService
from product_service.src.services.image_gallery_service import ImageGalleryService
from product_service.src.services.review_service import ReviewService
from product_service.src.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    ProductCreate,
    ProductImageCreate,
    ProductImageReorderRequest,
    ProductImageResponse,
    ProductImageUpdate,
    ProductResponse,
    ProductReviewCreate,
    ProductReviewResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


def _ensure_category_editor(current_user: AuthenticatedUser) -> None:
    # Backward compatible: older JWTs may not include role claim yet.
    if current_user.role is None:
        return
    if current_user.role.lower() not in {"admin", "seller"}:
        raise HTTPException(status_code=403, detail="No tienes permisos para gestionar categorias")


@router.get("/", response_model=list[ProductResponse])
async def get_products(
    category_slug: str | None = Query(None, description="Filtrar por categoría"),
    min_price: Decimal | None = Query(None, description="Precio mínimo"),
    max_price: Decimal | None = Query(None, description="Precio máximo"),
    db: AsyncSession = Depends(get_db),
):
    """Return product catalog, optionally filtered by category slug and price range."""
    service = ProductService(db)
    return await service.get_all_products(category_slug, min_price=min_price, max_price=max_price)


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    """Return all active categories."""
    service = CategoryService(db)
    return await service.get_all_categories()


@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    payload: CategoryCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a category (admin/seller only)."""
    _ensure_category_editor(current_user)
    service = CategoryService(db)
    return await service.create_category(payload)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a category (admin/seller only)."""
    _ensure_category_editor(current_user)
    service = CategoryService(db)
    return await service.update_category(category_id, payload)


@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a category (admin/seller only)."""
    _ensure_category_editor(current_user)
    service = CategoryService(db)
    await service.deactivate_category(category_id)


@router.get("/search", response_model=list[ProductResponse])
async def search_products(
    q: str = Query(
        ...,
        min_length=1,
        max_length=100,
        description="Search query (name or description)",
    ),
    category_slug: str | None = Query(None, description="Optional category filter"),
    min_price: Decimal | None = Query(None, description="Precio mínimo"),
    max_price: Decimal | None = Query(None, description="Precio máximo"),
    db: AsyncSession = Depends(get_db),
):
    """Search products by name or description with optional price range filter."""
    service = ProductService(db)
    return await service.search_products(q, category_slug, min_price=min_price, max_price=max_price)


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    payload: ProductCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a product listing owned by the authenticated seller."""
    service = ProductService(db)
    return await service.create_product(current_user.user_id, payload)


@router.get("/mine/listings", response_model=list[ProductResponse])
async def get_my_listings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get listings published by the authenticated seller."""
    service = ProductService(db)
    return await service.get_my_products(current_user.user_id)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update authenticated seller listing."""
    service = ProductService(db)
    return await service.update_product(product_id, current_user.user_id, payload)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete authenticated seller listing."""
    service = ProductService(db)
    await service.deactivate_product(product_id, current_user.user_id)


@router.get("/mine/reviews", response_model=list[ProductReviewResponse])
async def get_my_reviews(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reviews authored by current user for profile section."""
    service = ReviewService(db)
    return await service.get_reviews_by_user(current_user.user_id)


@router.get("/mine/reviews-received", response_model=list[ProductReviewResponse])
async def get_reviews_received(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reviews received on current seller listings for profile section."""
    service = ReviewService(db)
    return await service.get_reviews_about_seller(current_user.user_id)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Return a product by its ID."""
    service = ProductService(db)
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("/{product_id}/reviews", response_model=ProductReviewResponse, status_code=201)
async def create_product_review(
    product_id: UUID,
    payload: ProductReviewCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create (or update) authenticated user review for a product."""
    service = ReviewService(db)
    return await service.create_review(product_id, current_user.user_id, payload)


@router.post("/{product_id}/images", response_model=ProductImageResponse, status_code=201)
async def add_product_image(
    product_id: UUID,
    payload: ProductImageCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Attach an image to an owned listing."""
    service = ImageGalleryService(db)
    return await service.add_product_image(product_id, current_user.user_id, payload)


@router.get("/{product_id}/images", response_model=list[ProductImageResponse])
async def get_product_images(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """List gallery images for a product."""
    service = ImageGalleryService(db)
    return await service.get_product_images(product_id)


@router.patch("/{product_id}/images/{image_id}", response_model=ProductImageResponse)
async def update_product_image(
    product_id: UUID,
    image_id: UUID,
    payload: ProductImageUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update image metadata for owned listing."""
    service = ImageGalleryService(db)
    return await service.update_product_image(product_id, image_id, current_user.user_id, payload)


@router.delete("/{product_id}/images/{image_id}", status_code=204)
async def delete_product_image(
    product_id: UUID,
    image_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete image from owned listing."""
    service = ImageGalleryService(db)
    await service.deactivate_product_image(product_id, image_id, current_user.user_id)


@router.post("/{product_id}/images/reorder", response_model=list[ProductImageResponse])
async def reorder_product_images(
    product_id: UUID,
    payload: ProductImageReorderRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder image positions for owned listing."""
    service = ImageGalleryService(db)
    return await service.reorder_product_images(product_id, current_user.user_id, payload)


@router.post("/{product_id}/images/{image_id}/set-cover", response_model=list[ProductImageResponse])
async def set_cover_image(
    product_id: UUID,
    image_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Set one image as cover (position 0) for owned listing."""
    service = ImageGalleryService(db)
    return await service.set_cover_image(product_id, image_id, current_user.user_id)


@router.get("/{product_id}/reviews", response_model=list[ProductReviewResponse])
async def get_product_reviews(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """List active reviews for a product."""
    service = ReviewService(db)
    return await service.get_product_reviews(product_id)
