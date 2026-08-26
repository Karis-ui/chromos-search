from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import re

from app.core.config import settings
from app.core.database import get_db, get_async_db
from app.core.security import (
    create_access_token, create_refresh_token, 
    verify_token, refresh_access_token,
    hash_password, verify_password,
    RateLimiter, rate_limit, get_redis
)
from app.core.exceptions import (
    UnauthorizedException, BadRequestException, 
    ConflictException, NotFoundException,
    ValidationException
)
from app.models.domain import User, UserRole, ApiKey
from app.core.logger import logger

router = APIRouter(prefix="/auth",tags=["Authentication"])

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(...,min_length=3,max_length=50)
    password: str = Field(...,min_length = 100)
    full_name: Optional[str] = Field(None,max_length=100)
    
    @validator('username')
    def validate_username(cls,v):
        if not re.match(r'^[a-zA-Z0-9_]+$',v):
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v
    
    @validator('password')
    def validate_password(cls,v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{};:,.<>?'  for c in v):
            raise ValueError('Password must contain at least one special letter')
        
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    user: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class APIKeyResponse(BaseModel):
    api_key: str
    name: str
    created_at: datetime
    expires_at: Optional[datetime]
    
@router.post("/register",response_model=Dict[str,str])
async def register(user_data:UserRegister,request:Request,db=Depends(get_db)):
    from sqlalchemy import select
    stmt = select(User).where((User.email == user_data.email) | (User.username == user_data.username))
    result = await db.execute(stmt)
    existing = result.scalar_ne_or_none()
    
    if existing:
        raise ConflictException(
            message="User already exists",
            details={"email":user_data.email,"username":user_data.username}
        )
        hashed_password = hash_password(user_data.password)
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=UserRole.USER,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        logger.info(f"User registered: {user_data.email}")
        return{
            "message": "User registered successfully",
            "user_id": str(new_user.id),
            "email": new_user.email,
            "username": new_user.username
        }
    
@router.post("/login",response=TokenResponse)
@rate_limit(limit=10,period=60)
async def login(
    form_data: OAuth2PasswordRequestForm=Depends(),
    db=Depends(get_db),
    redis=Depends(get_redis)
):
    from sqlalchemy import select
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException(message="Invalid credentials")
    if not user.is_active:
        raise UnauthorizedException(message="Account is inactive")
    if not verify_password(form_data.password,user.hashed_password):
        raise UnauthorizedException(message="Invalid credentials")
    
    user.last_login_at = datetime.utcnow()
    await db.commit()
    
    access_token = create_access_token({"sub":str(user.id)})
    refresh_token = refresh_access_token({"sub":str(user.id)})
    logger.info(f"User logged in: {user.email}")
    
    rate_limiter = RateLimiter(redis)
    key = f"login: {user.id}"
    await rate_limiter.check_rate_limit(key,limit=100,period=3600)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_premium": user.is_premium,
            "premium_until": user.premium_until.isoformat() if user.premium_until else None,
        }
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshTokenRequest,
    db = Depends(get_db)
):
    tokens = refresh_access_token(data.refresh_token)
    if not tokens:
        raise UnauthorizedException(message="Invalid or expired refresh token")
    
    access_token, new_refresh_token = tokens
    
    payload = verify_token(access_token)
    if not payload:
        raise UnauthorizedException(message="Invalid token")
    
    user_id = payload.get("sub")
    
    from sqlalchemy import select
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException(message="User not found")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_premium": user.is_premium,
        }
    )

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LOGOUT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/logout")
async def logout(
    request: Request,
    redis = Depends(get_redis)
):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        await redis.setex(f"blacklist:{token}", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "1")
    
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_info(
    request: Request,
    db = Depends(get_db)
):  
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise UnauthorizedException(message="Not authenticated")
    
    from sqlalchemy import select
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundException(message="User not found")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role.value,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_premium": user.is_premium,
        "premium_until": user.premium_until.isoformat() if user.premium_until else None,
        "created_at": user.created_at.isoformat(),
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "searches_today": user.searches_today,
        "daily_search_limit": user.daily_search_limit,
    }