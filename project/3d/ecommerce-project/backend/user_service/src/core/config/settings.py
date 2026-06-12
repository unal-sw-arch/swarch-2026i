"""User service settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings for user_service runtime."""

    database_url: str
    app_name: str = "User Service"
    debug: bool = False
    rabbitmq_host: str = "rabbitmq"
    user_profile_queue_name: str = "user_profile_create_queue"

    class Config:
        """Pydantic settings source configuration."""

        env_file = ".env"


settings = Settings()
