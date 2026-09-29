import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from redis.asyncio import Redis

from app.api.v1.deps import get_current_active_user
from app.core.config import settings
from app.core.redis_client import get_redis
from app.models.domain import User
from app.services.ml_service import FaceRecognitionService
from app.workers.celery_app import celery_app

router = APIRouter(prefix="/search", tags=["Search"])


def get_face_service() -> FaceRecognitionService:
    return FaceRecognitionService()


@router.post("/initiate", status_code=status.HTTP_200_OK)
async def initiate_search(
    media_file: UploadFile = File(...),
    time_range_days: int = Form(180, ge=1, le=180),
    platforms: str = Form(""),
    min_confidence: float = Form(0.68, ge=0.0, le=1.0),
    current_user: User = Depends(get_current_active_user),
    redis: Redis = Depends(get_redis),
    face_service: FaceRecognitionService = Depends(get_face_service),
):
    content_type = media_file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Image search requires an image upload.",
        )

    image_bytes = await media_file.read(settings.MAX_UPLOAD_SIZE + 1)
    if len(image_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded image exceeds the maximum allowed size.",
        )

    try:
        face = await run_in_threadpool(face_service.extract_face_embedding, image_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image recognition is unavailable. Please try again later.",
        ) from exc

    if face is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No detectable face was found in the uploaded image.",
        )

    task_id = str(uuid.uuid4())
    selected_platforms = [platform.strip().lower() for platform in platforms.split(",") if platform.strip()]
    if not selected_platforms:
        selected_platforms = ["instagram", "facebook", "twitter", "tiktok", "telegram", "reddit", "youtube"]

    await redis.hset(
        f"search:task:{task_id}",
        mapping={
            "task_id": task_id,
            "user_id": str(current_user.id),
            "status": "queued",
            "progress": "0",
            "results_count": "0",
        },
    )
    try:
        await run_in_threadpool(
            celery_app.send_task,
            "app.workers.search_worker.run_search_task",
            kwargs={
                "task_id": task_id,
                "embedding_data": {"face_embedding": face.embedding.tolist()},
                "biometric_type": "face",
                "time_range_days": time_range_days,
                "platforms": selected_platforms,
                "min_confidence": min_confidence,
                "user_id": str(current_user.id),
            },
        )
    except Exception as exc:
        await redis.delete(f"search:task:{task_id}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search queue is unavailable. Please try again later.",
        ) from exc

    return {
        "task_id": task_id,
        "status": "queued",
        "message": "Image search queued successfully.",
        "websocket_url": f"/api/v1/ws/search/{task_id}",
        "estimated_time": "2-5 minutes",
        "biometric_type": "face",
        "platforms_searched": selected_platforms,
        "time_range_days": time_range_days,
    }