from typing import Optional, Dict, Any
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis

from app.core.database import get_db
from app.core.redis_client import get_redis, get_cache, CacheService
from app.core.security import verify_token, get_current_user as get_user
from app.core.logger import get_correlation_id, set_user_id
from app.models.domain import User
from app.core.exceptions import UnauthorizedException, ForbiddenException

class JWtBearer(HTTPBearer):
    async def __call__(self,request:Request) -> Optional[str]:
        credentials:HTTPAuthorizationCredentials = await super().__call__(request)
        if not credentials:
            raise UnauthorizedException(
                message="Missing authentication credentials"
            )
        if credentials.scheme != "Bearer":
            raise UnauthorizedException(
                message="Invalid authentication scheme"
            )
        payload = verify_token(credentials.credentials)
        if not payload:
            raise UnauthorizedException(
                message="Invalid or expired token"
            )
        
        user_id = payload.get(+'sub')
        request.state.user_id = user_id
        set_user_id(user_id)
        return credentials.credentials
    
jwt_bearer = JWtBearer()

async def get_current_user(
    request:Request,
    db:AsyncSession=Depends(get_db),
    token:str = Depends(jwt_bearer)
) -> User:
    user_id = request.state.user_id
    from sqlalchemy import select
    from app.models.domain import User
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException(message="user not found")
    if not user.is_active:
        raise UnauthorizedException(message="user account is inactive")
    request.state.user = user
    request.state.user_role = user.role.value
    return user

async def get_current_active_user(current_user:User=Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise UnauthorizedException(message="user account is inactive") 
    return current_user

async def get_current_premium_user(current_user:User=Depends(get_current_active_user)) -> User:
    if not current_user.is_premium_active:
        raise ForbiddenException(message="Premium subsrciption required",details={"premium untill": str(current_user.premium_until)}) 
    return current_user

async def get_current_admin_user(current_user:User=Depends(get_current_active_user)) -> User:
    if not current_user.is_admin:
        raise ForbiddenException(message="Admin access only") 
    return current_user

async def get_db_session() -> AsyncSession:
    async for session in get_db():
        yield session

async def get_cache_service() -> CacheService:
    return await get_redis()

from app.core.security import RateLimiter

async def get_rate_limiter(redis_client: redis.Redis = Depends(get_redis))-> RateLimiter:
    return RateLimiter(redis_client)

__all__ = [
    "jwt_bearer",
    "get_current_user",
    "get_current_active_user",
    "get_current_premium_user",
    "get_current_admin_user",
    "get_db_session",
    "get_cache_service",
    "get_redis_client",
    "get_rate_limiter",
]