"""Schemas for authentication endpoints."""

from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    """Schema for user login request."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"
