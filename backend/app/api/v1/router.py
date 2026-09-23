from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    oauth,
    search,
    websocket,
    admin,
    feedback,
    health
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(oauth.router, prefix="/oauth", tags=["OAuth"]) 
router.include_router(search.router, prefix="/search", tags=["Search Engine"])
router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
router.include_router(admin.router, prefix="/admin", tags=["Administration"])
router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
router.include_router(health.router, prefix="/health", tags=["Health Check"])