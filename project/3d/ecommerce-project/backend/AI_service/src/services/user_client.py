from __future__ import annotations

import logging
from typing import Any

import httpx

from ..core.config import settings

logger = logging.getLogger(__name__)


async def get_user(user_id: str) -> dict[str, Any] | None:
    """Fetch user profile by ID from user-service (unauthenticated endpoint)."""
    url = f"{settings.user_service_url.rstrip('/')}/users/{user_id}"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url)
        if response.status_code != 200:
            return None
        return response.json()
    except Exception as exc:
        logger.warning("user-service request failed: %s", exc)
        return None
