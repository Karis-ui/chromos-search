from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import numpy as np

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.logger import logger
from app.core.exceptions import ChronosException
from app.models.domain import User
from app.schemas.consent import (
    ConsentGrantRequest,
    ConsentProfileResponse,
    ConsentPhotoResponse,
    ConsentStatsResponse,
    ConsentStatusResponse,
    SocialLinksRequest,
    RevokeConsentRequest,
    ConsentSearchResponse,
    ConsentSearchResult,
)
from app.services.consent_service import ConsentService
from app.services.ml_service import FaceRecognitionService
from app.utils.file_handlers import save_uploaded_file

router = APIRouter(prefix="/consent", tags=["Consent"])

def  serialize_profile(profile) -> ConsentProfileResponse:
    return ConsentProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        display_name=profile.display_name,
        bio=profile.bio,
        location=profile.location,
        occupation=profile.occupation,
        company=profile.company,
        consent_given=profile.consent_given,
        consent_version=profile.consent_version,
        consent_given_at=profile.consent_given_at.isoformat() if profile.consent_given_at else None,
        is_active=profile.is_active,
        is_verified=profile.is_verified,
        is_featured=profile.is_featured,
        face_count=profile.face_count or 0,
        face_thumbnail_url=profile.face_thumbnail_url,
        social_links=profile.social_links or {},
        contact_email=profile.contact_email,
        allow_direct_messages=profile.allow_direct_messages,
        allow_email_contact=profile.allow_email_contact,
        allow_phone_contact=profile.allow_phone_contact,
        profile_views=profile.profile_views or 0,
        search_appearances=profile.search_appearances or 0,
        click_throughs=profile.click_throughs or 0,
        lifetime_searches=profile.lifetime_searches or 0,
        monthly_searches=profile.monthly_searches or 0,
        total_earnings=float(profile.total_earnings or 0),
        pending_earnings=float(profile.pending_earnings or 0),
        created_at=profile.created_at.isoformat() if profile.created_at else "",
        updated_at=profile.updated_at.isoformat() if profile.updated_at else "",
        last_searched_at=profile.last_searched_at.isoformat() if profile.last_searched_at else None,
        revoked_at=profile.revoked_at.isoformat() if profile.revoked_at else None,
    )

@router.get('/status',response_model=ConsentStatusResponse)
async def get_consent_status(
    current_user:User = Depends(get_current_user),
    db:AsyncSession = Depends(get_db),
):
    service = ConsentService(db)
    status_data = await service.get_user_consent_status(str(current_user.id))
    profile_response = None
    if status_data['profile']:
        profile_response = serialize_profile(status_data['profile'])
    
    return ConsentStatusResponse(
        has_profile=status_data["has_profile"],
        consent_given=status_data["consent_given"],
        is_active=status_data["is_active"],
        face_count=status_data["face_count"],
        profile=profile_response,
    )

