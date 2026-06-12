"""FastAPI entrypoint for AI service MVP."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from AI_service.src.core.config import settings
from AI_service.src.core.rate_limit import RateLimitMiddleware
from AI_service.src.core.redis_client import close_redis_connection
from AI_service.src.routers.chat import router as chat_router


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    docs_url=f"{settings.api_v1_prefix}/docs",
    redoc_url=f"{settings.api_v1_prefix}/redoc",
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


# ── Event handlers ───────────────────────────────────────────────────────────
@app.on_event("shutdown")
async def shutdown_event():
    await close_redis_connection()


# ── Utility routes ───────────────────────────────────────────────────────────
@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url=f"{settings.api_v1_prefix}/docs")


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return service health status."""
    return {"status": "ok", "service": "ai-service"}
