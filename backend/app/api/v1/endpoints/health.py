from fastapi import APIRouter, Depends, status
from typing import Dict, Any
import time
import psutil
import platform

from app.core.config import settings
from app.core.database import check_database_health
from app.core.redis_client import get_redis
from app.core.logger import logger

router = APIRouter(tags=["Health"])

@router.get("/",status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str,Any]:
    return{
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time(),
    }

@router.get("/detailed",status_code=status.HTTP_200-OK)
async def detailed_health_check() -> Dict[str,Any]:
    start_time = time.time()
    db_health = await check_database_health()
    redis_healthy = False
    redis_details = {}
    try:
        redis_client = await get_redis()
        await redis_client.ping()
        redis_healthy = True
        redis_details = {
            "info": await redis_client.info("server"),
            "memory": await redis_client.info("memory"),
        }
    except Exception as e:
        redis_details = {'error':str(e)}
    
    system_info = {
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "processor": platform.processor(),
        "cpu_count": psutil.cpu_count(),
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent,
        },
        "disk": {
            "total": psutil.disk_usage('/').total,
            "used": psutil.disk_usage('/').used,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent,
        },
    }
    all_healthy = db_health["connected"] and redis_healthy
    response = {
        "status": "healthy" if all_healthy else "unhealthy",
        "timestamp": time.time(),
        "response_time_ms": (time.time() - start_time) * 1000,
        "dependencies": {
            "database": {
                "healthy": db_health["connected"],
                "details": db_health["details"],
                "response_time_ms": db_health["response_time_ms"],
            },
            "redis": {
                "healthy": redis_healthy,
                "details": redis_details,
            },
        },
        "system": system_info,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }
    return response

@router.get("/ready",status_code=status.HTTP_200_OK)
async def readiness_probe() -> Dict[str,Any]:
    db_health = await check_database_health()
    if not db_health["connected"]:
        return {
            "status": "not_ready",
            "reason": "database_unavailable",
        }
    return{
        "status": "ready",
        "timestamp": time.time(),
    }
    
@router.get("/metrics")
async def metrics() -> Dict[str,Any]:
    from prometheus_client import generate_latest, REGISTRY, CONTENT_TYPE_LATEST
    from fastapi.responses import Response
    return Response(
        content=generate_latest(REGISTRY),
        media_type=CONTENT_TYPE_LATEST,
    )