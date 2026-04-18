from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database import get_db
from src.application.use_cases import AuthUseCase
from src.infrastructure.repositories import SQLUserRepository
from src.infrastructure.security import decode_access_token
from src.domain.models import UserRole

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

# --- Esquemas ---
class RegisterCustomerRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class RegisterResponse(BaseModel):
    id: int
    role: str
    email: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Dependencias ---
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return int(payload.get("sub"))

# --- Endpoints ---
@router.post("/register/customer", status_code=201, response_model=RegisterResponse)
async def register_customer(req: RegisterCustomerRequest, db: AsyncSession = Depends(get_db)):
    repository = SQLUserRepository(db)
    use_case = AuthUseCase(repository)
    user = await use_case.register_customer(req.name, req.email, req.password)
    return user

@router.post("/login/customer")
async def login_customer(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    repository = SQLUserRepository(db)
    use_case = AuthUseCase(repository)
    return await use_case.login_customer(req.email, req.password)

@router.post("/login/restaurant")
async def login_restaurant(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    repository = SQLUserRepository(db)
    use_case = AuthUseCase(repository)
    return await use_case.login_restaurant(req.email, req.password)

@router.get("/me")
async def get_me(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repository = SQLUserRepository(db)
    use_case = AuthUseCase(repository)
    return await use_case.get_me(user_id)
