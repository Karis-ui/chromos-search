from celery import Task
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
import json

from app.workers.celery_app import celery_app
from app.core.logger import logger
from app.core.database import get_async_db
from app.models.domain import UserFeedback, SearchResult
from app.core.redis_client import get_redis
from app.services.ml_service import FaceRecognitionService

class FeedbackTask(Task):
    abstract = True
    max_retries = 3
    default_retry_delay = 60

@celery_app.task(
    bind=True,
    base=FeedbackTask,
    name="app.workers.feedback_worker.process_feedback",
)
def process_feedback(self, feedback_id: str) -> Dict[str, Any]:
    logger.info(f"📝 Processing feedback: {feedback_id}")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(_process_feedback(feedback_id))
        logger.info(f"✅ Feedback processed: {feedback_id}")
        return result
    except Exception as e:
        logger.error(f"❌ Feedback processing failed: {str(e)}", exc_info=True)
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        raise
    finally:
        loop.close()

async def _process_feedback(feedback_id: str) -> Dict[str, Any]:
    async with get_async_db() as db:
        stmt = select(UserFeedback).where(UserFeedback.id == feedback_id)
        result = await db.execute(stmt)
        feedback = result.scalar_one_or_none()
        
        if not feedback:
            logger.warning(f"Feedback {feedback_id} not found")
            return {"status": "not_found", "feedback_id": feedback_id}
        
        stmt = select(SearchResult).where(SearchResult.id == feedback.result_id)
        result = await db.execute(stmt)
        search_result = result.scalar_one_or_none()
        
        if not search_result:
            logger.warning(f"Search result {feedback.result_id} not found")
            return {"status": "error", "feedback_id": feedback_id, "error": "search_result_not_found"}
        logger.info(
            f"Feedback data: user={feedback.user_id}, "
            f"result={feedback.result_id}, "
            f"match={feedback.is_match}, "
            f"confidence_correct={feedback.confidence_correct}"
        )
        
        feedback.used_for_training = True
        feedback.training_timestamp = datetime.utcnow()
        feedback.training_version = "v1.0"
        
        await db.commit()
        
        redis_client = await get_redis()
        cache_key = f"search:results:{search_result.task_id}:*"
        await redis_client.delete(cache_key)
        
        return {
            "status": "processed",
            "feedback_id": feedback_id,
            "result_id": str(feedback.result_id),
            "used_for_training": True,
        }

@celery_app.task(
    bind=True,
    base=FeedbackTask,
    name="app.workers.feedback_worker.process_batch_feedback",
)
def process_batch_feedback(self, feedback_ids: list) -> Dict[str, Any]:
    logger.info(f"📝 Processing batch of {len(feedback_ids)} feedback entries")
    
    results = {
        "total": len(feedback_ids),
        "processed": 0,
        "failed": 0,
        "errors": [],
    }
    
    for feedback_id in feedback_ids:
        try:
            result = process_feedback(feedback_id)
            results["processed"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"feedback_id": feedback_id, "error": str(e)})
    
    return results

__all__ = ["process_feedback", "process_batch_feedback"]