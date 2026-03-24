"""Domain Value Objects - Encapsulate validation and business logic."""

from .email import Email
from .password import Password

__all__ = ["Email", "Password"]
