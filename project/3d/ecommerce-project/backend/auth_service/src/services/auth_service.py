"""Auth business logic for register/login operations."""

import hashlib
import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.src.events.publisher import EventPublisher
from auth_service.src.core.redis_client import get_redis_client
from auth_service.src.core.config.settings import settings
from auth_service.src.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from auth_service.src.models.user import User
from auth_service.src.schemas.auth import TokenResponse
from auth_service.src.schemas.user import UserRegister, UserResponse

publisher = EventPublisher(
    host=settings.rabbitmq_host,
    queue_name=settings.user_profile_queue_name,
)
logger = logging.getLogger(__name__)

def _normalize_email(email: str) -> str:
    return email.lower().strip()


def _token_fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _session_key(token: str) -> str:
    return f"{settings.auth_session_prefix}:{_token_fingerprint(token)}"


def _blacklist_key(token: str) -> str:
    return f"{settings.auth_blacklist_prefix}:{_token_fingerprint(token)}"


def _token_ttl_seconds(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc
    exp_raw = payload.get("exp")
    if not isinstance(exp_raw, int):
        return settings.jwt_expire_minutes * 60
    now_ts = int(datetime.now(timezone.utc).timestamp())
    return max(1, exp_raw - now_ts)


async def store_token_session(token: str, user_id: str) -> None:
    """Store active token session in Redis."""
    redis_client = get_redis_client()
    ttl = _token_ttl_seconds(token)
    try:
        await redis_client.set(_session_key(token), user_id, ex=ttl)
    except Exception:
        if not settings.redis_fail_open:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Session store unavailable",
            )
        logger.warning("Redis unavailable while storing auth session for user_id=%s", user_id)


async def revoke_token(token: str) -> None:
    """Blacklist a token in Redis until it expires."""
    redis_client = get_redis_client()
    ttl = _token_ttl_seconds(token)
    try:
        await redis_client.set(_blacklist_key(token), "1", ex=ttl)
        await redis_client.delete(_session_key(token))
    except Exception:
        if not settings.redis_fail_open:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Session store unavailable",
            )
        logger.warning("Redis unavailable while revoking auth token")


def _publish_user_registered_event(auth_user_id: str, full_name: str, email: str) -> bool:
    event_payload = {
        "auth_user_id": auth_user_id,
        "full_name": full_name,
        "email": email,
        "phone": None,
        "role": "customer",
    }
    return publisher.publish("AUTH_USER_REGISTERED", event_payload)

async def register_user(user_data: UserRegister, db: AsyncSession) -> UserResponse:
    """Register a new user and return sanitized user payload."""
    new_user = User(
        email=str(user_data.email).lower().strip(),
        password_hash=hash_password(user_data.password),
    )
    db.add(new_user)

    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from exc
    
    normalized_email = _normalize_email(str(user_data.email))
    published = _publish_user_registered_event(str(new_user.id), user_data.full_name, normalized_email)
    if not published:
        # Keep auth registration available even when asynchronous profile propagation is down.
        logger.warning(
            "AUTH_USER_REGISTERED event could not be published for user_id=%s",
            new_user.id,
        )

    return UserResponse.model_validate(new_user)


async def login_user(email: str, password: str, db: AsyncSession) -> TokenResponse:
    """Authenticate user credentials and issue JWT token."""
    normalized_email = email.lower().strip()

    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalars().first()

    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user.id))
    await store_token_session(token, str(user.id))
    return TokenResponse(access_token=token)


async def get_auth_user_by_id(user_id: UUID, db: AsyncSession) -> UserResponse:
    """Return auth user by id for cross-service identity resolution."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auth user not found",
        )
    return UserResponse.model_validate(user)
