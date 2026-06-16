from __future__ import annotations

import logging
import uuid

from jose import JWTError, jwt

from .config import settings

logger = logging.getLogger(__name__)


def get_user_id_from_token(auth_header: str | None) -> uuid.UUID | None:
    """Extract user_id (sub claim) from Bearer token. Returns None on failure."""
    if not auth_header or not settings.auth_jwt_secret:
        return None
    token = auth_header.strip()
    if token.lower().startswith("bearer "):
        token = token[7:]
    try:
        payload = jwt.decode(token, settings.auth_jwt_secret, algorithms=[settings.jwt_algorithm])
        sub = payload.get("sub")
        if not sub:
            return None
        return uuid.UUID(str(sub))
    except (JWTError, ValueError, AttributeError):
        logger.debug("Could not decode JWT")
        return None
