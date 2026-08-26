from celery import Task
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select, delete, and_, func

from app.workers.celery_app import celery_app
from app.core.logger import logger
from app.core.database import get_async_db, get_sync_db
from app.core.config import settings
from app.models.domain import SocialPost, SearchHistory, SearchResult
from app.core.exceptions import DatabaseException

class SweeperTask(Task):
    abstract = True
    max_retries = 2
    default_retry_delay = 300 

@celery_app.task(
    bind=True,
    base=SweeperTask,
    name="app.workers.sweeper_worker.run_sweeper",
)
def run_sweeper(self) -> Dict[str, Any]:
    logger.info("🧹 Starting data retention sweeper")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(_run_sweeper())
        logger.info(f"✅ Sweeper completed: {result}")
        return result
    except Exception as e:
        logger.error(f"❌ Sweeper failed: {str(e)}", exc_info=True)
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        raise
    finally:
        loop.close()

async def _run_sweeper() -> Dict[str, Any]:
    cutoff_date = datetime.utcnow() - timedelta(days=settings.DATA_RETENTION_DAYS)
    results = {
        "archived_posts": 0,
        "deleted_search_history": 0,
        "deleted_search_results": 0,
        "cutoff_date": cutoff_date.isoformat(),
    }
    
    async with get_async_db() as db:
        if settings.SWEEPER_ARCHIVE_ENABLED:
            stmt = select(SocialPost).where(
                and_(
                    SocialPost.posted_at < cutoff_date,
                    SocialPost.is_active == True,
                )
            ).limit(settings.SWEEPER_BATCH_SIZE)
            
            result = await db.execute(stmt)
            posts_to_archive = result.scalars().all()
            
            for post in posts_to_archive:
                post.is_active = False
                post.archived_at = datetime.utcnow()
                results["archived_posts"] += 1
            
            await db.commit()
            logger.info(f"📦 Archived {results['archived_posts']} posts")
        
        stmt = delete(SearchHistory).where(
            SearchHistory.completed_at < cutoff_date
        )
        result = await db.execute(stmt)
        results["deleted_search_history"] = result.rowcount
        
        subquery = select(SearchHistory.task_id)
        stmt = delete(SearchResult).where(
            SearchResult.task_id.not_in(subquery)
        )
        result = await db.execute(stmt)
        results["deleted_search_results"] = result.rowcount
        
        await db.commit()
    
    return results

@celery_app.task(
    bind=True,
    base=SweeperTask,
    name="app.workers.sweeper_worker.cleanup_expired_tasks",
)
def cleanup_expired_tasks(self) -> Dict[str, Any]:
    logger.info("🧹 Cleaning up expired tasks")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(_cleanup_expired_tasks())
        return result
    finally:
        loop.close()

async def _cleanup_expired_tasks() -> Dict[str, Any]:
    from app.core.redis_client import get_redis
    
    redis_client = await get_redis()
    results = {"deleted": 0, "expired_keys": []}
    
    pattern = "search:task:*"
    cursor = 0
    
    while True:
        cursor, keys = await redis_client.scan(cursor, match=pattern, count=100)
        
        for key in keys:
            ttl = await redis_client.ttl(key)
            if ttl < 0:
                task_data = await redis_client.hgetall(key)
                status = task_data.get("status", "")
                created_at = task_data.get("created_at")
                
                if created_at:
                    try:
                        created = datetime.fromisoformat(created_at)
                        if (datetime.utcnow() - created).days > 1:
                            # Delete expired task
                            await redis_client.delete(key)
                            results["deleted"] += 1
                            results["expired_keys"].append(key.decode())
                    except:
                        pass
        
        if cursor == 0:
            break
    
    logger.info(f"🗑️ Cleaned up {results['deleted']} expired tasks")
    return results

@celery_app.task(
    bind=True,
    base=SweeperTask,
    name="app.workers.sweeper_worker.update_daily_stats",
)
def update_daily_stats(self) -> Dict[str, Any]:
    logger.info("📊 Updating daily statistics")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(_update_daily_stats())
        return result
    finally:
        loop.close()

async def _update_daily_stats() -> Dict[str, Any]:
    from app.core.database import get_async_db
    from app.models.domain import User
    
    async with get_async_db() as db:
        stmt = select(User).where(User.is_active == True)
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        updated = 0
        for user in users:
            if user.last_search_reset:
                if user.last_search_reset.date() < datetime.utcnow().date():
                    user.searches_today = 0
                    user.last_search_reset = datetime.utcnow()
                    updated += 1
        
        await db.commit()
        
        logger.info(f"📈 Reset daily searches for {updated} users")
        
        return {
            "users_reset": updated,
            "timestamp": datetime.utcnow().isoformat(),
        }

__all__ = ["run_sweeper", "cleanup_expired_tasks", "update_daily_stats"]