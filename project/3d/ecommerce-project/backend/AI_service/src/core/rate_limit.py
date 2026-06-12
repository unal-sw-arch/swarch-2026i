"""
Rate Limiting Middleware for AI Service.

Uses Redis with a sliding window counter per user (JWT sub) or IP.
Returns HTTP 429 with Retry-After header when the limit is exceeded.
"""

from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings
from .redis_client import get_redis_client


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter backed by Redis.

    Config (via env vars):
        AI_RATE_LIMIT_REQUESTS       — max requests per window  (default: 10)
        AI_RATE_LIMIT_WINDOW_SECONDS — window size in seconds   (default: 60)
    """

    def __init__(self, app, max_requests: int = 10, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Health checks are exempt from rate limiting
        if request.url.path in ("/health",):
            return await call_next(request)

        redis = get_redis_client()
        identifier = self._get_identifier(request)
        key = f"rate_limit:ai:{identifier}"

        now = int(time.time())
        window_start = now - self.window_seconds

        try:
            pipe = redis.pipeline()
            # Remove counts outside the current window
            pipe.zremrangebyscore(key, "-inf", window_start)
            # Count requests in the current window
            pipe.zcard(key)
            # Add current request timestamp
            pipe.zadd(key, {str(now) + str(request.headers.get("X-Request-ID", now)): now})
            # Reset TTL
            pipe.expire(key, self.window_seconds)
            results = await pipe.execute()

            request_count = results[1]  # zcard result (before adding current)

            remaining = max(0, self.max_requests - request_count - 1)
            reset_time = now + self.window_seconds

            if request_count >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Rate limit exceeded. Too many requests to AI service.",
                        "limit": self.max_requests,
                        "window_seconds": self.window_seconds,
                        "retry_after": self.window_seconds,
                    },
                    headers={
                        "Retry-After": str(self.window_seconds),
                        "X-RateLimit-Limit": str(self.max_requests),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_time),
                    },
                )

            response = await call_next(request)

            # Attach rate limit headers to every successful response
            response.headers["X-RateLimit-Limit"] = str(self.max_requests)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset_time)
            return response

        except Exception:
            # If Redis is unavailable, fail open (don't block the request)
            return await call_next(request)

    @staticmethod
    def _get_identifier(request: Request) -> str:
        """
        Use JWT subject (user ID) when available, otherwise fall back to IP.
        This prevents per-IP limits from blocking shared NAT users unfairly
        while still protecting against authenticated abuse.
        """
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.removeprefix("Bearer ")
            try:
                import jwt
                payload = jwt.decode(
                    token,
                    settings.auth_jwt_secret,
                    algorithms=[settings.jwt_algorithm],
                    options={"verify_exp": False},
                )
                if sub := payload.get("sub"):
                    return f"user:{sub}"
            except Exception:
                pass

        # Respect X-Forwarded-For set by NGINX
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"
        return f"ip:{request.client.host}"
