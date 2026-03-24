"""User model for the e-commerce application.

Represents application users with authentication, profile, and audit information.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import Base


class User(Base):
    """
    Represents an application user account.

    Attributes:
        id: Unique user identifier (UUID).
        email: User email address (unique, required).
        hashed_password: Bcrypt-hashed password (never store plaintext).
        full_name: User's full name (optional).
        phone: User's phone number (optional).
        role: User role for authorization (default: "user").
        avatar_url: URL to user's avatar image (optional).
        is_active: Whether user account is enabled (default: True).
        created_at: Timestamp of account creation (auto-generated).
        updated_at: Timestamp of last update (auto-generated).

    Note:
        Email constraint is UNIQUE at database level to prevent duplicates.
        Passwords are never stored; only bcrypt hashes are persisted.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="user")
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),  # pylint: disable=not-callable
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),  # pylint: disable=not-callable
        nullable=True,
    )
