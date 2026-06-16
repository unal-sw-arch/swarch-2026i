"""Base class for SQLAlchemy models in auth_service."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for auth_service models."""
