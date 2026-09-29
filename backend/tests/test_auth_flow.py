import asyncio
import bcrypt
from datetime import datetime
from types import SimpleNamespace
from uuid import uuid4
from urllib.parse import parse_qs, urlsplit

from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.requests import Request

from app.api.v1.router import router as api_v1_router
from app.api.v1.endpoints import auth
from app.core.config import settings
from app.core.security import hash_password, verify_password, verify_token


class FakeResult:
    def __init__(self, user):
        self.user = user

    def scalar_one_or_none(self):
        return self.user


class FakeSession:
    def __init__(self):
        self.user = None
        self.pending_user = None

    async def execute(self, statement):
        return FakeResult(self.user)

    def add(self, user):
        self.pending_user = user

    async def commit(self):
        if self.pending_user is not None:
            self.user = self.pending_user
            self.pending_user = None

    async def refresh(self, user):
        user.id = user.id or uuid4()
        user.is_premium = False
        user.searches_today = 0
        user.daily_search_limit = 50
        user.created_at = user.created_at or datetime.utcnow()


class FakeRedis:
    def __init__(self):
        self.values = {}

    async def zremrangebyscore(self, key, minimum, maximum):
        return 0

    async def zcard(self, key):
        return 0

    async def zadd(self, key, mapping):
        return 1

    async def expire(self, key, seconds):
        return True

    async def setex(self, key, seconds, value):
        self.values[key] = value

    async def getdel(self, key):
        return self.values.pop(key, None)


def test_password_hashing_supports_argon2_and_existing_bcrypt():
    password = "Test123!@#"
    assert verify_password(password, hash_password(password))

    legacy_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    assert verify_password(password, legacy_hash)


def test_register_login_refresh_and_profile_flow():
    async def run_flow():
        db = FakeSession()
        request = Request({
            "type": "http",
            "method": "POST",
            "path": "/api/v1/auth/register",
            "headers": [],
            "query_string": b"",
        })
        user_data = auth.UserRegister(
            email="newuser@example.com",
            username="newuser",
            password="Test123!@#",
            full_name="New User",
        )

        registered = await auth.register(user_data, request, db)
        assert registered["message"] == "User registered successfully"
        assert db.user.email == "newuser@example.com"

        login_result = await auth.login(
            SimpleNamespace(username="newuser@example.com", password="Test123!@#"),
            db,
            FakeRedis(),
        )
        refresh_payload = verify_token(login_result.refresh_token, "refresh")
        assert refresh_payload["sub"] == str(db.user.id)

        refreshed = await auth.refresh_token(
            auth.RefreshTokenRequest(refresh_token=login_result.refresh_token),
            db,
        )
        assert verify_token(refreshed.access_token, "access")["sub"] == str(db.user.id)

        profile = await auth.get_current_user_info(login_result.access_token, db)
        assert profile["email"] == "newuser@example.com"

    asyncio.run(run_flow())


def test_auth_http_routes_accept_frontend_payloads(monkeypatch):
    db = FakeSession()
    redis = FakeRedis()
    monkeypatch.setattr(settings, "DEBUG", True)
    monkeypatch.setattr(settings, "SMTP_USER", None)
    monkeypatch.setattr(settings, "SMTP_PASSWORD", None)
    test_app = FastAPI()
    test_app.include_router(api_v1_router, prefix="/api/v1")
    test_app.dependency_overrides[auth.get_db] = lambda: db
    test_app.dependency_overrides[auth.get_redis] = lambda: redis

    with TestClient(test_app) as client:
        providers_response = client.get("/api/v1/oauth/providers")
        assert providers_response.status_code == 200
        assert providers_response.json() == {"providers": []}

        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "httpuser@example.com",
                "username": "httpuser",
                "password": "Test123!@#",
                "full_name": "HTTP User",
                "acceptTerms": True,
            },
        )
        assert register_response.status_code == 200

        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "HTTPUSER@example.com", "password": "Test123!@#"},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        assert tokens["access_token"]
        assert tokens["refresh_token"]

        profile_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert profile_response.status_code == 200
        assert profile_response.json()["email"] == "httpuser@example.com"

        reset_request = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "httpuser@example.com"},
        )
        assert reset_request.status_code == 200
        reset_token = parse_qs(urlsplit(reset_request.json()["reset_url"]).query)["token"][0]

        reset_confirmation = client.post(
            "/api/v1/auth/password-reset/confirm",
            json={"token": reset_token, "new_password": "NewPass123!"},
        )
        assert reset_confirmation.status_code == 200

        updated_login = client.post(
            "/api/v1/auth/login",
            data={"username": "httpuser@example.com", "password": "NewPass123!"},
        )
        assert updated_login.status_code == 200