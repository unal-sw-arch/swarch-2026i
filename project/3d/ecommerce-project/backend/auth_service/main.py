"""FastAPI entrypoint for auth_service container."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from auth_service.src.core.database import engine
from auth_service.src.core.redis_client import close_redis_connection, get_redis_client
from auth_service.src.models.base import Base
from auth_service.src.models.user import User  # noqa: F401
from auth_service.src.core.config.settings import settings
from auth_service.src.routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize and close shared resources for auth_service."""
    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception:
            if attempt == max_attempts:
                raise
            await asyncio.sleep(2)

    redis_client = get_redis_client()
    await redis_client.ping()

    yield

    await engine.dispose()
    await close_redis_connection()


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.include_router(auth_router)

CURRENT_ROLE = getattr(settings, "role", "active")

@app.get("/health")
async def health_check() -> JSONResponse:
    """Return comprehensive service health status checking dependencies."""
    health_status = {
        "status": "ok",
        "service": "auth_service",
        "database": "unknown",
        "redis": "unknown"
    }
    
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"

    try:
        redis_client = get_redis_client()
        await redis_client.ping()
        health_status["redis"] = "connected"
    except Exception as e:
        health_status["redis"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"

    if health_status["status"] == "unhealthy":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=health_status
        )

    return JSONResponse(status_code=status.HTTP_200_OK, content=health_status)

@app.post("/activate")
async def activate_spare():
    """Endpoint called by the coordinator to promote a spare instance to active."""
    global CURRENT_ROLE
    
    if CURRENT_ROLE == "spare":
        CURRENT_ROLE = "active"
        print("[SYSTEM] Role changed from SPARE to ACTIVE. Failover processed.")
        return {
            "status": "activated", 
            "message": "Role changed to active."
        }
        
    return {
        "status": "ignored", 
        "message": "Instance is already active."
    }