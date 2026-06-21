"""Main application entry point for the FastAPI backend.

Configures FastAPI application with middleware, routers, and lifecycle management.
Handles database initialization on startup and cleanup on shutdown.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from product_service.src.core.config.settings import settings
from product_service.src.core.database import engine, async_session_local
from product_service.src.core.redis_client import close_redis_connection
from product_service.src.core.redis_client import get_redis_client
from product_service.src.core.seeds import seed_initial_data
from product_service.src.models.base import Base
from product_service.src.routers.auth import router as auth_router
from product_service.src.routers.internal_inventory import router as internal_inventory_router
from product_service.src.routers.products import router as products_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Manages application lifecycle events (startup and shutdown).

    Args:
        _app: FastAPI application instance.

    Yields:
        None: Control returns to FastAPI framework.

    Note:
        - Startup: Creates database tables from SQLAlchemy models and seeds
          initial data.
        - Shutdown: Disposes database engine and releases resources.
    """
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial data (idempotent)
    async with async_session_local() as db:
        await seed_initial_data(db)

    redis_client = get_redis_client()
    await redis_client.ping()

    yield  # App runs here

    # Clean up without blocking shutdown
    await close_redis_connection()
    await engine.dispose()


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],  # Cambia esto a los dominios permitidos en producción
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(internal_inventory_router)


@app.get("/health")
async def health_check():
    """Endpoint to check the health of the application.
    args:
    None
    Returns:
        dict: Status message indicating the application is healthy.
    """

    return {"status": "ok", "service": settings.app_name}
