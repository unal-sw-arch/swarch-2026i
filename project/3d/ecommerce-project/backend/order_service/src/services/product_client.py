"""HTTP client for product-service inventory operations."""

from __future__ import annotations

import logging
from uuid import UUID

import httpx
from fastapi import HTTPException, status

from order_service.src.core.config import settings
from order_service.src.schemas.orders import ProductStockInfo

logger = logging.getLogger(__name__)


class ProductServiceClientError(Exception):
    """Raised when product-service returns an unexpected response."""


def _base_url() -> str:
    return settings.PRODUCT_SERVICE_URL.rstrip("/")


def _auth_headers(auth_token: str) -> dict[str, str]:
    token = auth_token.strip()
    if not token:
        return {}
    return {"Authorization": f"Bearer {token}"}


def _response_detail(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return response.text or "Unexpected response from product service."

    if isinstance(data, dict):
        detail = data.get("detail")
        if isinstance(detail, str):
            return detail
    return "Unexpected response from product service."


async def _request(
    method: str,
    path: str,
    auth_token: str,
    payload: dict | None = None,
) -> httpx.Response:
    url = f"{_base_url()}{path}"

    try:
        async with httpx.AsyncClient(timeout=settings.PRODUCT_SERVICE_TIMEOUT_SECONDS) as client:
            kwargs = {
                "method": method,
                "url": url,
                "headers": _auth_headers(auth_token),
            }
            if payload is not None:
                kwargs["json"] = payload
            return await client.request(**kwargs)
    except httpx.RequestError as exc:
        logger.warning("Product service request failed: %s %s", method, url)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach product service. Please try again later.",
        ) from exc


async def get_my_seller_products(auth_token: str) -> dict[UUID, str]:
    """Return product IDs and names for the authenticated seller."""
    response = await _request("GET", "/products/mine/listings", auth_token)

    if response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))
    if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Product service is temporarily unavailable.",
        )
    if response.status_code >= status.HTTP_400_BAD_REQUEST:
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))

    body = response.json()
    if not isinstance(body, list):
        return {}

    products: dict[UUID, str] = {}
    for raw in body:
        if not isinstance(raw, dict):
            continue

        raw_id = raw.get("id")
        if not isinstance(raw_id, str):
            continue

        try:
            product_id = UUID(raw_id)
        except ValueError:
            continue

        name_raw = raw.get("name")
        if isinstance(name_raw, str) and name_raw.strip():
            products[product_id] = name_raw.strip()
        else:
            products[product_id] = str(product_id)

    return products


async def get_products_stock(product_ids: list[UUID], auth_token: str) -> dict[UUID, ProductStockInfo]:
    """Fetch current stock/price metadata for a batch of product IDs."""
    if not product_ids:
        return {}

    payload = {"product_ids": [str(pid) for pid in product_ids]}
    response = await _request("POST", "/internal/products/stock-info", auth_token, payload)

    if response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))
    if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Product service is temporarily unavailable.",
        )
    if response.status_code >= status.HTTP_400_BAD_REQUEST:
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))

    body = response.json()
    items = body.get("items", []) if isinstance(body, dict) else []

    parsed: dict[UUID, ProductStockInfo] = {}
    for raw in items:
        item = ProductStockInfo(**raw)
        parsed[item.product_id] = item

    return parsed


async def reserve_stock(reservations: list[dict[str, str | int]], auth_token: str) -> bool:
    """Attempt to reserve stock in product-service.

    Returns False for normal stock conflict (HTTP 409).
    """
    if not reservations:
        return True

    payload = {"items": reservations}
    response = await _request("POST", "/internal/products/reserve", auth_token, payload)

    if response.status_code == status.HTTP_409_CONFLICT:
        return False
    if response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))
    if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Product service is temporarily unavailable.",
        )
    if response.status_code >= status.HTTP_400_BAD_REQUEST:
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))

    body = response.json()
    if isinstance(body, dict):
        return bool(body.get("success", True))
    return True


async def release_stock(reservations: list[dict[str, str | int]], auth_token: str) -> None:
    """Release previously reserved stock in product-service."""
    if not reservations:
        return

    payload = {"items": reservations}
    response = await _request("POST", "/internal/products/release", auth_token, payload)

    if response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))
    if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Product service is temporarily unavailable.",
        )
    if response.status_code >= status.HTTP_400_BAD_REQUEST:
        raise HTTPException(status_code=response.status_code, detail=_response_detail(response))
