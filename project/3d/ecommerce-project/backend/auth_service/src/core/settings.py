"""Auth service settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings for auth_service runtime."""

    database_url: str
    app_name: str = "Auth Service"
    debug: bool = False
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    rabbitmq_host: str = "rabbitmq"
    user_profile_queue_name: str = "user_profile_create_queue"
    redis_url: str = "redis://redis:6379/0"
    auth_session_prefix: str = "auth:session"
    auth_blacklist_prefix: str = "auth:blacklist"
    require_redis_session: bool = True
    redis_fail_open: bool = True

    class Config:
        """Pydantic settings source configuration."""

        env_file = ".env"


settings = Settings()
