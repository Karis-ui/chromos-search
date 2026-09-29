import asyncio

from app.core import database
from app.core.redis_client import RedisConnectionPool
from app.models.domain import SocialPost


class FakeConnection:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(str(statement))


class FakeBegin:
    def __init__(self, connection):
        self.connection = connection

    async def __aenter__(self):
        return self.connection

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeEngine:
    def __init__(self, connection):
        self.connection = connection

    def begin(self):
        return FakeBegin(self.connection)


def test_init_db_does_not_require_timescaledb(monkeypatch):
    connection = FakeConnection()
    monkeypatch.setattr(database, "get_async_engine", lambda: FakeEngine(connection))
    monkeypatch.setattr(database.settings, "ENABLE_TIMESCALEDB", False)

    asyncio.run(database.init_db(create_tables=False))

    assert not any("timescaledb" in statement for statement in connection.statements)


def test_social_post_does_not_register_ivfflat_index():
    index_names = {index.name for index in SocialPost.__table__.indexes}

    assert "idx_posts_face_embedding" not in index_names


def test_platform_date_index_uses_supported_access_method():
    index = next(
        index for index in SocialPost.__table__.indexes
        if index.name == "idx_posts_platform_date"
    )

    assert index.dialect_options["postgresql"].get("using") in (False, "btree")


def test_redis_client_creation_does_not_deadlock(monkeypatch):
    monkeypatch.setattr(RedisConnectionPool, "_instance", None)
    monkeypatch.setattr(RedisConnectionPool, "_client", None)

    async def create_and_close_client():
        client = await asyncio.wait_for(RedisConnectionPool.get_client(), timeout=1)
        await RedisConnectionPool.close_pool()
        return client

    assert asyncio.run(create_and_close_client()) is not None