import asyncio
import logging
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from src.interfaces.http import router as auth_router
from src.domain.exceptions import AuthBaseException
from src.infrastructure.database import engine, async_session
from src.infrastructure.seeder import seed_data
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def wait_for_db(retries: int = 5, delay: int = 2):
    for i in range(retries):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database is ready!")
            return True
        except Exception:
            logger.info(f"Database not ready yet (attempt {i+1}/{retries}). Waiting {delay}s...")
            await asyncio.sleep(delay)
    return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Esperar a que la DB responda (evita Race Condition del puerto)
    db_ready = await wait_for_db()
    
    # 2. Poblar datos iniciales si la DB está lista
    if db_ready:
        try:
            async with async_session() as session:
                await seed_data(session)
        except Exception as e:
            logger.error(f"Startup Seed failed: {e}. The app will continue but data might be missing.")
    else:
        logger.error("Could not connect to database port during startup.")
        
    yield

app = FastAPI(title="Auth Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Errores de Negocio (AuthBaseException)
@app.exception_handler(AuthBaseException)
async def auth_exception_handler(request: Request, exc: AuthBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message}
    )

# 2. Errores del Framework (ej. Falta Bearer token o Token inválido)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "UNAUTHORIZED" if exc.status_code == 401 else "HTTP_ERROR"
    code = "NOT_FOUND" if exc.status_code == 404 else code
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": code, "message": str(exc.detail)}
    )

# 3. Errores de Validación (FastAPI/Pydantic) - CUMPLIMIENTO BIBLIA CAP 11
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_messages = []
    for error in errors:
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]
        error_messages.append(f"{field}: {message}" if field else message)
    
    clean_message = ", ".join(error_messages)

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "VALIDATION_ERROR",
            "message": clean_message
        }
    )

# 4. Errores Inesperados
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "Internal server error"}
    )

app.include_router(auth_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
