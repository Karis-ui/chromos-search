from celery import signals
from celery.events import EventReceiver
from celery.utils.log import get_logger
import time
from typing import Dict, Any

from app.workers.celery_app import celery_app
from app.core.logger import logger

@signals.task_sent.connect
def task_sent_handler(sender=None, task_id=None, task=None, **kwargs):
    logger.debug(
        f"📤 Task sent: {task_id} - {task.name}",
        extra={"task_id": task_id, "task_name": task.name}
    )

@signals.task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, **kwargs):
    logger.info(
        f"▶️ Task starting: {task_id} - {task.name}",
        extra={"task_id": task_id, "task_name": task.name}
    )

@signals.task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, **kwargs):
    logger.info(
        f"⏹️ Task completed: {task_id} - {task.name}",
        extra={"task_id": task_id, "task_name": task.name}
    )

@signals.task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, **kwargs):
    logger.error(
        f"❌ Task failed: {task_id} - {str(exception)}",
        extra={"task_id": task_id, "error": str(exception)},
        exc_info=True
    )

@signals.task_retry.connect
def task_retry_handler(sender=None, task_id=None, reason=None, **kwargs):
    logger.warning(
        f"🔄 Task retrying: {task_id} - {reason}",
        extra={"task_id": task_id, "reason": str(reason)}
    )

@signals.task_success.connect
def task_success_handler(sender=None, result=None, **kwargs):
    logger.info(
        f"✅ Task succeeded: {sender}",
        extra={"task_name": sender}
    )

class WorkerMonitor:
    def __init__(self):
        self.stats = {
            "active": 0,
            "processed": 0,
            "failed": 0,
            "retries": 0,
        }
    
    async def get_worker_stats(self) -> Dict[str, Any]:
        try:
            i = celery_app.control.inspect()
            
            stats = i.stats()
            active = i.active()
            scheduled = i.scheduled()
            reserved = i.reserved()
            
            return {
                "workers": len(stats) if stats else 0,
                "active_tasks": len(active) if active else 0,
                "scheduled_tasks": len(scheduled) if scheduled else 0,
                "reserved_tasks": len(reserved) if reserved else 0,
                "stats": stats,
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.error(f"Failed to get worker stats: {str(e)}")
            return {"error": str(e)}
    
    async def get_queue_length(self, queue: str = "default") -> int:
        try:
            from app.core.redis_client import get_redis
            redis_client = await get_redis()
            length = await redis_client.llen(queue)
            return length
        except Exception as e:
            logger.error(f"Failed to get queue length: {str(e)}")
            return -1

__all__ = ["WorkerMonitor"]