@router.post('/grant',response_model=ConsentProfileResponse,status_code=status.HTTP_201_CREATED)
async def grant_consent(
    data: ConsentGrantRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConsentService(db)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    profile = await service.grant_consent(
        user_id=str(current_user.id),
        display_name=data.display_name,
        bio=data.bio,
        location=data.location,
        occupation=data.occupation,
        company=data.company,
        consent_version=data.consent_version,
        ip_address=ip_address,
        user_agent=user_agent,
        contact_email=data.contact_email,
        allow_direct_messages=data.allow_direct_messages,
        allow_email_contact=data.allow_email_contact,
        allow_phone_contact=data.allow_phone_contact,
    )
    logger.info(f"User {current_user.email} granted consent")
    return serialize_profile(profile)

@router.post("/photos",response_model=ConsentPhotoResponse,status_code=status.HTTP_201_CREATED)
async def upload_photo(
    profile_id: str = Form(...),
    is_primary: bool = Form(False),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed",
        )
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024: 
        raise HTTPException(
            status_code = status.HTTP_413_CONTENT_TOO_LARGE,detail="Photo too large. Max 10MB"
        )   
    
    file_url = await save_uploaded_file(file_bytes,file.filename,subfolder="consent")
    service = ConsentService(db)

    status_data = await service.get_user_consent_status(str(current_user.id))
    if not status_data['has_profile'] or not status_data['consent_given']:
        raise ChronosException(
            message="User must have a profile and have granted consent before uploading photos",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    
    photo = await service.add_photo(
        profile_id=profile_id,
        photo_bytes=file_bytes,
        photo_url=file_url,
        thumbnail_url=file_url,
        is_primary=is_primary,
    )
    return ConsentPhotoResponse(
        id=str(photo.id),
        photo_url=photo.photo_url,
        thumbnail_url=photo.thumbnail_url,
        is_primary=photo.is_primary,
        is_active=photo.is_active,
        face_confidence=photo.face_confidence,
        face_quality_score=photo.face_quality_score,
        created_at=photo.created_at.isoformat() if photo.created_at else "",
    )

@router.put("/social-links",response_model=ConsentProfileResponse)
async def update_social_links(
    data:SocialLinksRequest,
    current_user:User = Depends(get_current_user),
    db:AsyncSession = Depends(get_db)
):
    service = ConsentService(db)
    status_data = await service.get_user_consent_status(str(current_user.id))
    if not status_data['has_profile'] or not status_data['consent_given']:
        raise ChronosException(
            message="User must have a profile and have granted consent before updating social links",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    profile = await service.update_social_links(
        profile_id=data.profile_id,
        social_links=data.social_links,
    )
    return serialize_profile(profile)

@router.delete("/revoke")
async def revoke_consent(
    data: RevokeConsentRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConsentService(db)
    status_data = await service.get_user_consent_status(str(current_user.id))
    if not status_data['has_profile'] or not status_data['consent_given']:
        raise ChronosException(
            message="User must have a profile and have granted consent before revoking consent",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    ip_address = request.client.host if request.client else None
    await service.revoke_consent(
        profile_id=data.profile_id,
        ip_address=ip_address,
        reason=data.reason
    )
    logger.info(f"Consent revoked by user {current_user.id}")
    return {"message":"Consent revoked successfully"}

@router.get("/stats")
async def revoke_consent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConsentService(db)
    status_data = await service.get_user_consent_status(str(current_user.id))
    if not status_data['has_profile'] or not status_data['consent_given']:
        raise ChronosException(
            message="User must have a profile and have granted consent before revoking consent",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    
    stats = await service.get_profile_stats(str(status_data['profile'].id))
    return ConsentStatsResponse(**stats)

@router.post('/search',response_model=ConsentSearchResponse)
async def search_consent(
    file: UploadFile = File(...),
    min_similarity: float = Form(0.68),
    limit: int = Form(50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import time
    start_time = time.time()
    file_bytes = await file.read()

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed",
        )
    file_bytes = await file.read()
    face_service = FaceRecognitionService()
    face_result = face_service.extract_face_embedding(file_bytes)
    if not face_result['face_detected']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No face detected in the image",
        )
    

    service = ConsentService(db)
    matches = await service.search_consent_profiles(
        target_embedding=face_result.embedding,
        min_similarity=min_similarity,
        limit=limit
    )
    duration_ms = (time.time() - start_time) * 1000
    results = [
        ConsentSearchResult(
            profile_id=m["profile_id"],
            user_id=m["user_id"],
            display_name=m["display_name"],
            bio=m.get("bio"),
            location=m.get("location"),
            occupation=m.get("occupation"),
            company=m.get("company"),
            thumbnail=m.get("thumbnail"),
            social_links=m.get("social_links", {}),
            is_verified=m.get("is_verified", False),
            is_featured=m.get("is_featured", False),
            similarity=m["similarity"],
            confidence_level=m["confidence_level"],
            allow_direct_messages=m.get("allow_direct_messages", True),
            source="consent",
        )
        for m in matches
    ]
    
    logger.info(f"🎯 Consent search: {len(results)} matches in {duration_ms:.0f}ms")
    
    return ConsentSearchResponse(
        status="completed",
        total=len(results),
        matches=results,
        duration_ms=duration_ms,
    )
    