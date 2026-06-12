"""Product Service - Business logic for product catalog operations."""

from uuid import UUID
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.product import Category, Product


class ProductService:
    """Service for product catalog operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy AsyncSession for database operations
        """
        self.db = db

    async def get_all_products(self, category_slug: str | None = None) -> list[Product]:
        """
        Get all active products, optionally filtered by category.

        Args:
            category_slug: Optional category slug for filtering

        Returns:
            List of active Product objects
        """
        query = select(Product).where(Product.is_active.is_(True))

        if category_slug:
            query = query.join(Category).where(Category.slug == category_slug)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_all_categories(self) -> list[Category]:
        """
        Get all active categories.

        Returns:
            List of active Category objects
        """
        result = await self.db.execute(
            select(Category).where(Category.is_active.is_(True))
        )
        return result.scalars().all()

    async def search_products(self, query_string: str) -> list[Product]:
        """
        Search products by name or description (case-insensitive).

        Args:
            query_string: Search term (will be searched in name and description)

        Returns:
            List of Product objects matching the search criteria
        """
        search_term = f"%{query_string}%"
        query = select(Product).where(
            Product.is_active.is_(True),
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            ),
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_product_by_id(self, product_id: UUID) -> Product | None:
        """
        Get a single product by ID.

        Args:
            product_id: UUID of the product

        Returns:
            Product object if found, None otherwise
        """
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()
