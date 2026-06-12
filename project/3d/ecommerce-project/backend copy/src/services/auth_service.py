"""Authentication service for user registration, login, and token generation."""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config.settings import settings
from src.core.redis_client import save_user_session
from src.domain.value_objects import Email, Password
from src.models.user import User
from src.schemas.user import UserRegister, UserResponse


async def register_user(user: UserRegister, db: AsyncSession) -> UserResponse:
    """
    Register a new user with email and password.

    Args:
        user: User registration data containing full_name, email, and password.
        db: Database session dependency.

    Returns:
        UserResponse: Created user data (id, full_name, email).

    Raises:
        HTTPException: 400 if validation fails (invalid email or weak password).
        HTTPException: 409 if email already exists.
    """
    try:
        # Validate email format (raises ValueError if invalid)
        email_vo = Email(user.email)

        # Validate password strength and hash it (raises ValueError if weak)
        password_vo = Password(user.password)
    except ValueError as exc:
        # Return 400 Bad Request for validation failures
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    # Create new user with validated data
    user_information = {
        "full_name": user.full_name,
        "email": email_vo.value,  # Normalized email (lowercase)
        "hashed_password": password_vo.hash,  # Bcrypt hash
    }
    new_user = User(**user_information)
    db.add(new_user)

    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError as exc:
        # If email already exists, rollback and raise 409
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from exc

    # Convert SQLAlchemy model to Pydantic response
    return UserResponse.model_validate(new_user)


async def auth_user(email: str, password: str, db: AsyncSession) -> dict:
    """
    Authenticates user credentials and generates JWT token.

    Args:
        email: User email for lookup in database.
        password: Plain text password to verify against hash.
        db: Database session for database operations.

    Returns:
        dict: Contains access_token and token_type (bearer).

    Raises:
        HTTPException: 401 if user not found or password is incorrect.
    """

    try:
        email_vo = Email(email)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from exc

    # Find user by normalized email
    select_user = await db.execute(select(User).where(User.email == email_vo.value))
    user = select_user.scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials (user not found)",
        )

    # Verify password using Password VO
    try:
        password_vo = Password.from_hash(user.hashed_password)
        if not password_vo.verify(password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials (password mismatch)",
            )
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from exc

    # Generate and return JWT token
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user.id),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    # Persist session server-side to support logout/token invalidation.
    await save_user_session(str(user.id), token)

    return {"access_token": token, "token_type": "bearer"}
