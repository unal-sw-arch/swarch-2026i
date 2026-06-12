"""Product and Category models for the e-commerce application.

Represents catalog entities with hierarchical categories and product inventory.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base


class Category(Base):
    """
    Represents a product category in the catalog.

    Attributes:
        id: Unique category identifier (UUID).
        name: Category name (unique, required).
        slug: URL-friendly identifier (unique, required).
        description: Category description (optional).
        image_url: URL to category image (optional).
        parent_id: Parent category for hierarchical structure
        (optional, self-referential).
        is_active: Whether category is visible (default: True).
        products: Relationship to products in this category.

    Note:
        Supports nested categories via parent_id for flexible taxonomy.
    """

    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="category"
    )


class Product(Base):
    """
    Represents a product in the catalog.

    Attributes:
        id: Unique product identifier (UUID).
        category_id: Foreign key to Category (required).
        name: Product name (required).
        slug: URL-friendly identifier (unique, required).
        description: Detailed product description (optional).
        price: Product price in COP (Numeric 12,2).
        stock: Current inventory count (default: 0).
        is_active: Whether product is available for sale (default: True).
        created_at: Timestamp of product creation (auto-generated).
        updated_at: Timestamp of last update (auto-generated).
        category: Relationship to Category model.

    Note:
        Prices are stored as Numeric(12,2) for precision (no float rounding errors).
        Slug must be unique for clean URL generation.
    """

    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),  # pylint: disable=not-callable
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),  # pylint: disable=not-callable
        nullable=True,
    )

    category: Mapped["Category"] = relationship(back_populates="products")
