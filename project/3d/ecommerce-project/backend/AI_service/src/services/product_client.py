"""HTTP client for product-service catalog queries."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from ..core.config import settings

logger = logging.getLogger(__name__)


def _base_url() -> str:
    return settings.product_service_url.rstrip("/")


def _auth_headers(auth_token: str | None) -> dict[str, str]:
    if not auth_token:
        return {}
    token = auth_token.strip()
    if not token:
        return {}
    if token.lower().startswith("bearer "):
        return {"Authorization": token}
    return {"Authorization": f"Bearer {token}"}


async def _get_json(
    path: str,
    auth_token: str | None,
    params: dict[str, str] | None = None,
) -> Any:
    url = f"{_base_url()}{path}"
    try:
        async with httpx.AsyncClient(timeout=settings.product_service_timeout_seconds) as client:
            response = await client.get(url, params=params, headers=_auth_headers(auth_token))
    except httpx.RequestError as exc:
        logger.warning("product-service request failed: %s %s (%s)", "GET", url, exc)
        return None

    if response.status_code != 200:
        logger.info(
            "product-service GET %s returned %s",
            path,
            response.status_code,
        )
        return None

    try:
        return response.json()
    except ValueError:
        logger.warning("product-service GET %s returned non-JSON body", path)
        return None


async def search_products(
    query: str,
    auth_token: str | None,
    limit: int = 5,
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[dict[str, Any]]:
    """Search products by query string with optional price filters."""
    query = (query or "").strip()
    if not query:
        return []

    params: dict[str, str] = {"q": query[:100]}
    if min_price is not None:
        params["min_price"] = str(min_price)
    if max_price is not None:
        params["max_price"] = str(max_price)

    data = await _get_json("/products/search", auth_token, params=params)
    if not isinstance(data, list):
        return []
    return data[:limit]


async def list_products(
    auth_token: str | None,
    limit: int = 10,
    max_price: float | None = None,
) -> list[dict[str, Any]]:
    """Return the general product catalog with optional price ceiling."""
    params: dict[str, str] | None = None
    if max_price is not None:
        params = {"max_price": str(max_price)}

    data = await _get_json("/products/", auth_token, params=params)
    if not isinstance(data, list):
        return []
    return data[:limit]
