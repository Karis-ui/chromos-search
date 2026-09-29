from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient
import numpy as np

from app.api.v1 import deps
from app.api.v1.endpoints import search as search_endpoint
from app.api.v1.router import router as api_v1_router
from app.core.redis_client import get_redis
from app.core.security import create_access_token


class FakeResult:
    def scalar_one_or_none(self):
        return SimpleNamespace(id="test-user", is_active=True, role=SimpleNamespace(value="user"))


class FakeRedis:
    async def hset(self, key, mapping):
        self.key = key
        self.mapping = mapping

    async def delete(self, key):
        return 1


class FakeFaceService:
    def extract_face_embedding(self, image_bytes):
        return SimpleNamespace(embedding=np.array([0.1, 0.2], dtype=np.float32))


class FakeSession:
    async def execute(self, statement):
        return FakeResult()


def create_test_client():
    app = FastAPI()
    app.include_router(api_v1_router, prefix="/api/v1")

    async def fake_get_db():
        yield FakeSession()

    app.dependency_overrides[deps.get_db] = fake_get_db
    app.dependency_overrides[get_redis] = lambda: FakeRedis()
    app.dependency_overrides[search_endpoint.get_face_service] = FakeFaceService
    return TestClient(app)


def test_search_initiate_queues_image_search(monkeypatch):
    dispatched = {}
    monkeypatch.setattr(
        search_endpoint.celery_app,
        "send_task",
        lambda name, kwargs: dispatched.update(name=name, kwargs=kwargs),
    )

    with create_test_client() as client:
        response = client.post(
            "/api/v1/search/initiate",
            files={"media_file": ("query.jpg", b"image-bytes", "image/jpeg")},
            data={"time_range_days": "180", "platforms": "instagram,twitter", "min_confidence": "0.68"},
            headers={"Authorization": f"Bearer {create_access_token({'sub': 'test-user'})}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["task_id"]
    assert data["websocket_url"].endswith(data["task_id"])
    assert dispatched["kwargs"]["embedding_data"]["face_embedding"] == [
        0.10000000149011612,
        0.20000000298023224,
    ]


def test_search_route_rejects_malformed_token_without_500():
    with create_test_client() as client:
        response = client.post(
            "/api/v1/search/initiate",
            files={"media_file": ("query.jpg", b"image-bytes", "image/jpeg")},
            headers={"Authorization": "Bearer malformed-token"},
        )

    assert response.status_code == 401


def test_search_route_requires_bearer_authentication():
    with create_test_client() as client:
        response = client.post(
            "/api/v1/search/initiate",
            files={"media_file": ("query.jpg", b"image-bytes", "image/jpeg")},
        )

    assert response.status_code in (401, 403)


def test_search_initiate_rejects_non_media_upload():
    with create_test_client() as client:
        response = client.post(
            "/api/v1/search/initiate",
            files={"media_file": ("notes.txt", b"not media", "text/plain")},
            headers={"Authorization": f"Bearer {create_access_token({'sub': 'test-user'})}"},
        )

    assert response.status_code == 415