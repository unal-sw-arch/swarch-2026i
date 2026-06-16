"""Main application entry point for the FastAPI backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from product_service.src.core.config.settings import settings
from product_service.src.core.database import engine, async_session_local
from product_service.src.core.redis_client import close_redis_connection
from product_service.src.core.redis_client import get_redis_client
from product_service.src.services.product_service import get_http_client
from product_service.src.core.seeds import seed_initial_data
from product_service.src.models.base import Base
from product_service.src.models.product import Product, Category  # noqa: F401 — registers tables
from product_service.src.models.reservation import StockReservation  # noqa: F401
from product_service.src.models.processed_event import ProcessedEvent  # noqa: F401
from product_service.src.routers.products import router as products_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_local() as db:
        await seed_initial_data(db)

    redis_client = get_redis_client()
    await redis_client.ping()

    get_http_client()

    from product_service.src.events.consumer import ProductSagaConsumer
    saga_consumer = ProductSagaConsumer()
    saga_consumer.start()

    yield

    saga_consumer.stop()
    http_client = get_http_client()
    await http_client.aclose()
    await close_redis_connection()
    await engine.dispose()


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name}
