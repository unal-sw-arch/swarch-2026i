"""Background product index synchronization.

product-service publishes no product events, so the index is kept in sync
by polling GET /products/ (public endpoint) at startup and on a fixed
interval. Embeddings are only recomputed when the content hash changes.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import delete, select, update as sa_update
from sqlalchemy.dialects.postgresql import insert as pg_insert

from ..core.config import settings
from ..core.database import AsyncSessionLocal
from ..models.product_embedding import ProductEmbedding
from . import embedding_service, product_client

logger = logging.getLogger(__name__)


def _content_hash(product: dict[str, Any]) -> str:
    raw = "|".join(
        str(product.get(field) or "")
        for field in ("name", "description", "price", "stock", "is_active", "category_name")
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _embedding_text(product: dict[str, Any]) -> str:
    parts = [product.get("name") or ""]
    if product.get("category_name"):
        parts.append(product["category_name"])
    if product.get("description"):
        parts.append(product["description"])
    return ". ".join(part.strip() for part in parts if part.strip())


def _as_uuid(value: Any) -> uuid.UUID | None:
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


async def sync_products_once() -> int:
    """Fetch the catalog and upsert changed products. Returns synced count."""
    products = await product_client.list_products(None, limit=10_000)
    if not products:
        logger.info("Product index sync: catalog empty or product-service unreachable")
        return 0

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(ProductEmbedding.product_id, ProductEmbedding.content_hash)
        )
        existing_hashes = {row.product_id: row.content_hash for row in result}

        seen_ids: list[uuid.UUID] = []
        to_upsert: list[dict[str, Any]] = []
        # Full rating map for all products (used for rating-only updates)
        all_ratings: dict[uuid.UUID, tuple[float | None, int]] = {}

        for product in products:
            product_id = _as_uuid(product.get("id"))
            if product_id is None:
                continue
            seen_ids.append(product_id)

            avg_r = product.get("average_rating")
            rc = int(product.get("review_count") or 0)
            all_ratings[product_id] = (float(avg_r) if avg_r is not None else None, rc)

            content_hash = _content_hash(product)
            if existing_hashes.get(product_id) == content_hash:
                continue

            to_upsert.append(
                {
                    "product_id": product_id,
                    "name": (product.get("name") or "")[:255],
                    "description": product.get("description"),
                    "price": product.get("price") or 0,
                    "stock": product.get("stock") or 0,
                    "is_active": bool(product.get("is_active", True)),
                    "category_id": _as_uuid(product.get("category_id")),
                    "category_name": (product.get("category_name") or None),
                    "average_rating": float(avg_r) if avg_r is not None else None,
                    "review_count": rc,
                    "content_hash": content_hash,
                    "text": _embedding_text(product),
                }
            )

        upserted_ids: set[uuid.UUID] = set()
        if to_upsert:
            vectors = await embedding_service.embed_texts([row.pop("text") for row in to_upsert])
            now = datetime.utcnow()
            for row, vector in zip(to_upsert, vectors):
                row["embedding"] = vector
                row["indexed_at"] = now
                upserted_ids.add(row["product_id"])

            statement = pg_insert(ProductEmbedding).values(to_upsert)
            statement = statement.on_conflict_do_update(
                index_elements=[ProductEmbedding.product_id],
                set_={
                    column: getattr(statement.excluded, column)
                    for column in (
                        "name", "description", "price", "stock", "is_active",
                        "category_id", "category_name", "average_rating",
                        "review_count", "content_hash", "embedding", "indexed_at",
                    )
                },
            )
            await session.execute(statement)

        # Update rating fields for products whose content did not change.
        rating_only_ids = set(existing_hashes.keys()) - upserted_ids
        for pid in rating_only_ids:
            avg_r, rc = all_ratings.get(pid, (None, 0))
            await session.execute(
                sa_update(ProductEmbedding)
                .where(ProductEmbedding.product_id == pid)
                .values(average_rating=avg_r, review_count=rc)
            )

        # Remove products no longer present in the catalog.
        removed_ids = set(existing_hashes) - set(seen_ids)
        if removed_ids:
            await session.execute(
                delete(ProductEmbedding).where(ProductEmbedding.product_id.in_(removed_ids))
            )

        await session.commit()

    logger.info(
        "Product index sync: %s products seen, %s upserted, %s removed",
        len(seen_ids), len(to_upsert), len(removed_ids),
    )
    return len(seen_ids)


async def run_indexer_loop() -> None:
    """Sync immediately, then on every refresh interval. Never raises."""
    while True:
        try:
            await sync_products_once()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.warning("Product index sync failed (will retry): %s", exc)
        await asyncio.sleep(settings.ai_index_refresh_seconds)
