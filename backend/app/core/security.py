import secrets
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from pydantic import ValidationError
import redis.asyncio as redis
import json
import logging
from functools import wraps
from typing import Callable
import time

from app.core.config import settings
from app.core.redis_client import get_redis
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt","argon2","pbkdf2_sha256"], deprecated="auto",bcrypt__default_rounds=12)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_salt(length: int = 32) -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(length)).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(),'jti': secrets.token_hex(16),'type': 'access'})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(),'jti': secrets.token_hex(16),'type': 'refresh'})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_token(token: str, token_type: str) -> dict:
    payload = decode_token(token)
    if payload.get("type") != token_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type. Expected {token_type}.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def refresh_access_token(refresh_token: str) -> Tuple[str, dict]:
    payload = verify_token(refresh_token, "refresh")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    new_access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "user_id": user_id}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login",auto_error=True)
class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[Dict[str, Any]]:
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme.",
                )
            try:
                payload = decode_token(credentials.credentials)
                return payload
            except JWTError:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token.",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code.",
            )
        
        return credentials.credentials

jwt_bearer = JWTBearer(auto_error=True)
async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"user_id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": payload.get("sub")}

class APIKeyAuth:
    
    def __init__(self, api_key: str = "chromos_api_key"):
        self.api_key = api_key
        
    def generate_api_key(self,user_id: str,name: str) -> str:
        timestamp = int(time.time())
        random_part = secrets.token_hex(16)
        raw_key = f"{user_id}:{name}:{timestamp}:{random_part}"
        return f"{raw_key}:{secrets.token_urlsafe(32)}"
    
    def get_key_hash(self, api_key: str) -> str:
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    async def validate_api_key(self, api_key: str, redis_client: redis.Redis) -> Optional[Dict[str, Any]]:
        key_hash = self.get_key_hash(api_key)
        stored_key = await redis_client.get(key_hash)
        if stored_key is None:
            return False
        return True

class RateLimiter:
    
    def __init__(self, redis_client: redis.Redis, limit: int = 100, period: int = 60):
        self.redis = redis_client
        self.limit = limit
        self.period = period
        
    async def check_rate_limit(self, key: str,limit: int=settings.RATE_LIMIT_REQUESTS,period: int=settings.RATE_LIMIT_PERIOD,burst: int = settings.RATE_LIMIT_BURST) -> Tuple[bool, Dict[str, Any]]:
        now = int(time.time())
        window_start = now - (now % period)
        zset_key = f"rate_limit:{key}:{window_start}"
        await self.redis.zremrangebyscore(zset_key, 0, now - window_start)
        current_count = await self.redis.zcard(zset_key)
        if current_count >= limit:
            ttl = await self.redis.ttl(zset_key)
            return False,{
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + ttl if ttl > 0 else period),
                "Retry-After": str(ttl if ttl > 0 else period),
            }
        await self.redis.zadd(zset_key, {str(now): now})
        await self.redis.expire(zset_key, period)
        remaining = limit - (current_count + 1)
        return True,{
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(time.time()) + period),
        }

    async def is_allowed(self, key: str) -> bool:
        current_count = await self.redis.get(key)
        if current_count is None:
            await self.redis.set(key, 1, ex=self.period)
            return True
        elif int(current_count) < self.limit:
            await self.redis.incr(key)
            return True
        else:
            return False

def rate_limit(self, key_func: Callable[[Request], str]):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                redis_client = await get_redis()
                rate_limiter = RateLimiter(redis_client, limit=settings.RATE_LIMIT_REQUESTS, period=settings.RATE_LIMIT_PERIOD)
                request: Request = kwargs.get("request")
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                if not request:
                    for k, v in kwargs.items():
                        if isinstance(v, Request):
                            request = v
                            break
                if request is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Request object is required for rate limiting.",
                    )
                    
                user_id = None
                if hasattr(request.state, "user_id"):
                    user_id = request.state.user_id
                    
                key = f"{func.__name__}:{user_id if user_id else request.client.host if request.client else 'anonymous'}"
                limit_val = limit or settings.RATE_LIMIT_REQUESTS
                period_val = period or settings.RATE_LIMIT_PERIOD
                burst_val = burst or settings.RATE_LIMIT_BURST
                
                allowed = await rate_limiter.is_allowed(key)
                if not allowed:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Too many requests.",
                    )
                
                response = await func(*args, **kwargs)
                return response
            return wrapper
        return decorator

class CSRFProtection:
    def __init__(self, redis_client: redis.Redis, token_expiry: int = 3600):
        self.redis = redis_client
        self.token_expiry = token_expiry

    async def generate_csrf_token(self, user_id: str) -> str:
        token = secrets.token_urlsafe(32)
        await self.redis.setex(f"csrf:{user_id}:{token}",3600,token)
        return token

    async def validate_csrf_token(self, user_id: str, token: str) -> bool:
        key = await self.redis.get(f"csrf:{user_id}:{token}")
        exists = await self.redis.exists(key)
        if exists:
            return key.decode() == token
        return False
    
    async def invalidate_csrf_token(self, user_id: str, token: str) -> None:
        await self.redis.delete(f"csrf:{user_id}:{token}")

class PermissionChecker:
    PERMISSIONS = {
        "user": ["search", "view_results", "submit_feedback"],
        "premium": ["search", "view_results", "submit_feedback", "export_results", "advanced_search"],
        "admin": ["search", "view_results", "submit_feedback", "export_results", 
                  "advanced_search", "admin_panel", "manage_users", "view_analytics"],
        "super_admin": ["*"],
    }
    
    @classmethod
    def check_permission(cls, role: str, permission: str) -> bool:
        perms = cls.PERMISSIONS.get(role, [])
        return permission in perms or "*" in perms

def require_permission(permission: str):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                for k, v in kwargs.items():
                    if isinstance(v, Request):
                        request = v
                        break
            
            if not request or not hasattr(request.state, "user_role"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied",
                )
            
            role = request.state.user_role
            
            if not PermissionChecker.check_permission(role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission}' required",
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator

def get_secure_headers() -> Dict[str, str]:
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": "default-src 'self';",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    }