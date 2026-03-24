"""Password Value Object - Encapsulates password validation and hashing."""

import re
import bcrypt


class Password:
    """
    Password Value Object.

    Validates password strength requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character (!@#$%^&*)

    Encapsulates bcrypt hashing and verification.
    Stores only the hash, never the plain password.
    """

    # Password strength requirements
    MIN_LENGTH = 8
    SPECIAL_CHARS = r"!@#$%^&*()_+-=[]{}|;:,.<>?"

    def __init__(self, plain_password: str):
        """
        Initialize Password VO with validation and hashing.

        Args:
            plain_password: Plain text password

        Raises:
            ValueError: If password doesn't meet security requirements
        """
        # Validate strength
        self._validate_strength(plain_password)

        # Hash the password with bcrypt (12 rounds for security/performance balance)
        self._hash = bcrypt.hashpw(
            plain_password.encode("utf-8"), bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

    @classmethod
    def from_hash(cls, hashed: str) -> "Password":
        """
        Create Password VO from an existing hash (e.g., from database).

        Args:
            hashed: Bcrypt hashed password string

        Returns:
            Password instance with existing hash
        """
        obj = cls.__new__(cls)
        obj._hash = hashed
        return obj

    @staticmethod
    def _validate_strength(password: str) -> None:
        """
        Validate password meets security requirements.

        Args:
            password: Password to validate

        Raises:
            ValueError: If password doesn't meet requirements
        """
        if not password or not isinstance(password, str):
            raise ValueError("Password must be a non-empty string")

        if len(password) < Password.MIN_LENGTH:
            raise ValueError(
                f"Password must be at least {Password.MIN_LENGTH} characters long"
            )

        if not re.search(r"[A-Z]", password):
            raise ValueError(
                "Password must contain at least one uppercase letter (A-Z)"
            )

        if not re.search(r"[a-z]", password):
            raise ValueError(
                "Password must contain at least one lowercase letter (a-z)"
            )

        if not re.search(r"\d", password):
            raise ValueError("Password must contain at least one digit (0-9)")

        if not re.search(f"[{re.escape(Password.SPECIAL_CHARS)}]", password):
            raise ValueError(
                f"Password must contain at least one special character: "
                f"{Password.SPECIAL_CHARS}"
            )

    @property
    def hash(self) -> str:
        """Get the bcrypt hash (for storage in database)."""
        return self._hash

    def verify(self, plain_password: str) -> bool:
        """
        Verify a plain password against this hash.

        Args:
            plain_password: Plain text password to verify

        Returns:
            True if password matches, False otherwise
        """
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"), self._hash.encode("utf-8")
            )
        except (ValueError, TypeError):
            return False

    def __repr__(self) -> str:
        """Developer representation (never shows hash)."""
        return "Password(hash=***)"

    def __eq__(self, other: object) -> bool:
        """Compare password hashes."""
        if not isinstance(other, Password):
            return False
        return self._hash == other._hash

    def __hash__(self) -> int:
        """Make hashable for use in sets/dicts."""
        return hash(self._hash)
