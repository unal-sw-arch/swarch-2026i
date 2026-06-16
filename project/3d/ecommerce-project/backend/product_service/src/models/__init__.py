"""Models package - registers all SQLAlchemy ORM entities.
Imports all model classes to ensure metadata is populated for table creation."""

from product_service.src.models.product import (
	Category,
	Product,
	ProductImage,
	ProductReview,
)

__all__ = ["Category", "Product", "ProductReview", "ProductImage"]
