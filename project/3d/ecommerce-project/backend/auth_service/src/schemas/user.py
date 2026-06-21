"""Schemas for user registration and API responses."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from auth_service.src.core.security import check_password


class UserRegister(BaseModel):
    """Schema for user registration request payload."""

    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    def validate_password(cls, v):
        check_password(v)
        return v

    @field_validator("email")
    def normalize_email(cls, v):
        return v.lower().strip()
    
class UserResponse(BaseModel):
    """Schema for user response without sensitive fields."""

    id: UUID
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
