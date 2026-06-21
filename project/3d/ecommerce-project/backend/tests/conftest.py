"""
Shared test fixtures and configuration for integration tests
"""
import pytest
import asyncio
from httpx import AsyncClient
import os

# Service URLs for testing
SERVICES = {
    'auth': os.getenv('AUTH_SERVICE_URL', 'http://localhost:8001'),
    'user': os.getenv('USER_SERVICE_URL', 'http://localhost:8002'),
    'product': os.getenv('PRODUCT_SERVICE_URL', 'http://localhost:8003'),
    'order': os.getenv('ORDER_SERVICE_URL', 'http://localhost:8004'),
    'ai': os.getenv('AI_SERVICE_URL', 'http://localhost:8005'),
}

SHARED_JWT_SECRET = os.getenv('AUTH_JWT_SECRET', 'test-secret-key')


@pytest.fixture
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def auth_client():
    """HTTP client for auth-service"""
    async with AsyncClient(base_url=SERVICES['auth'], timeout=10.0) as client:
        yield client


@pytest.fixture
async def user_client():
    """HTTP client for user-service"""
    async with AsyncClient(base_url=SERVICES['user'], timeout=10.0) as client:
        yield client


@pytest.fixture
async def product_client():
    """HTTP client for product-service"""
    async with AsyncClient(base_url=SERVICES['product'], timeout=10.0) as client:
        yield client


@pytest.fixture
async def order_client():
    """HTTP client for order-service"""
    async with AsyncClient(base_url=SERVICES['order'], timeout=10.0) as client:
        yield client


@pytest.fixture
async def ai_client():
    """HTTP client for ai-service"""
    async with AsyncClient(base_url=SERVICES['ai'], timeout=10.0) as client:
        yield client


def get_auth_headers(token: str) -> dict:
    """Get authorization headers with JWT token"""
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
