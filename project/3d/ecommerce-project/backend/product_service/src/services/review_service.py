"""Product review management."""

import re
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from product_service.src.models.product import Product, ProductReview
from product_service.src.core.config.settings import settings


class ReviewService:
    """Handles product review operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _forbidden_review_terms() -> list[str]:
        raw = settings.forbidden_review_terms or ""
        return [term.strip().lower() for term in raw.split(",") if term.strip()]

    def _sanitize_review_comment(self, comment: str | None) -> str | None:
        if not isinstance(comment, str):
            return comment

        cleaned = re.sub(r"\s+", " ", comment).strip()
        if not cleaned:
            return None

        lowered = cleaned.lower()
        for term in self._forbidden_review_terms():
            if term in lowered:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La reseña contiene términos no permitidos",
                )
        return cleaned

    async def create_review(
        self, product_id: UUID, reviewer_user_id: UUID, payload
    ) -> ProductReview:
        """Create or update a product review."""
        product = await self.db.get(Product, product_id)
        if product is None or not product.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id == reviewer_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes reseñar tu propio producto",
            )

        result = await self.db.execute(
            select(ProductReview).where(
                ProductReview.product_id == product_id,
                ProductReview.reviewer_user_id == reviewer_user_id,
            )
        )
        review = result.scalar_one_or_none()

        if review is None:
            review = ProductReview(
                product_id=product_id,
                reviewer_user_id=reviewer_user_id,
                rating=payload.rating,
                comment=self._sanitize_review_comment(payload.comment),
                is_active=True,
            )
            self.db.add(review)
        else:
            review.rating = payload.rating
            review.comment = self._sanitize_review_comment(payload.comment)
            review.is_active = True

        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def get_product_reviews(self, product_id: UUID) -> list[ProductReview]:
        """Get all active reviews for a product."""
        result = await self.db.execute(
            select(ProductReview)
            .where(ProductReview.product_id == product_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def get_reviews_by_user(self, reviewer_user_id: UUID) -> list[ProductReview]:
        """Get reviews authored by a user."""
        result = await self.db.execute(
            select(ProductReview)
            .where(ProductReview.reviewer_user_id == reviewer_user_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def get_reviews_about_seller(self, seller_user_id: UUID) -> list[ProductReview]:
        """Get reviews received by a seller across all listings."""
        result = await self.db.execute(
            select(ProductReview)
            .join(Product, Product.id == ProductReview.product_id)
            .where(Product.seller_user_id == seller_user_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def get_seller_rating_summary(self, seller_user_id: UUID) -> dict[str, float | int]:
        """Get average rating and review count for a seller."""
        result = await self.db.execute(
            select(func.count(ProductReview.id), func.avg(ProductReview.rating))
            .join(Product, Product.id == ProductReview.product_id)
            .where(Product.seller_user_id == seller_user_id, ProductReview.is_active.is_(True))
        )
        reviews_count, average_rating = result.one()
        return {
            "reviews_count": int(reviews_count or 0),
            "average_rating": float(average_rating or 0),
        }
