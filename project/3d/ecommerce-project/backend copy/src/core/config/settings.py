"""Application configuration settings loaded from environment variables.

Manages all app-level configuration including database, auth, and external services.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration settings from .env file.

    Attributes:
        database_url: PostgreSQL async connection string.
        redis_url: Redis connection string for caching and sessions.
        jwt_secret: Secret key for JWT token signing (must be 32+ chars).
        jwt_algorithm: Algorithm for JWT encoding (default: HS256).
        jwt_expire_minutes: Token expiration time in minutes (default: 60).
        gemini_api_key: Google Gemini API key (optional, for Phase 7).
        app_name: Application display name.
        debug: Enable debug mode (set to False in production).

    Note:
        Loads from .env file in the backend root directory.
    """

    # Database
    database_url: str

    # Redis
    redis_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # Gemini (Phase 7)
    gemini_api_key: str = ""

    # App
    app_name: str = "E-commerce API"
    debug: bool = False

    class Config:
        """Pydantic settings source configuration."""

        env_file = ".env"


settings = Settings()
