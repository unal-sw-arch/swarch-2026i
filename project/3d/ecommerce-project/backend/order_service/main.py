import asyncio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager

from order_service.src.routers import orders
from order_service.src.core.config.settings import settings
from order_service.src.core.database import engine, Base
from order_service.src.models import order as _order_models  # noqa: F401 — registers ORM tables
from order_service.src.models import processed_event as _pe_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from order_service.src.events.consumer import OrderSagaConsumer
    from order_service.src.services.timeout_worker import run_timeout_worker

    saga_consumer = OrderSagaConsumer()
    saga_consumer.start()

    timeout_task = asyncio.create_task(run_timeout_worker())

    yield

    timeout_task.cancel()
    try:
        await timeout_task
    except asyncio.CancelledError:
        pass

    saga_consumer.stop()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Order Service for e-commerce microservices architecture",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "order-service",
        "status": "healthy",
        "health": "/health",
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "order-service", "version": settings.VERSION}
