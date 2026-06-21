from __future__ import annotations

import json
import logging
import uuid
from collections import Counter
from typing import Any

from ..core.redis_client import get_redis_client
from . import order_client, user_client

logger = logging.getLogger(__name__)

_PROFILE_TTL = 300  # 5 minutes cache


def _key(user_id: uuid.UUID) -> str:
    return f"ai:profile:{user_id}"


def _extract_top_products(orders: list[dict[str, Any]], top_n: int = 5) -> list[str]:
    """Return the most frequently ordered product names."""
    counter: Counter = Counter()
    for order in orders:
        for item in order.get("items", []):
            name = item.get("product_name") or ""
            if name.strip():
                counter[name.strip()] += item.get("quantity", 1)
    return [name for name, _ in counter.most_common(top_n)]


async def get_user_context(user_id: uuid.UUID, auth_token: str | None) -> dict[str, Any]:
    """
    Fetch and cache user profile + order history.
    Returns {name, email, top_products, order_count} or empty dict on failure.
    """
    try:
        r = get_redis_client()
        cached = await r.get(_key(user_id))
        if cached:
            return json.loads(cached)
    except Exception as exc:
        logger.warning("user_context cache read failed: %s", exc)

    try:
        profile, orders = await _fetch_profile_and_orders(str(user_id), auth_token)
        top_products = _extract_top_products(orders)
        ctx: dict[str, Any] = {
            "name": (profile or {}).get("name") or "",
            "email": (profile or {}).get("email") or "",
            "top_products": top_products,
            "order_count": len(orders),
        }
    except Exception as exc:
        logger.warning("user_context fetch failed: %s", exc)
        return {}

    try:
        r = get_redis_client()
        await r.set(_key(user_id), json.dumps(ctx, ensure_ascii=False), ex=_PROFILE_TTL)
    except Exception:
        pass

    return ctx


async def _fetch_profile_and_orders(
    user_id: str, auth_token: str | None
) -> tuple[dict | None, list]:
    import asyncio
    profile, orders = await asyncio.gather(
        user_client.get_user(user_id),
        order_client.get_my_orders(auth_token, limit=15),
        return_exceptions=False,
    )
    return profile, orders or []
