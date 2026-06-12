"""Redis client and session helpers.

Provides a shared async Redis connection and utility functions for
authentication session persistence.
"""

from redis.asyncio import Redis

from src.core.config.settings import settings

redis_client = Redis.from_url(settings.redis_url, decode_responses=True)


def _session_key(user_id: str) -> str:
    """Build the Redis key used to store a user session token."""
    return f"session:{user_id}"


async def save_user_session(user_id: str, token: str) -> None:
    """Persist a user JWT in Redis with the same TTL as token expiry."""
    ttl_seconds = settings.jwt_expire_minutes * 60
    await redis_client.set(_session_key(user_id), token, ex=ttl_seconds)


async def get_user_session_token(user_id: str) -> str | None:
    """Get the JWT currently stored in Redis for a user."""
    token = await redis_client.get(_session_key(user_id))
    return token if isinstance(token, str) else None


async def delete_user_session(user_id: str) -> None:
    """Delete a user session key from Redis (logout/invalidation)."""
    await redis_client.delete(_session_key(user_id))


async def close_redis_connection() -> None:
    """Close the shared Redis connection on app shutdown."""
    await redis_client.aclose()
