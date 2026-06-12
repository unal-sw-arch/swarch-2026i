"""Product service settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Runtime settings for product_service."""

    database_url: str
    app_name: str = "Product Service"
    debug: bool = False
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    redis_url: str = "redis://redis:6379/0"
    auth_session_prefix: str = "auth:session"
    auth_blacklist_prefix: str = "auth:blacklist"
    require_redis_session: bool = True
    redis_fail_open: bool = True
    user_service_base_url: str = "http://user-service:8000"
    seller_name_cache_ttl_seconds: int = 900
    category_name_cache_ttl_seconds: int = 900
    max_images_per_product: int = 8
    forbidden_review_terms: str = ""

    rabbitmq_host: str = "rabbitmq"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_password: str = "guest"
    rabbitmq_saga_exchange: str = "commerce.saga"

    class Config:
        """Pydantic settings source configuration."""

        env_file = ".env"


settings = Settings()
