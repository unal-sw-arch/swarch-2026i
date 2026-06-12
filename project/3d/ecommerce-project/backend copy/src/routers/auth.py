"""Authentication router for user registration and login."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies.get_current_user import get_current_user
from src.schemas.auth import TokenResponse, UserLogin
from src.schemas.user import UserRegister, UserResponse
from src.core.redis_client import delete_user_session
from src.models.user import User
from src.services.auth_service import register_user, auth_user
from src.core.dependencies.get_db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register_handler(user: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email and password.

    Args:
        user: User registration data containing full_name, email, and password.
        db: Database session dependency.

    Returns:
        UserResponse: Created user data (id, full_name, email).

    Raises:
        HTTPException: 409 if email already exists.
    """
    return await register_user(user, db)


@router.post("/login", response_model=TokenResponse)
async def login_handler(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return JWT token.

    Args:
        credentials: User login data containing email and password.
        db: Database session dependency.

    Returns:
        TokenResponse: Contains access_token and token_type (bearer).

    Raises:
        HTTPException: 401 if credentials are invalid.
    """
    return await auth_user(credentials.email, credentials.password, db)


@router.post("/logout")
async def logout_handler(current_user: User = Depends(get_current_user)):
    """Invalidate the current user session stored in Redis."""
    await delete_user_session(str(current_user.id))
    return {"message": "Session closed successfully"}
