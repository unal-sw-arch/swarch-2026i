"""FastAPI entrypoint for AI service MVP."""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import text

from AI_service.src.core.config import settings
from AI_service.src.core.database import Base, engine
from AI_service.src.core.rate_limit import RateLimitMiddleware
from AI_service.src.core.redis_client import close_redis_connection
from AI_service.src.models import product_embedding as _embedding_models  # noqa: F401 — registers ORM tables
from AI_service.src.routers.chat import router as chat_router
from AI_service.src.services.indexer import run_indexer_loop

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    indexer_task: asyncio.Task | None = None

    # Fail-open: if ai-postgres is unavailable the chat still works in
    # keyword-only mode, so DB setup must never prevent startup.
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
            # create_all does not create custom HNSW indexes — raw SQL required.
            await conn.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_product_embeddings_embedding_hnsw "
                "ON product_embeddings USING hnsw (embedding vector_cosine_ops)"
            ))
            # Add columns introduced after initial schema creation (idempotent).
            await conn.execute(text(
                "ALTER TABLE product_embeddings "
                "ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2), "
                "ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0"
            ))
        indexer_task = asyncio.create_task(run_indexer_loop())
    except Exception as exc:
        logger.warning("RAG database unavailable, running keyword-only: %s", exc)

    yield

    if indexer_task is not None:
        indexer_task.cancel()
        try:
            await indexer_task
        except asyncio.CancelledError:
            pass

    await close_redis_connection()
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    docs_url=f"{settings.api_v1_prefix}/docs",
    redoc_url=f"{settings.api_v1_prefix}/redoc",
    lifespan=lifespan,
)

# ── Middleware (order matters: first added = outermost layer) ────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting: applied after CORS so OPTIONS preflight requests pass through.
# Uses Redis sliding window. Limits per authenticated user or IP.
app.add_middleware(
    RateLimitMiddleware,
    max_requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(chat_router, prefix=settings.api_v1_prefix)


# ── Utility routes ───────────────────────────────────────────────────────────
@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url=f"{settings.api_v1_prefix}/docs")


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return service health status."""
    return {"status": "ok", "service": "ai-service"}
