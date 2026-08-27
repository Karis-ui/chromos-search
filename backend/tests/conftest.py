import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from fastapi.testclient import TestClient
from httpx import AsyncClient
import redis.asyncio as redis
from datetime import datetime
import uuid

from app.main import app
from app.core.database import Base, get_db
from app.core.redis_client import get_redis
from app.core.config import settings
from app.models.domain import User, UserRole

TEST_DATABASE_URL = settings.TEST_DATABASE_URL

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=NullPool
)

TestingAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope='session')
async def test_db_setup():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield 
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session(test_db_setup) -> AsyncGenerator[AsyncSession,None]:
    async with TestingAsyncSessionLocal() as session:
        yield session
        await session.rollback()
        await session.close()
        
@pytest.fixture
async def redis_client() -> AsyncGenerator:
    client = await redis.from_url(settings.REDIS_URL,decode_responses=True)
    yield client
    await session.flushall()
    await session.close()

@pytest.fixture
def client() -> Generator:
    async def override_get_db():
        async with TestingAsyncSessionLocal() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
        
    app.dependency_overrides.clear()
    
@pytest.fixture
async def test_user(db_session:AsyncSession) -> User:
    from app.core.security import hash_password
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=hash_password("Test123!@#"),
        role=UserRole.USER,
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_admin_user(db_session:AsyncSession) -> User:
    from app.core.security import hash_password
    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        username="adminuser",
        full_name="Admin User",
        hashed_password=hash_password("Admin123!@#"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user:User):
    from app.core.security import create_access_token
    token = create_access_token({"sub":str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_auth_headers(test_admin_user:User):
    from app.core.security import create_access_token
    token = create_access_token({"sub":str(test_admin_user.id)})
    return {"Authorization": f"Bearer {token}"}