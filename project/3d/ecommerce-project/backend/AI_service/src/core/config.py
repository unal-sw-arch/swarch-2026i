"""Environment settings for AI service MVP."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = Field(default="AI Service", alias="AI_APP_NAME")
    version: str = Field(default="1.0.0", alias="AI_APP_VERSION")
    debug: bool = Field(default=False, alias="AI_DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", alias="AI_API_V1_PREFIX")

    # API key can be provided with the new variable AI_API_KEY.
    ai_api_key: str | None = Field(default=None, alias="AI_API_KEY")
    # Backward compatibility for previous local tests.
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")

    ai_model: str = Field(default="llama-3.1-8b-instant", alias="AI_MODEL")
    request_timeout_seconds: int = Field(default=30, alias="AI_REQUEST_TIMEOUT_SECONDS")
    allowed_origins_raw: str = Field(default="http://localhost:3000", alias="AI_ALLOWED_ORIGINS")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def resolved_api_key(self) -> str | None:
        """Return the first available API key."""
        return self.ai_api_key or self.groq_api_key

    @property
    def allowed_origins(self) -> list[str]:
        """Parse comma-separated origins from environment."""
        origins = [item.strip() for item in self.allowed_origins_raw.split(",") if item.strip()]
        return origins or ["http://localhost:3000"]


settings = Settings()