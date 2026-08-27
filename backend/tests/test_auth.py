import pytest
from httpx import AsyncClient

async def test_register(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "Test123!@#",
            "full_name": "New User",
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"

async def test_register_duplicate_email(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user.email,
            "username": "anotheruser",
            "password": "Test123!@#",
        }
    )
    
    assert response.status_code == 400
    assert "User already exists" in response.json()["error"]["message"]

async def test_login(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "Test123!@#",
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email

async def test_login_invalid_credentials(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "wrongpassword",
        }
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["error"]["message"]

async def test_refresh_token(async_client: AsyncClient, test_user):
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "Test123!@#",
        }
    )
    
    refresh_token = login_response.json()["refresh_token"]
    
    response = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

async def test_logout(async_client: AsyncClient, auth_headers):
    response = await async_client.post(
        "/api/v1/auth/logout",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"