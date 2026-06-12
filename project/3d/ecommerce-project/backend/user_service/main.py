from contextlib import asynccontextmanager

from fastapi import FastAPI
from user_service.src.core.db import Base, engine
from user_service.src.events.user_profile_consumer import UserProfileEventConsumer
from user_service.src.routers.router import router

consumer = UserProfileEventConsumer()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Manage startup and shutdown resources for user-service."""
    # Ensure local schema exists when service boots.
    Base.metadata.create_all(bind=engine)
    consumer.start()

    try:
        yield
    finally:
        consumer.stop()


app = FastAPI(title="User Service", lifespan=lifespan)


app.include_router(router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "user-service"}
