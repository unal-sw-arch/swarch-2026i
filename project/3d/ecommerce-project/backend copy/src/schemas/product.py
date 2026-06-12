"""Schemas for product and category endpoints."""

from uuid import UUID
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


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

    model_config = {"from_attributes": True}
