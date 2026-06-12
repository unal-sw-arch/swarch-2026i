from __future__ import annotations

import logging
from typing import Any

import httpx

from ..core.config import settings

logger = logging.getLogger(__name__)


def _auth_headers(auth_token: str | None) -> dict[str, str]:
    if not auth_token:
        return {}
    token = auth_token.strip()
    if token.lower().startswith("bearer "):
        return {"Authorization": token}
    return {"Authorization": f"Bearer {token}"}


async def get_my_orders(auth_token: str | None, limit: int = 10) -> list[dict[str, Any]]:
    """Fetch authenticated user's order history from order-service."""
    if not auth_token:
        return []
    url = f"{settings.order_service_url.rstrip('/')}/api/v1/orders/"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(
                url,
                params={"page_size": limit},
                headers=_auth_headers(auth_token),
            )
        if response.status_code != 200:
            return []
        data = response.json()
        if isinstance(data, list):
            return data[:limit]
        if isinstance(data, dict) and "items" in data:
            return data["items"][:limit]
        return []
    except Exception as exc:
        logger.warning("order-service request failed: %s", exc)
        return []
