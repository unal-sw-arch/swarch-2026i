"""Semantic product retrieval over pgvector, with user purchase-profile boost.

Every public function is fail-open: on any database/Redis error it returns
an empty result so the chat can fall back to keyword search.
"""

from __future__ import annotations

import json
import logging
import math
import uuid
from typing import Any

from sqlalchemy import select

from ..core.config import settings
from ..core.database import AsyncSessionLocal
from ..core.redis_client import get_redis_client
from ..models.product_embedding import ProductEmbedding
from . import order_client

logger = logging.getLogger(__name__)

_PROFILE_VEC_TTL = 300  # seconds, mirrors user_context cache


def _profile_key(user_id: uuid.UUID) -> str:
    return f"ai:profile_vec:{user_id}"


async def semantic_search(
    query_vec: list[float],
    profile_vec: list[float] | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    limit: int | None = None,
) -> list[dict[str, Any]]:
    """Rank active, in-stock products by cosine distance to the query.

    When a profile vector is available the ranking blends both distances:
    (1 - w) * dist(query) + w * dist(profile).
    """
    if not query_vec:
        return []
    limit = limit or settings.ai_rag_top_k

    try:
        distance = ProductEmbedding.embedding.cosine_distance(query_vec)
        if profile_vec:
            weight = min(max(settings.ai_profile_weight, 0.0), 1.0)
            profile_distance = ProductEmbedding.embedding.cosine_distance(profile_vec)
            ranking = (1.0 - weight) * distance + weight * profile_distance
        else:
            ranking = distance

        query = (
            select(ProductEmbedding)
            .where(ProductEmbedding.is_active.is_(True))
            .where(ProductEmbedding.stock > 0)
        )
        if min_price is not None:
            query = query.where(ProductEmbedding.price >= min_price)
        if max_price is not None:
            query = query.where(ProductEmbedding.price <= max_price)
        query = query.order_by(ranking).limit(limit)

        async with AsyncSessionLocal() as session:
            result = await session.execute(query)
            rows = result.scalars().all()

        return [
            {
                "id": str(row.product_id),
                "name": row.name,
                "description": row.description,
                "price": str(row.price),
                "stock": row.stock,
                "category_name": row.category_name,
                "average_rating": float(row.average_rating) if row.average_rating is not None else None,
                "review_count": row.review_count or 0,
            }
            for row in rows
        ]
    except Exception as exc:
        logger.warning("semantic_search failed (falling back to keyword): %s", exc)
        return []


def _normalize(vector: list[float]) -> list[float] | None:
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return None
    return [value / norm for value in vector]


def _mean_vector(vectors: list[list[float]]) -> list[float] | None:
    if not vectors:
        return None
    dims = len(vectors[0])
    mean = [sum(vector[i] for vector in vectors) / len(vectors) for i in range(dims)]
    return _normalize(mean)


async def get_profile_vector(
    user_id: uuid.UUID | None,
    auth_token: str | None,
) -> list[float] | None:
    """Average embedding of the products the user has bought (cached 5 min)."""
    if not user_id or not auth_token:
        return None

    try:
        r = get_redis_client()
        cached = await r.get(_profile_key(user_id))
        if cached:
            data = json.loads(cached)
            return data or None  # empty list marks "no purchases" negative cache
    except Exception as exc:
        logger.warning("profile_vec cache read failed: %s", exc)

    vector: list[float] | None = None
    try:
        orders = await order_client.get_my_orders(auth_token, limit=15)
        product_ids: list[uuid.UUID] = []
        for order in orders:
            for item in order.get("items", []):
                try:
                    product_ids.append(uuid.UUID(str(item.get("product_id"))))
                except (ValueError, TypeError):
                    continue

        if product_ids:
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(ProductEmbedding.embedding).where(
                        ProductEmbedding.product_id.in_(set(product_ids))
                    )
                )
                embeddings = [list(row[0]) for row in result]
            vector = _mean_vector(embeddings)
    except Exception as exc:
        logger.warning("profile_vec computation failed: %s", exc)
        return None

    try:
        r = get_redis_client()
        await r.set(_profile_key(user_id), json.dumps(vector or []), ex=_PROFILE_VEC_TTL)
    except Exception:
        pass

    return vector
