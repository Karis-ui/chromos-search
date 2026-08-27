import pytest
from datetime import datetime, timedelta
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    RateLimiter,
)
from app.core.exceptions import UnauthorizedException

def test_password_hashing():
    password = "Testing123!@#"
    hashed = hash_password(password)
    assert hashed is not None
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False

def test_jwt_token_creation():
    user_id = "test-user-123"
    access_token = create_access_token({'sub':user_id})
    refresh_token = create_refresh_token({"sub":user_id})
    assert access_token is not None
    assert refresh_token is not None
    assert access_token != refresh_token

def test_jwt_token_expiration():
    from jose import jwt
    from app.core.config import settings
    
    user_id = "test-user-123"
    token = create_access_token(
        {"sub":user_id},
        expires_delta=timedelta(seconds=1)
    )
    import time
    time.sleep(2)
    payload = verify_token(token)
    assert payload is None

def test_rate_limter(redis_client):
    limiter = RateLimiter(redis_client)
    key = "test:rate:limit"
    allowed,headers = await limiter.check_rate_limit(key,limit=3,period=10)
    assert allowed is True
    
    for _ in range(2):
        allowed, _ = await limiter.check_rate_limit(key,limi3,period=10)
        assert allowed is True
        
        allowed, _ = await limiter.check_rate_limit(key,limi3,period=10)
        assert allowed is False
        assert "Retry after" in headers