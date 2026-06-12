"""Dependency function to get a database session."""

from src.core.database import async_session_local


async def get_db():
    """
    Creates and yields a database session for request lifecycle.

    Yields:
        AsyncSession: SQLAlchemy async session for ORM operations.

    Note:
        Session is automatically closed after request completion.
    """
    db = async_session_local()
    try:
        yield db
    finally:
        await db.close()
