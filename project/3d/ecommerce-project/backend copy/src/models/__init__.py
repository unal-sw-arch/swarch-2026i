"""Models package - registers all SQLAlchemy ORM entities.
Imports all model classes to ensure metadata is populated for table creation."""

from src.models.user import User
from src.models.product import Category, Product

__all__ = ["User", "Category", "Product"]
