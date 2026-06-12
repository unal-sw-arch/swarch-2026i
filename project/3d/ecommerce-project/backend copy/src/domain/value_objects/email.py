"""Email Value Object - Encapsulates email validation and normalization."""

import re


class Email:
    """
    Email Value Object.

    Validates email format according to RFC 5322 (simplified).
    Normalizes email to lowercase for consistency.
    Immutable once created.
    """

    # Simplified RFC 5322 email regex (covers 99% of real-world emails)
    EMAIL_REGEX = re.compile(
        r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9]"
        r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]"
        r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    )

    def __init__(self, value: str):
        """
        Initialize Email VO with validation.

        Args:
            value: Email address string

        Raises:
            ValueError: If email format is invalid
        """
        if not value or not isinstance(value, str):
            raise ValueError("Email must be a non-empty string")

        # Normalize to lowercase and strip whitespace
        normalized = value.strip().lower()

        # Validate format
        if not self.EMAIL_REGEX.match(normalized):
            raise ValueError(f"Invalid email format: {value}")

        # Validate length (RFC 5321)
        if len(normalized) > 254:
            raise ValueError("Email address is too long (max 254 characters)")

        self._value = normalized

    @property
    def value(self) -> str:
        """Get the email value."""
        return self._value

    def __str__(self) -> str:
        """String representation."""
        return self._value

    def __repr__(self) -> str:
        """Developer representation."""
        return f"Email('{self._value}')"

    def __eq__(self, other: object) -> bool:
        """Compare emails."""
        if not isinstance(other, Email):
            return False
        return self._value == other._value

    def __hash__(self) -> int:
        """Make hashable for use in sets/dicts."""
        return hash(self._value)
