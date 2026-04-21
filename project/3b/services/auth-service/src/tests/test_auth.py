import pytest
import uuid
from datetime import timedelta
from jose import jwt
from httpx import AsyncClient, ASGITransport
from main import app
from src.infrastructure.security import get_password_hash, create_access_token
from src.infrastructure.config import settings
from src.infrastructure.orm_models import UserORM, RestaurantUserORM, UserRole
from src.tests.conftest import TestSessionLocal
from sqlalchemy import delete

def get_unique_email(base: str):
    return f"{base}_{uuid.uuid4().hex[:8]}@test.com"

# --- 1. REGISTRO ---

@pytest.mark.asyncio
async def test_register_customer_success():
    email = get_unique_email("laura")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register/customer", json={
            "name": "Laura", "email": email, "password": "123456"
        })
    assert response.status_code == 201
    assert response.json()["email"] == email

@pytest.mark.asyncio
async def test_register_duplicate_email():
    email = "duplicate@test.com"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/customer", json={
            "name": "User 1", "email": email, "password": "password"
        })
        response = await ac.post("/auth/register/customer", json={
            "name": "User 2", "email": email, "password": "password"
        })
    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION_ERROR"

@pytest.mark.asyncio
async def test_register_invalid_json():
    # TEST DE CONTRATO UNIFICADO: Enviar JSON mal formado
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register/customer", json={
            "name": "Solo Nombre"
            # Falta email y password
        })
    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION_ERROR"
    assert "message" in response.json()

# --- 2. LOGIN (CAMINO FELIZ Y CRUCE DE ROLES) ---

@pytest.mark.asyncio
async def test_login_customer_success():
    email = get_unique_email("carlos")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/customer", json={
            "name": "Carlos", "email": email, "password": "password123"
        })
        response = await ac.post("/auth/login/customer", json={
            "email": email, "password": "password123"
        })
    assert response.status_code == 200
    payload = jwt.decode(response.json()["accessToken"], settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["role"] == "CUSTOMER"

@pytest.mark.asyncio
async def test_login_restaurant_success():
    email = get_unique_email("real_rest")
    async with TestSessionLocal() as session:
        pwd = get_password_hash("admin123")
        user = UserORM(name="Rest", email=email, password_hash=pwd, role=UserRole.RESTAURANT)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        session.add(RestaurantUserORM(user_id=user.id, restaurant_id=77))
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/login/restaurant", json={
            "email": email, "password": "admin123"
        })
    assert response.status_code == 200
    assert response.json()["restaurantId"] == 77

@pytest.mark.asyncio
async def test_login_restaurant_with_customer_account():
    email = get_unique_email("not_rest")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/customer", json={
            "name": "Cliente", "email": email, "password": "pass"
        })
        response = await ac.post("/auth/login/restaurant", json={
            "email": email, "password": "pass"
        })
    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"

@pytest.mark.asyncio
async def test_login_customer_with_restaurant_account():
    email = get_unique_email("inv_role")
    async with TestSessionLocal() as session:
        pwd = get_password_hash("pass")
        user = UserORM(name="Rest", email=email, password_hash=pwd, role=UserRole.RESTAURANT)
        session.add(user)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/login/customer", json={
            "email": email, "password": "pass"
        })
    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"

# --- 3. LOGIN (FALLOS DE CREDENCIALES) ---

@pytest.mark.asyncio
async def test_login_wrong_password():
    email = get_unique_email("wrong_pass")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/customer", json={
            "name": "User", "email": email, "password": "correct"
        })
        response = await ac.post("/auth/login/customer", json={
            "email": email, "password": "wrong"
        })
    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"

@pytest.mark.asyncio
async def test_login_non_existent_email():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/login/customer", json={
            "email": "not_exists@test.com", "password": "any"
        })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_login_restaurant_unlinked():
    email = get_unique_email("unlinked")
    async with TestSessionLocal() as session:
        pwd = get_password_hash("pass")
        user = UserORM(name="Ghost", email=email, password_hash=pwd, role=UserRole.RESTAURANT)
        session.add(user)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/login/restaurant", json={
            "email": email, "password": "pass"
        })
    assert response.status_code == 401

# --- 4. SEGURIDAD Y /ME ---

@pytest.mark.asyncio
async def test_get_me_missing_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/auth/me")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_get_me_malformed_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/auth/me", headers={"Authorization": "Bearer basura"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_no_bearer_prefix():
    # TEST DE SEGURIDAD: Token enviado sin la palabra Bearer
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/auth/me", headers={"Authorization": "eyJhbGci..."})
    assert response.status_code == 403 # HTTPBearer requiere el prefijo

@pytest.mark.asyncio
async def test_get_me_expired_token():
    token = create_access_token(data={"sub": "1"}, expires_delta=timedelta(seconds=-1))
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_user_not_found():
    token = create_access_token(data={"sub": "99999"})
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
    assert response.json()["code"] == "USER_NOT_FOUND"

@pytest.mark.asyncio
async def test_get_me_success():
    email = get_unique_email("me_ok")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/customer", json={
            "name": "User", "email": email, "password": "pass"
        })
        login = await ac.post("/auth/login/customer", json={
            "email": email, "password": "pass"
        })
        token = login.json()["accessToken"]
        response = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == email
