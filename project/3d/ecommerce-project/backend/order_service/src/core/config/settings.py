from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Order Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/order_db"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"

    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    RABBITMQ_EXCHANGE: str = "events"
    RABBITMQ_SAGA_EXCHANGE: str = "commerce.saga"

    PRODUCT_SERVICE_URL: str = "http://product-service:8003"
    PRODUCT_SERVICE_TIMEOUT_SECONDS: int = 10

    STOCK_RESERVATION_TIMEOUT_MINUTES: int = 15
    ORDER_CONFIRMATION_TIMEOUT_SECONDS: int = 30

    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
