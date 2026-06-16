"""HTTP client for product-service read-only operations (seller listings)."""

from __future__ import annotations

import logging
from uuid import UUID

import httpx
from fastapi import HTTPException, status

from order_service.src.core.config.settings import settings

logger = logging.getLogger(__name__)


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
            kwargs: dict = {
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
