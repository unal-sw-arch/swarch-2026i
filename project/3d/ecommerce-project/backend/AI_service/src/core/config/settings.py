"""Environment settings for AI service MVP."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = Field(default="AI Service", alias="AI_APP_NAME")
    version: str = Field(default="1.0.0", alias="AI_APP_VERSION")
    debug: bool = Field(default=False, alias="AI_DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", alias="AI_API_V1_PREFIX")

    ai_api_key: str | None = Field(default=None, alias="AI_API_KEY")
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")

    ai_model: str = Field(default="llama-3.1-8b-instant", alias="AI_MODEL")
    request_timeout_seconds: int = Field(default=30, alias="AI_REQUEST_TIMEOUT_SECONDS")
    allowed_origins_raw: str = Field(default="http://localhost:3000", alias="AI_ALLOWED_ORIGINS")

    product_service_url: str = Field(
        default="http://product-service:8003",
        alias="PRODUCT_SERVICE_URL",
    )
    product_service_timeout_seconds: int = Field(
        default=10,
        alias="PRODUCT_SERVICE_TIMEOUT_SECONDS",
    )
    user_service_url: str = Field(
        default="http://user-service:8000",
        alias="USER_SERVICE_URL",
    )
    order_service_url: str = Field(
        default="http://order-service:8004",
        alias="ORDER_SERVICE_URL",
    )
    redis_url: str = Field(
        default="redis://redis:6379/1",
        alias="REDIS_URL",
    )
    ai_database_url: str = Field(
        default="postgresql+asyncpg://ai_user:ai_password@ai-postgres:5432/ai_db",
        alias="AI_DATABASE_URL",
    )

    # ── RAG / embeddings ──────────────────────────────────────────────────────
    ai_embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        alias="AI_EMBEDDING_MODEL",
    )
    ai_embedding_dimensions: int = Field(default=384, alias="AI_EMBEDDING_DIMENSIONS")
    ai_index_refresh_seconds: int = Field(
        default=300,
        alias="AI_INDEX_REFRESH_SECONDS",
        description="Interval between product index sync cycles",
    )
    ai_rag_top_k: int = Field(default=8, alias="AI_RAG_TOP_K")
    ai_profile_weight: float = Field(
        default=0.25,
        alias="AI_PROFILE_WEIGHT",
        description="Weight of the user purchase-profile vector in ranking (0-1)",
    )
    auth_jwt_secret: str = Field(
        default="",
        alias="AUTH_JWT_SECRET",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    rate_limit_requests: int = Field(
        default=10,
        alias="AI_RATE_LIMIT_REQUESTS",
        description="Max AI requests per user/IP per window",
    )
    rate_limit_window_seconds: int = Field(
        default=60,
        alias="AI_RATE_LIMIT_WINDOW_SECONDS",
        description="Rate limit sliding window in seconds",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def resolved_api_key(self) -> str | None:
        return self.ai_api_key or self.groq_api_key

    @property
    def allowed_origins(self) -> list[str]:
        origins = [item.strip() for item in self.allowed_origins_raw.split(",") if item.strip()]
        return origins or ["http://localhost:3000"]


settings = Settings()

