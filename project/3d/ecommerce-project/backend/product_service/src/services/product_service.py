"""Product Service - Business logic for product catalog operations."""

import asyncio
import uuid as _uuid
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
import httpx
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from product_service.src.models.product import Category, Product, ProductImage, ProductReview
from product_service.src.models.reservation import StockReservation
from product_service.src.core.config.settings import settings
from product_service.src.core.redis_client import get_redis_client

# Reuse a single httpx client across requests to avoid per-call TCP handshakes.
_http_client: httpx.AsyncClient | None = None

def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=2.5)
    return _http_client

# Sentinel stored in Redis when a seller is not found in user-service.
# Prevents repeated HTTP calls for sellers that don't exist there.
_SELLER_NOT_FOUND = "__NOT_FOUND__"
_SELLER_NOT_FOUND_TTL = 120  # seconds before retrying unknown sellers


class ProductService:
    """Service for product catalog operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _normalize_slug(value: str) -> str:
        return value.strip().lower()

    @staticmethod
    def _normalize_name(value: str) -> str:
        return value.strip()

    async def _hydrate_products(self, products: list[Product]) -> list[Product]:
        if not products:
            return products

        redis_client = get_redis_client()

        category_ids = {product.category_id for product in products}

        category_names_by_id: dict[UUID, str] = {}
        missing_category_ids: list[UUID] = []

        # Fetch all cached category names in one Redis call
        cache_keys = [f"product:category_name:{cat_id}" for cat_id in category_ids]
        cached_values = await redis_client.mget(cache_keys) if cache_keys else []

        for cache_key, cached_name in zip(cache_keys, cached_values):
            if cached_name:
                category_id = UUID(cache_key.split(":")[-1])
                category_names_by_id[category_id] = cached_name
            else:
                category_id = UUID(cache_key.split(":")[-1])
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

        # Fetch all cached seller names in one Redis call
        seller_cache_keys = [f"product:seller_name:{seller_id}" for seller_id in seller_ids]
        cached_seller_values = await redis_client.mget(seller_cache_keys) if seller_cache_keys else []

        for cache_key, cached_name in zip(seller_cache_keys, cached_seller_values):
            seller_id = cache_key.split(":")[-1]
            if cached_name is None:
                missing_seller_ids.append(seller_id)
            elif cached_name != _SELLER_NOT_FOUND:
                seller_names[seller_id] = cached_name
            # cached_name == _SELLER_NOT_FOUND → known miss, skip HTTP call

        if missing_seller_ids:
            client = get_http_client()

            async def fetch_seller_name(seller_id: str) -> tuple[str, str | None]:
                try:
                    response = await client.get(f"{settings.user_service_base_url}/users/{seller_id}")
                    if response.status_code != 200:
                        return seller_id, None
                    data = response.json()
                    display_name = data.get("name") or data.get("email")
                    if isinstance(display_name, str) and display_name.strip():
                        return seller_id, display_name.strip()
                    return seller_id, None
                except httpx.HTTPError:
                    return seller_id, None

            results = await asyncio.gather(*[fetch_seller_name(sid) for sid in missing_seller_ids])
            for seller_id, display_name in results:
                cache_key = f"product:seller_name:{seller_id}"
                if display_name:
                    seller_names[seller_id] = display_name
                    await redis_client.set(cache_key, display_name, ex=settings.seller_name_cache_ttl_seconds)
                else:
                    # Cache the not-found result to avoid repeated HTTP calls.
                    await redis_client.set(cache_key, _SELLER_NOT_FOUND, ex=_SELLER_NOT_FOUND_TTL)

        # Batch-compute average_rating and review_count for all products
        rating_result = await self.db.execute(
            select(
                ProductReview.product_id,
                func.avg(ProductReview.rating).label("avg_rating"),
                func.count(ProductReview.id).label("cnt"),
            )
            .where(
                ProductReview.product_id.in_(product_ids),
                ProductReview.is_active.is_(True),
            )
            .group_by(ProductReview.product_id)
        )
        rating_by_product: dict[UUID, tuple[float, int]] = {
            row.product_id: (float(row.avg_rating), int(row.cnt))
            for row in rating_result
        }

        for product in products:
            setattr(product, "category_name", category_names_by_id.get(product.category_id))
            setattr(product, "seller_display_name", seller_names.get(str(product.seller_user_id)))
            setattr(product, "cover_image_url", cover_by_product.get(product.id))
            rating_data = rating_by_product.get(product.id)
            setattr(product, "average_rating", round(rating_data[0], 2) if rating_data else None)
            setattr(product, "review_count", rating_data[1] if rating_data else 0)

        return products

    async def get_all_products(
        self,
        category_slug: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
    ) -> list[Product]:
        """Get all active products, optionally filtered by category and price range."""
        query = select(Product).where(Product.is_active.is_(True))

        if category_slug:
            query = query.join(Category).where(Category.slug == category_slug)
        if min_price is not None:
            query = query.where(Product.price >= min_price)
        if max_price is not None:
            query = query.where(Product.price <= max_price)
        if max_price is not None and min_price is None:
            query = query.order_by(Product.price.asc())

        result = await self.db.execute(query)
        products = result.scalars().all()
        return await self._hydrate_products(products)


    async def search_products(
        self,
        query_string: str,
        category_slug: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
    ) -> list[Product]:
        """Search products by name or description with optional price range filter."""
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
        if min_price is not None:
            query = query.where(Product.price >= min_price)
        if max_price is not None:
            query = query.where(Product.price <= max_price)
        if max_price is not None and min_price is None:
            query = query.order_by(Product.price.asc())

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

    async def reserve_stock(self, items: list[dict], order_id: UUID) -> UUID:
        """Atomically reserve stock for multiple products and create StockReservation rows.

        Returns the reservation_id UUID grouping all items for this order.
        Raises HTTPException on insufficient stock or missing products.
        """
        totals_by_product_id: dict[UUID, int] = defaultdict(int)
        for item in items:
            totals_by_product_id[UUID(str(item["product_id"]))] += int(item["quantity"])

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

        reservation_id = _uuid.uuid4()
        expires_at = datetime.utcnow() + timedelta(minutes=15)

        for product_id, requested_qty in totals_by_product_id.items():
            products_by_id[product_id].stock -= requested_qty
            self.db.add(StockReservation(
                reservation_id=reservation_id,
                order_id=order_id,
                product_id=product_id,
                quantity_reserved=requested_qty,
                expires_at=expires_at,
                status="ACTIVE",
            ))

        await self.db.commit()
        return reservation_id

    async def release_stock(self, order_id: UUID) -> bool:
        """Release stock for all ACTIVE reservations of the given order_id.

        Returns True if reservations were found and released, False if none existed.
        """
        result = await self.db.execute(
            select(StockReservation).where(
                StockReservation.order_id == order_id,
                StockReservation.status == "ACTIVE",
            ).with_for_update()
        )
        reservations = result.scalars().all()

        if not reservations:
            return False

        product_ids = [r.product_id for r in reservations]
        prod_result = await self.db.execute(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
        products_by_id = {p.id: p for p in prod_result.scalars().all()}

        for reservation in reservations:
            product = products_by_id.get(reservation.product_id)
            if product:
                product.stock += reservation.quantity_reserved
            reservation.status = "RELEASED"

        await self.db.commit()
        return True
