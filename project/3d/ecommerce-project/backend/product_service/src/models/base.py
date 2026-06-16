"""Base class for SQLAlchemy models.

Provides declarative base for all ORM entities in the application.
Ensures consistent metadata tracking and table creation.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base for all ORM models.

    All model classes should inherit from this Base class to ensure proper
    metadata registration and table creation via metadata.create_all().

    Example:
        class User(Base):
            __tablename__ = "users"
            id: Mapped[UUID] = mapped_column(...)
    """
