from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional
import uuid

from order_service.src.core.config.settings import settings

security = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    role: Optional[str] = "user"
    exp: Optional[int] = None


class CurrentUser(BaseModel):
    id: uuid.UUID
    email: Optional[str] = None
    role: str = "user"


def decode_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    token_data = decode_token(credentials.credentials)
    try:
        user_id = uuid.UUID(token_data.sub)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    return CurrentUser(id=user_id, email=token_data.email, role=token_data.role)


async def get_current_admin(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    if current_user.role not in ("admin", "system"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return current_user