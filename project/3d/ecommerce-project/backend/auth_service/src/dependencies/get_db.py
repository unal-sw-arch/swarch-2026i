"""Database session dependency for request handlers."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.src.core.database import async_session_local


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a DB session and ensure it is closed after request."""
    async with async_session_local() as session:
        yield session
