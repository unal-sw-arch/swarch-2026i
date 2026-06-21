"""Category management."""

from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from product_service.src.models.product import Category, Product


class CategoryService:
    """Handles product category operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _normalize_slug(value: str) -> str:
        return value.strip().lower()

    @staticmethod
    def _normalize_name(value: str) -> str:
        return value.strip()

    async def get_all_categories(self) -> list[Category]:
        """Get all active categories."""
        result = await self.db.execute(
            select(Category).where(Category.is_active.is_(True))
        )
        return result.scalars().all()

    async def get_category_by_id(self, category_id: UUID) -> Category | None:
        """Get a category by ID."""
        return await self.db.get(Category, category_id)

    async def create_category(self, payload) -> Category:
        """Create a new category."""
        if payload.parent_id is not None:
            parent = await self.get_category_by_id(payload.parent_id)
            if parent is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoria padre no encontrada"
                )

        category = Category(
            name=self._normalize_name(payload.name),
            slug=self._normalize_slug(payload.slug),
            description=payload.description,
            image_url=str(payload.image_url) if payload.image_url else None,
            parent_id=payload.parent_id,
            is_active=True,
        )
        self.db.add(category)

        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Nombre o slug de categoria ya existe",
            ) from exc

        await self.db.refresh(category)
        return category

    async def update_category(self, category_id: UUID, payload) -> Category:
        """Update an existing category."""
        category = await self.get_category_by_id(category_id)
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria no encontrada"
            )

        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates and isinstance(updates["name"], str):
            updates["name"] = self._normalize_name(updates["name"])
        if "slug" in updates and isinstance(updates["slug"], str):
            updates["slug"] = self._normalize_slug(updates["slug"])
        if "image_url" in updates and updates["image_url"] is not None:
            updates["image_url"] = str(updates["image_url"])

        if "parent_id" in updates and updates["parent_id"] is not None:
            if updates["parent_id"] == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria no puede ser su propio padre"
                )
            parent = await self.get_category_by_id(updates["parent_id"])
            if parent is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoria padre no encontrada"
                )

        for field, value in updates.items():
            setattr(category, field, value)

        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Nombre o slug de categoria ya existe",
            ) from exc

        await self.db.refresh(category)
        return category

    async def deactivate_category(self, category_id: UUID) -> None:
        """Deactivate a category (only if no active products)."""
        category = await self.get_category_by_id(category_id)
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria no encontrada"
            )

        active_products = await self.db.execute(
            select(func.count(Product.id)).where(
                Product.category_id == category_id,
                Product.is_active.is_(True),
            )
        )
        if int(active_products.scalar() or 0) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No puedes desactivar una categoria con productos activos",
            )

        category.is_active = False
        await self.db.commit()
