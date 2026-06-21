"""Product Service - Business logic for product catalog operations."""

import re
from collections import defaultdict
from uuid import UUID
import httpx
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from product_service.src.models.product import (
    Category,
    Product,
    ProductImage,
    ProductReview,
)
from product_service.src.core.config.settings import settings
from product_service.src.core.redis_client import get_redis_client


class ProductService:
    """Service for product catalog operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy AsyncSession for database operations
        """
        self.db = db

    @staticmethod
    def _normalize_slug(value: str) -> str:
        return value.strip().lower()

    @staticmethod
    def _normalize_name(value: str) -> str:
        return value.strip()

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

    async def _hydrate_products(self, products: list[Product]) -> list[Product]:
        if not products:
            return products

        redis_client = get_redis_client()

        category_ids = {product.category_id for product in products}

        category_names_by_id: dict[UUID, str] = {}
        missing_category_ids: list[UUID] = []
        for category_id in category_ids:
            cache_key = f"product:category_name:{category_id}"
            cached_name = await redis_client.get(cache_key)
            if cached_name:
                category_names_by_id[category_id] = cached_name
            else:
                missing_category_ids.append(category_id)

        if missing_category_ids:
            category_result = await self.db.execute(
                select(Category).where(Category.id.in_(missing_category_ids))
            )
            fetched_categories = category_result.scalars().all()
            for category in fetched_categories:
                category_names_by_id[category.id] = category.name
                cache_key = f"product:category_name:{category.id}"
                await redis_client.set(cache_key, category.name, ex=settings.category_name_cache_ttl_seconds)

        product_ids = [product.id for product in products]
        image_result = await self.db.execute(
            select(ProductImage)
            .where(
                ProductImage.product_id.in_(product_ids),
                ProductImage.is_active.is_(True),
            )
            .order_by(ProductImage.product_id.asc(), ProductImage.position.asc(), ProductImage.created_at.asc())
        )

        cover_by_product: dict[UUID, str] = {}
        for image in image_result.scalars().all():
            if image.product_id not in cover_by_product:
                cover_by_product[image.product_id] = image.image_url

        seller_ids = {str(product.seller_user_id) for product in products}
        seller_names: dict[str, str] = {}
        missing_seller_ids: list[str] = []

        for seller_id in seller_ids:
            cache_key = f"product:seller_name:{seller_id}"
            cached_name = await redis_client.get(cache_key)
            if cached_name:
                seller_names[seller_id] = cached_name
            else:
                missing_seller_ids.append(seller_id)

        if missing_seller_ids:
            async with httpx.AsyncClient(timeout=2.5) as client:
                for seller_id in missing_seller_ids:
                    try:
                        response = await client.get(f"{settings.user_service_base_url}/users/{seller_id}")
                        if response.status_code != 200:
                            continue
                        data = response.json()
                        display_name = data.get("name") or data.get("email")
                        if isinstance(display_name, str) and display_name.strip():
                            normalized = display_name.strip()
                            seller_names[seller_id] = normalized
                            cache_key = f"product:seller_name:{seller_id}"
                            await redis_client.set(
                                cache_key,
                                normalized,
                                ex=settings.seller_name_cache_ttl_seconds,
                            )
                    except httpx.HTTPError:
                        continue

        for product in products:
            setattr(product, "category_name", category_names_by_id.get(product.category_id))
            setattr(product, "seller_display_name", seller_names.get(str(product.seller_user_id)))
            setattr(product, "cover_image_url", cover_by_product.get(product.id))

        return products

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
        products = result.scalars().all()
        return await self._hydrate_products(products)

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

    async def get_category_by_id(self, category_id: UUID) -> Category | None:
        result = await self.db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def create_category(self, payload) -> Category:
        if payload.parent_id is not None:
            parent = await self.get_category_by_id(payload.parent_id)
            if parent is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria padre no encontrada")

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
        category = await self.get_category_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")

        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates and isinstance(updates["name"], str):
            updates["name"] = self._normalize_name(updates["name"])
        if "slug" in updates and isinstance(updates["slug"], str):
            updates["slug"] = self._normalize_slug(updates["slug"])
        if "image_url" in updates and updates["image_url"] is not None:
            updates["image_url"] = str(updates["image_url"])

        if "parent_id" in updates and updates["parent_id"] is not None:
            if updates["parent_id"] == category_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoria no puede ser su propio padre")
            parent = await self.get_category_by_id(updates["parent_id"])
            if parent is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria padre no encontrada")

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
        category = await self.get_category_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")

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

    async def search_products(self, query_string: str, category_slug: str | None = None) -> list[Product]:
        """
        Search products by name or description (case-insensitive).

        Args:
            query_string: Search term (will be searched in name and description)
            category_slug: Optional category slug for filtering results

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

        if category_slug:
            query = query.join(Category).where(Category.slug == category_slug)

        result = await self.db.execute(query)
        products = result.scalars().all()
        return await self._hydrate_products(products)

    async def get_product_by_id(self, product_id: UUID) -> Product | None:
        """
        Get a single product by ID.

        Args:
            product_id: UUID of the product

        Returns:
            Product object if found, None otherwise
        """
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if product is None:
            return None
        hydrated = await self._hydrate_products([product])
        return hydrated[0]

    async def create_product(self, seller_user_id: UUID, payload) -> Product:
        """Create a new product listing owned by the authenticated seller."""
        product = Product(
            seller_user_id=seller_user_id,
            category_id=payload.category_id,
            name=self._normalize_name(payload.name),
            slug=self._normalize_slug(payload.slug),
            description=payload.description,
            price=payload.price,
            stock=payload.stock,
            is_active=True,
        )
        self.db.add(product)
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Slug ya existe o categoria invalida",
            ) from exc
        await self.db.refresh(product)
        hydrated = await self._hydrate_products([product])
        return hydrated[0]

    async def get_my_products(self, seller_user_id: UUID) -> list[Product]:
        """Return listings created by the authenticated seller."""
        result = await self.db.execute(
            select(Product)
            .where(Product.seller_user_id == seller_user_id)
            .order_by(Product.created_at.desc())
        )
        products = result.scalars().all()
        return await self._hydrate_products(products)

    async def update_product(self, product_id: UUID, seller_user_id: UUID, payload) -> Product:
        """Update seller's own listing."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates and isinstance(updates["name"], str):
            updates["name"] = self._normalize_name(updates["name"])
        if "slug" in updates and isinstance(updates["slug"], str):
            updates["slug"] = self._normalize_slug(updates["slug"])

        for field, value in updates.items():
            setattr(product, field, value)

        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Slug ya existe o datos invalidos",
            ) from exc
        await self.db.refresh(product)
        hydrated = await self._hydrate_products([product])
        return hydrated[0]

    async def deactivate_product(self, product_id: UUID, seller_user_id: UUID) -> None:
        """Soft-delete a listing by setting it inactive."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes eliminar este producto")

        product.is_active = False
        await self.db.commit()

    async def create_review(self, product_id: UUID, reviewer_user_id: UUID, payload) -> ProductReview:
        """Create or update review for a product by the authenticated user."""
        product = await self.get_product_by_id(product_id)
        if product is None or not product.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id == reviewer_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes reseñar tu propio producto",
            )

        existing = await self.db.execute(
            select(ProductReview).where(
                ProductReview.product_id == product_id,
                ProductReview.reviewer_user_id == reviewer_user_id,
            )
        )
        review = existing.scalar_one_or_none()

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
        """Return active reviews for a given product."""
        result = await self.db.execute(
            select(ProductReview)
            .where(ProductReview.product_id == product_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def add_product_image(self, product_id: UUID, seller_user_id: UUID, payload) -> ProductImage:
        """Attach an image to a seller's own product."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        images_count_result = await self.db.execute(
            select(func.count(ProductImage.id)).where(
                ProductImage.product_id == product_id,
                ProductImage.is_active.is_(True),
            )
        )
        if int(images_count_result.scalar() or 0) >= settings.max_images_per_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximo de imagenes alcanzado ({settings.max_images_per_product})",
            )

        image = ProductImage(
            product_id=product_id,
            image_url=str(payload.image_url).strip(),
            alt_text=payload.alt_text.strip() if isinstance(payload.alt_text, str) else payload.alt_text,
            position=payload.position,
            is_active=True,
        )
        self.db.add(image)
        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def update_product_image(self, product_id: UUID, image_id: UUID, seller_user_id: UUID, payload) -> ProductImage:
        """Update image metadata for a seller owned listing."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        result = await self.db.execute(
            select(ProductImage).where(ProductImage.id == image_id, ProductImage.product_id == product_id)
        )
        image = result.scalar_one_or_none()
        if image is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        updates = payload.model_dump(exclude_unset=True)
        if "image_url" in updates and updates["image_url"] is not None:
            updates["image_url"] = str(updates["image_url"]).strip()
        if "alt_text" in updates and isinstance(updates["alt_text"], str):
            updates["alt_text"] = updates["alt_text"].strip() or None

        for field, value in updates.items():
            setattr(image, field, value)

        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def deactivate_product_image(self, product_id: UUID, image_id: UUID, seller_user_id: UUID) -> None:
        """Soft-delete a product image for owned listing."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        result = await self.db.execute(
            select(ProductImage).where(ProductImage.id == image_id, ProductImage.product_id == product_id)
        )
        image = result.scalar_one_or_none()
        if image is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        image.is_active = False
        await self.db.commit()

    async def reorder_product_images(self, product_id: UUID, seller_user_id: UUID, payload) -> list[ProductImage]:
        """Reorder product images in batch by explicit positions."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        requested_ids = [item.image_id for item in payload.items]
        if len(requested_ids) != len(set(requested_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Imagen duplicada en el reordenamiento")

        result = await self.db.execute(
            select(ProductImage).where(
                ProductImage.product_id == product_id,
                ProductImage.id.in_(requested_ids),
                ProductImage.is_active.is_(True),
            )
        )
        images = result.scalars().all()
        if len(images) != len(requested_ids):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Una o mas imagenes no existen")

        by_id = {image.id: image for image in images}
        for item in payload.items:
            by_id[item.image_id].position = item.position

        await self.db.commit()
        refreshed = await self.get_product_images(product_id)
        return refreshed

    async def set_cover_image(self, product_id: UUID, image_id: UUID, seller_user_id: UUID) -> list[ProductImage]:
        """Set one image as cover by moving it to position 0 and shifting others."""
        product = await self.get_product_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        images = await self.get_product_images(product_id)
        if not images:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay imagenes activas")

        cover = next((img for img in images if img.id == image_id), None)
        if cover is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        ordered = [cover] + [img for img in images if img.id != image_id]
        for index, image in enumerate(ordered):
            image.position = index

        await self.db.commit()
        return await self.get_product_images(product_id)

    async def get_product_images(self, product_id: UUID) -> list[ProductImage]:
        """Return active gallery images for a product."""
        result = await self.db.execute(
            select(ProductImage)
            .where(
                ProductImage.product_id == product_id,
                ProductImage.is_active.is_(True),
            )
            .order_by(ProductImage.position.asc(), ProductImage.created_at.asc())
        )
        return result.scalars().all()

    async def get_reviews_by_user(self, reviewer_user_id: UUID) -> list[ProductReview]:
        """Return reviews authored by current user (for profile)."""
        result = await self.db.execute(
            select(ProductReview)
            .where(ProductReview.reviewer_user_id == reviewer_user_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def get_reviews_about_seller(self, seller_user_id: UUID) -> list[ProductReview]:
        """Return reviews received by seller across all listings."""
        result = await self.db.execute(
            select(ProductReview)
            .join(Product, Product.id == ProductReview.product_id)
            .where(Product.seller_user_id == seller_user_id, ProductReview.is_active.is_(True))
            .order_by(ProductReview.created_at.desc())
        )
        return result.scalars().all()

    async def get_seller_rating_summary(self, seller_user_id: UUID) -> dict[str, float | int]:
        """Compute average rating and count for seller listings."""
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

    async def get_stock_info(self, product_ids: list[UUID]) -> list[dict]:
        """Return stock and pricing details for requested products."""
        unique_ids = list(dict.fromkeys(product_ids))
        if not unique_ids:
            return []

        result = await self.db.execute(select(Product).where(Product.id.in_(unique_ids)))
        products_by_id = {product.id: product for product in result.scalars().all()}

        items: list[dict] = []
        for product_id in unique_ids:
            product = products_by_id.get(product_id)
            if product is None:
                continue

            items.append(
                {
                    "product_id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "stock": product.stock,
                    "available": bool(product.is_active and product.stock > 0),
                }
            )

        return items

    async def reserve_stock(self, items: list[dict]) -> None:
        """Atomically reserve stock for multiple products."""
        totals_by_product_id: dict[UUID, int] = defaultdict(int)
        for item in items:
            totals_by_product_id[item["product_id"]] += int(item["quantity"])

        product_ids = list(totals_by_product_id.keys())
        result = await self.db.execute(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
        products_by_id = {product.id: product for product in result.scalars().all()}

        missing = [str(pid) for pid in product_ids if pid not in products_by_id]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found: {', '.join(missing)}",
            )

        for product_id, requested_qty in totals_by_product_id.items():
            product = products_by_id[product_id]
            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product '{product.name}' is not available.",
                )
            if product.stock < requested_qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for '{product.name}'.",
                )

        for product_id, requested_qty in totals_by_product_id.items():
            products_by_id[product_id].stock -= requested_qty

        await self.db.commit()

    async def release_stock(self, items: list[dict]) -> None:
        """Release previously reserved stock for multiple products."""
        totals_by_product_id: dict[UUID, int] = defaultdict(int)
        for item in items:
            totals_by_product_id[item["product_id"]] += int(item["quantity"])

        product_ids = list(totals_by_product_id.keys())
        result = await self.db.execute(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
        products_by_id = {product.id: product for product in result.scalars().all()}

        missing = [str(pid) for pid in product_ids if pid not in products_by_id]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found: {', '.join(missing)}",
            )

        for product_id, quantity in totals_by_product_id.items():
            products_by_id[product_id].stock += quantity

        await self.db.commit()
