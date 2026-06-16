# Integration Tests

This directory contains integration tests for inter-service communication in the ecommerce microservices project.

## Test Organization

### By Service Interaction
- `test_auth_user_integration.py` - Auth-service ↔ User-service (event-driven)
- `test_order_product_integration.py` - Order-service ↔ Product-service (HTTP sync)
- `test_product_internal_integration.py` - Product-service internal components

## Prerequisites

### Services Must Be Running
```bash
# From project root
docker compose up --build

# Or individually:
docker compose up auth-service user-service product-service order-service ai-service
```

### Test Dependencies
```bash
pip install -r tests/requirements.txt
```

## Running Tests

### All tests
```bash
pytest
```

### By marker (service or type)
```bash
# Auth integration tests only
pytest -m auth

# Async tests only
pytest -m asyncio

# Integration tests (slower, requires running services)
pytest -m integration
```

### With coverage
```bash
pytest --cov=. --cov-report=html
```

### Specific test file
```bash
pytest tests/test_auth_user_integration.py
```

### Specific test
```bash
pytest tests/test_auth_user_integration.py::TestAuthUserIntegration::test_user_registration_flow
```

## Test Design

### Fixtures (conftest.py)
- `auth_client` - AsyncClient for auth-service
- `user_client` - AsyncClient for user-service
- `product_client` - AsyncClient for product-service
- `order_client` - AsyncClient for order-service
- `ai_client` - AsyncClient for ai-service
- `event_loop` - Async event loop for tests

### Service Configuration
Tests use environment variables to locate services:
- `AUTH_SERVICE_URL` (default: http://localhost:8001)
- `USER_SERVICE_URL` (default: http://localhost:8002)
- `PRODUCT_SERVICE_URL` (default: http://localhost:8003)
- `ORDER_SERVICE_URL` (default: http://localhost:8004)
- `AI_SERVICE_URL` (default: http://localhost:8005)
- `AUTH_JWT_SECRET` (default: test-secret-key)

## Test Scenarios

### Auth ↔ User Integration
1. **User Registration Flow** - Auth publishes event → User-service creates profile
2. **Duplicate Registration** - Handling duplicate email addresses
3. **Event Processing** - RabbitMQ message delivery and retry logic
4. **Service Availability** - Health checks and connectivity

### Order ↔ Product Integration
1. **Stock Check** - Order-service verifies product availability
2. **Stock Reserve** - Product stock is reserved during order creation
3. **Stock Release** - Stock is returned when order is cancelled
4. **Concurrent Orders** - Race condition handling for limited stock
5. **Event Publishing** - Order events are published for other services

### Product Internal
1. **Component Communication** - CategoryService, ReviewService, ImageGalleryService work correctly
2. **Data Consistency** - Review counts, image ordering, category cascades
3. **Redis Caching** - Category names and seller names are cached
4. **Cache Invalidation** - Updates properly invalidate cached data

## Implementing Tests

### Basic Test Structure
```python
@pytest.mark.asyncio
async def test_example(product_client: AsyncClient):
    """Test description explaining what interaction is being tested."""
    response = await product_client.get('/products')
    assert response.status_code in [200, 401]
```

### With Authorization
```python
@pytest.mark.asyncio
async def test_with_auth(product_client: AsyncClient):
    """Test that requires JWT token."""
    # In real tests, get token from auth-service first
    token = "eyJhbGc..."  # Real JWT from auth-service
    headers = get_auth_headers(token)
    
    response = await product_client.get('/products', headers=headers)
    assert response.status_code == 200
```

### Async Operations
```python
@pytest.mark.asyncio
async def test_async_flow(auth_client: AsyncClient, user_client: AsyncClient):
    """Test that spans multiple services."""
    # Register user
    auth_response = await auth_client.post('/auth/register', json={...})
    
    # Wait for event processing
    await asyncio.sleep(1)
    
    # Verify user profile created
    user_response = await user_client.get('/users/by-email')
    assert user_response.status_code == 200
```

## Known Limitations

1. **Event Queue Inspection** - Tests can't directly inspect RabbitMQ messages; relies on eventual consistency checks
2. **Database State** - Tests don't reset database between runs; use unique identifiers (timestamps, UUIDs)
3. **Timing Dependencies** - Async event processing requires sleep/polling; use minimal delays
4. **Authentication** - Some tests need valid JWT tokens from auth-service
5. **Test Data** - Tests assume clean or known database state

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run integration tests
  run: |
    docker compose up -d
    sleep 10  # Wait for services to start
    pip install -r backend/tests/requirements.txt
    pytest backend/tests/ -v --tb=short
    docker compose down
```

## Debugging

### Enable verbose logging
```bash
pytest -vv --log-cli-level=DEBUG
```

### Run single test with output
```bash
pytest tests/test_file.py::TestClass::test_name -s
```

### Profile slow tests
```bash
pytest --durations=10
```

## Future Improvements

1. Add test data fixtures/factories for common test scenarios
2. Implement RabbitMQ message queue inspection
3. Add performance/load tests
4. Implement test database seeding/cleanup
5. Add contract testing between services
6. Implement chaos engineering tests (service failure scenarios)
