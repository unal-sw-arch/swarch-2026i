"""Security helpers for password, hashing and JWT operations."""

from datetime import datetime, timedelta, timezone
import re
import bcrypt
from fastapi import HTTPException, status
from jose import jwt

from auth_service.src.core.config.settings import settings


def hash_password(raw_password: str) -> str:
    """Hash a plain text password using bcrypt."""
    password_bytes = raw_password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")



def verify_password(raw_password: str, hashed_password: str) -> bool:
    """Verify plain text password against bcrypt hash."""
    return bcrypt.checkpw(
        raw_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )

def check_password(password: str) -> None:
    """
    Verify password complexity requirements:
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password must contain at least one uppercase letter."
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password must contain at least one lowercase letter."
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password must contain at least one digit."
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password must contain at least one special character."
        )

def create_access_token(user_id: str) -> str:
    """Create JWT token using configured secret and expiration."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
