from celery import Task
from celery.exceptions import Retry
import asyncio
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import numpy as np

from app.workers.celery_app import celery_app
from app.core.logger import logger, get_correlation_id, set_correlation_id
from app.core.database import get_async_db
from app.core.redis_client import get_redis, get_cache
from app.services.ml_service import FaceRecognitionService, VoiceRecognitionService
from app.services.social_crawler import SocialCrawlerService
from app.services.search_orchestrator import SearchOrchestrator
from app.core.exceptions import SearchException
from app.core.config import settings

class SearchTask(Task):
    abstract = True
    max_retries = 3
    default_retry_delay = 60
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(
            f"Task {task_id} failed: {str(exc)}",
            extra={"task_id": task_id},
            exc_info=True,
        )
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.warning(
            f"Task {task_id} retrying: {str(exc)}",
            extra={"task_id": task_id},
        )

@celery_app.task(
    bind=True,
    base=SearchTask,
    name="app.workers.search_worker.run_search_task",
    max_retries=3,
    default_retry_delay=60,
)
def run_search_task(
    self,
    task_id: str,
    embedding_data: Dict[str, Any],
    biometric_type: str,
    time_range_days: int,
    platforms: List[str],
    min_confidence: float,
    user_id: str,
) -> Dict[str, Any]:
    set_correlation_id(f"task_{task_id}")
    logger.info(f"🚀 Starting search task: {task_id}")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(
            _execute_search(
                task_id=task_id,
                embedding_data=embedding_data,
                biometric_type=biometric_type,
                time_range_days=time_range_days,
                platforms=platforms,
                min_confidence=min_confidence,
                user_id=user_id,
            )
        )
        
        logger.info(f"✅ Search task completed: {task_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Search task failed: {str(e)}", exc_info=True)
        
        if self.request.retries < self.max_retries:
            logger.warning(f"Retrying task {task_id} (attempt {self.request.retries + 1})")
            raise self.retry(exc=e, countdown=self.default_retry_delay * (self.request.retries + 1))
        
        loop.run_until_complete(
            _update_task_status(
                task_id=task_id,
                status="failed",
                error=str(e),
            )
        )
        
        raise
        
    finally:
        loop.close()
        
async def _execute_search(
    task_id: str,
    embedding_data: Dict[str, Any],
    biometric_type: str,
    time_range_days: int,
    platforms: List[str],
    min_confidence: float,
    user_id: str,
) -> Dict[str, Any]:
    face_service = FaceRecognitionService()
    voice_service = VoiceRecognitionService()
    crawler = SocialCrawlerService()
    
    face_embedding = None
    voice_embedding = None
    
    if embedding_data.get("face_embedding"):
        face_embedding = np.array(embedding_data["face_embedding"])
    
    if embedding_data.get("voice_embedding"):
        voice_embedding = np.array(embedding_data["voice_embedding"])
    
    async with get_async_db() as db:
        redis_client = await get_redis()
        cache = await get_cache()
        
        orchestrator = SearchOrchestrator(
            db=db,
            cache=cache,
            face_service=face_service,
            voice_service=voice_service,
            crawler=crawler,
        )
        
        async def progress_callback(progress: int, message: str):
            """Update progress in Redis and broadcast via pub/sub"""
            await redis_client.hset(
                f"search:task:{task_id}",
                "progress",
                str(progress),
            )
            await redis_client.hset(
                f"search:task:{task_id}",
                "status",
                message,
            )
            
            await redis_client.publish(
                f"search:updates:{task_id}",
                json.dumps({
                    "type": "progress",
                    "data": {
                        "progress": progress,
                        "status": message,
                    },
                    "timestamp": datetime.utcnow().isoformat(),
                })
            )
        
        result = await orchestrator.execute_search(
            task_id=task_id,
            face_embedding=face_embedding,
            voice_embedding=voice_embedding,
            biometric_type=biometric_type,
            time_range_days=time_range_days,
            platforms=platforms,
            min_confidence=min_confidence,
            user_id=user_id,
            progress_callback=progress_callback,
        )
        
        matches = result.get("matches", [])
        for match in matches[:50]:
            await redis_client.publish(
                f"search:updates:{task_id}",
                json.dumps({
                    "type": "result",
                    "data": {
                        "id": str(match["post"].id),
                        "platform": match["post"].platform.value,
                        "posted_at": match["post"].posted_at.isoformat(),
                        "similarity": match["similarity"],
                        "confidence": match["confidence"],
                        "thumbnail": match["post"].thumbnail_url,
                        "caption": match["post"].caption[:200] if match["post"].caption else None,
                        "author": match["post"].author_username,
                    },
                    "timestamp": datetime.utcnow().isoformat(),
                })
            )
        
        await redis_client.hset(f"search:task:{task_id}", mapping={
            "status": "completed",
            "progress": "100",
            "results_count": str(len(matches)),
            "completed_at": datetime.utcnow().isoformat(),
        })
        
        await redis_client.publish(
            f"search:updates:{task_id}",
            json.dumps({
                "type": "complete",
                "data": {
                    "message": f"Search complete! Found {len(matches)} matches",
                    "results_count": len(matches),
                },
                "timestamp": datetime.utcnow().isoformat(),
            })
        )
        
        return result

async def _update_task_status(
    task_id: str,
    status: str,
    error: Optional[str] = None,
) -> None:
    redis_client = await get_redis()
    
    await redis_client.hset(f"search:task:{task_id}", "status", status)
    if error:
        await redis_client.hset(f"search:task:{task_id}", "error", error)
        await redis_client.hset(f"search:task:{task_id}", "completed_at", datetime.utcnow().isoformat())

__all__ = ["run_search_task"]