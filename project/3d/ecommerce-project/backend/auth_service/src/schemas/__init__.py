"""Pydantic schemas for auth_service."""

from auth_service.src.schemas.auth import TokenResponse, UserLogin
from auth_service.src.schemas.user import UserRegister, UserResponse

__all__ = ["UserLogin", "TokenResponse", "UserRegister", "UserResponse"]
