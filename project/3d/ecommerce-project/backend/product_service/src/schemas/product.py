"""Schemas for product and category endpoints."""

from uuid import UUID
from decimal import Decimal
from datetime import datetime
from pydantic import AnyHttpUrl, BaseModel, Field


class CategoryResponse(BaseModel):
    """Schema for category response."""

    id: UUID
    name: str
    slug: str
    description: str | None
    image_url: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    """Schema for product response."""

    id: UUID
    name: str
    slug: str
    description: str | None
    price: Decimal
    stock: int
    is_active: bool
    created_at: datetime
    category_id: UUID
    seller_user_id: UUID
    category_name: str | None = None
    seller_display_name: str | None = None
    cover_image_url: str | None = None

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    """Schema for product listing creation by a seller."""

    category_id: UUID
    name: str = Field(min_length=3, max_length=255)
    slug: str = Field(min_length=3, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0)
    stock: int = Field(ge=0, default=0)


class ProductUpdate(BaseModel):
    """Schema for product listing updates by owner seller."""

    category_id: UUID | None = None
    name: str | None = Field(default=None, min_length=3, max_length=255)
    slug: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class CategoryCreate(BaseModel):
    """Schema for category creation by admin/seller roles."""

    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    image_url: AnyHttpUrl | None = None
    parent_id: UUID | None = None


class CategoryUpdate(BaseModel):
    """Schema for category updates by admin/seller roles."""

    name: str | None = Field(default=None, min_length=2, max_length=100)
    slug: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    image_url: AnyHttpUrl | None = None
    parent_id: UUID | None = None
    is_active: bool | None = None


class ProductReviewCreate(BaseModel):
    """Schema for creating a product review."""

    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1200)


class ProductReviewResponse(BaseModel):
    """Schema for product review responses."""

    id: UUID
    product_id: UUID
    reviewer_user_id: UUID
    rating: int
    comment: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductImageCreate(BaseModel):
    """Schema for attaching an image to a product."""

    image_url: AnyHttpUrl
    alt_text: str | None = Field(default=None, max_length=255)
    position: int = Field(default=0, ge=0)


class ProductImageUpdate(BaseModel):
    """Schema for updating an existing product image."""

    image_url: AnyHttpUrl | None = None
    alt_text: str | None = Field(default=None, max_length=255)
    position: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductImageReorderItem(BaseModel):
    """Single image order update payload."""

    image_id: UUID
    position: int = Field(ge=0)


class ProductImageReorderRequest(BaseModel):
    """Batch image reordering payload."""

    items: list[ProductImageReorderItem] = Field(default_factory=list, min_length=1)


class ProductImageResponse(BaseModel):
    """Schema for product image responses."""

    id: UUID
    product_id: UUID
    image_url: str
    alt_text: str | None
    position: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


