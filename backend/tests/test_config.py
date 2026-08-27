import pytest
from app.core.config import settings,Settings

def test_settings_loaded():
    assert settings is not None
    assert settings.PROJECT_NAME == "Chromos Search engine"
    assert settings.VERSION == "3.0.0-masterpiece"

def test_database_url():
    url = settings.DATABASE_URL
    assert "postgresql+asyncpg://" in url
    assert settings.POSTGRES_USER in url

def test_redis_rl():
    url = settings.REDIS_URL
    assert "redis://" in url
    assert str(settings.REDIS_PORT) in url

def test_secret_key():
    assert settings.SECRET_KEY is not None
    assert len(settings.SECRET_KEY.get_secret_value()) > 0

def test_data_retention():
    assert settings.DATA_RETENTION_DAYS == 180
    assert settings.DATA_RETENTION_DAYS > 0