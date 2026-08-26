from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.v1.deps import get_current_admin_user, get_db_session
from app.models.domain import User, SearchHistory, SearchResult, UserFeedback
from app.core.logger import logger
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats")
async def get_system_stats(
    admin_user:User = Depends(get_current_admin_user),
    db:AsyncSession = Depends(get_db_session)
) -> Dict[str,Any]:
    total_users = await db.scalar(select(func.count()).select_from(User))
    active_users = await db.scalar(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    premium_users = await db.scalar(
        select(func.count()).select_from(User).where(User.is_premium == True)
    )
    total_searches = await db.scalar(
        select(func.count()).select_from(SearchHistory)
    )
    searches_today = await db.scalar(
        select(func.count()).select_from(SearchHistory).where(SearchHistory.started_at >= datetime.utcnow() - timedelta(days=1))
    )
    total_results = await db.scalar(
        select(func.count()).select_from(SearchResult)
    )
    total_feedback = await db.scalar(
        select(func.count()).select_from(UserFeedback)
    )
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "users": {
            "total": total_users or 0,
            "active": active_users or 0,
            "premium": premium_users or 0,
        },
        "searches": {
            "total": total_searches or 0,
            "today": searches_today or 0,
        },
        "results": {
            "total": total_results or 0,
        },
        "feedback": {
            "total": total_feedback or 0,
        },
    }
    
@router.get("/users")
async def list_users(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
) -> List[Dict[str,Any]]:
    query = select(User)
    if search:
        query = query.where(
            (User.email.ilike(f'%(search)%')) |
            (User.username.ilike(f'%(search)%')) |
            (User.full_name.ilike(f'%(search)%')) 
        )
    
    query = query.offset(skip).limit(limit).order_by(desc(User.created_at))
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_premium": u.is_premium,
            "premium_until": u.premium_until.isoformat() if u.premium_until else None,
            "created_at": u.created_at.isoformat(),
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        }
        for u in users
    ]

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str,Any]:
    from app.models.domain import UserRole
    
    if role not in [r.value for r in UserRole]:
        return {"error":f"Invalid role. Must be one of: {[r.value for r in UserRole]}"}
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        return {"error":"User not found"}
    user.role = UserRole(role)
    await db.commit()
    logger.info(f"User {user.email} role updated to {role} by admin {admin_user.email}")
    return {
        "message": f"User {user.email} role updated to {role}",
        "user_id": str(user.id),
        "role": role,
    }

@router.post("/maintenance/cleanup")
async def cleanup_old_data(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db_session),
    days: int = Query(settings.DATA_RETENTION_DAYS, ge=1, le=365),
) -> Dict[str,Any]:
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    old_searches = await db.execute(
        select(SearchHistory).where(SearchHistory.started_at < cutoff_date)
    )
    count = old_searches.rowcount
    await db.execute(
        SearchHistory.__table__.delete().where(SearchHistory.started_at < cutoff_date)
    )
    await db.execute(
        SearchResult.__table_args__.delete().where(SearchResult.created_at < cutoff_date)
    )
    await db.commit()
    logger.info(f"Cleaned up data older than {days} days by admin {admin_user.username}")
    return {
        "message": f"Cleaned up data older than {days} days",
        "deleted_searches": count,
        "cutoff_date": cutoff_date.isoformat(),
    }

@router.get("/config")
async def get_system_config(
    admin_user:User = Depends(get_current_admin_user),
) -> Dict[str,Any]:
    config = {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "api_v1_prefix": settings.API_V1_STR,
        "data_retention_days": settings.DATA_RETENTION_DAYS,
        "rate_limit_requests": settings.RATE_LIMIT_REQUESTS,
        "rate_limit_period": settings.RATE_LIMIT_PERIOD,
        "face_match_threshold": settings.FACE_MATCH_THRESHOLD,
        "voice_match_threshold": settings.VOICE_MATCH_THRESHOLD,
    }
    config["database"] = {
        "host": settings.POSTGRES_HOST,
        "port": settings.POSTGRES_PORT,
        "db": settings.POSTGRES_DB,
        "pool_size": settings.POSTGRES_POOL_SIZE,
    }
    config["redis"] = {
        "host": settings.REDIS_HOST,
        "port": settings.REDIS_PORT,
    }
    return config