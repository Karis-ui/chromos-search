from celery import Celery
from celery.schedules import crontab
from celery.signals import worker_ready, worker_init
import logging
import os

from app.core.config import settings
from app.core.logger import logger

celery_app = Celery(
    "chronos",
    broker=settings.CELERY_BROKER,
    backend=settings.CELERY_BACKEND,
    include=[
        "app.workers.search_worker",
        "app.workers.sweeper_worker",
        "app.workers.feedback_worker",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    task_track_started=True,
    task_time_limit=settings.CELERY_TASK_TIME_LIMIT,
    task_soft_time_limit=settings.CELERY_TASK_SOFT_TIME_LIMIT,
    task_acks_late=settings.CELERY_TASK_ACKS_LATE,
    task_reject_on_worker_lost=settings.CELERY_TASK_REJECT_ON_WORKER_LOST,
    
    worker_prefetch_multiplier=settings.CELERY_WORKER_PREFETCH_MULTIPLIER,
    worker_max_tasks_per_child=settings.CELERY_WORKER_MAX_TASKS_PER_CHILD,
    
    result_expires=3600,  
    result_compression="gzip",
    
    task_default_queue="default",
    task_queues={
        "default": {"exchange": "default", "routing_key": "default"},
        "search": {"exchange": "search", "routing_key": "search"},
        "sweeper": {"exchange": "sweeper", "routing_key": "sweeper"},
        "feedback": {"exchange": "feedback", "routing_key": "feedback"},
        "high_priority": {"exchange": "high_priority", "routing_key": "high_priority"},
    },
    task_routes={
        "app.workers.search_worker.*": {"queue": "search"},
        "app.workers.sweeper_worker.*": {"queue": "sweeper"},
        "app.workers.feedback_worker.*": {"queue": "feedback"},
    },
    
    task_annotations={
        "app.workers.search_worker.run_search_task": {"rate_limit": "10/m"},
        "app.workers.feedback_worker.process_feedback": {"rate_limit": "100/m"},
    },
    
    beat_schedule={
        "run-sweeper-daily": {
            "task": "app.workers.sweeper_worker.run_sweeper",
            "schedule": crontab(hour=0, minute=0),  
            "args": (),
        },
        "cleanup-expired-tasks": {
            "task": "app.workers.sweeper_worker.cleanup_expired_tasks",
            "schedule": crontab(hour=2, minute=0),  
            "args": (),
        },
        "update-search-stats": {
            "task": "app.workers.sweeper_worker.update_daily_stats",
            "schedule": crontab(hour=23, minute=55), 
            "args": (),
        },
    },
)

@worker_init.connect
def worker_init_handler(**kwargs):
    logger.info("🔧 Celery worker initializing...")
    
    os.environ["CELERY_WORKER"] = "true"

@worker_ready.connect
def worker_ready_handler(**kwargs):
    logger.info("✅ Celery worker ready to accept tasks")
    
    queues = celery_app.conf.task_queues
    logger.info(f"📋 Available queues: {', '.join(q.name for q in queues)}")

__all__ = ["celery_app"]