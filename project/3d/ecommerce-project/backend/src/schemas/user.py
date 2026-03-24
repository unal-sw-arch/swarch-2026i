"""Schemas for user registration and responses.

Defines Pydantic models for request/response validation.
"""

import uuid

from pydantic import BaseModel


class UserRegister(BaseModel):
    """
    Schema for user registration request.

    Attributes:
        full_name: User's full name.
        email: User's email (must be unique).
        password: Plain text password (will be hashed before storage).
    """

    full_name: str
    password: str
    email: str


class UserResponse(BaseModel):
    """
    Schema for user response (excludes sensitive data).

    Attributes:
        id: User unique identifier.
        full_name: User's full name.
        email: User's email address.

    Note:
        Password and hashed_password are never exposed in responses.
    """

    id: uuid.UUID
    full_name: str
    email: str

    model_config = {"from_attributes": True}  # ✅ Nuevo estándar
