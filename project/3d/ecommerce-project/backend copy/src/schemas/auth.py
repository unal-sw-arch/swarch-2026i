"""Schemas for authentication endpoints.

Defines request and response models for auth operations.
"""

from pydantic import BaseModel


class UserLogin(BaseModel):
    """
    Schema for user login request.

    Attributes:
        email: User's email address.
        password: User's plain text password (will be verified against hash).
    """

    email: str
    password: str


class TokenResponse(BaseModel):
    """
    Schema for JWT token response.

    Attributes:
        access_token: JWT token (signed with jwt_secret).
        token_type: Token type (always "bearer" for JWT).

    Note:
        Client should include token in Authorization header as:
        "Authorization: Bearer <access_token>"
    """

    access_token: str
    token_type: str = "bearer"
