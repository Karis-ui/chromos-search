import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import numpy as np
from sqlalchemy import select, and_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
    ConflictException,
)
from app.models.domain import (
    ConsentProfile,
    ConsentPhoto,
    ConsentSearchLog,
    RewardLedger,
    User,
)
from app.services.ml_service import FaceRecognitionService

CURRENT_CONSENT_VERSION = "V1.0"
CONSENT_TERMS_HASH = hashlib.sha256("Chronos Consent Terms v1.0 aggree to the terms and condition to use this service including privacy policy and data usage policy ".encode()).hexdigest()
REWARDS = {
    "search_appearance": 0.10,
    "profile_click": 0.50,
    "premium_search": 1.00,
    "enterprise_search": 5.00,
    "bonus_verification": 5.00,
}

class ConsentService:
    def __init__(self,db:AsyncSession):
        self.db = db
        self.face_service = FaceRecognitionService()

    async def grant_consent(
        self,
        user_id: str,
        display_name: str,
        bio: Optional[str] = None,
        location: Optional[str] = None,
        occupation: Optional[str] = None,
        company: Optional[str] = None,
        consent_version: str = CURRENT_CONSENT_VERSION,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        contact_email: Optional[str] = None,
        allow_direct_messages: bool = True,
        allow_email_contact: bool = False,
        allow_phone_contact: bool = False,
    ) -> ConsentProfile:
        existing = await self._get_profile_by_user(user_id)
        if existing:
            raise ConflictException("Consent already granted")
        
        consent_signature = hashlib.sha256(
            (str(user_id) + consent_version + CONSENT_TERMS_HASH + str(datetime.utcnow()))
        ).hexdigest()

        if existing:
            existing.display_name = display_name
            existing.bio = bio
            existing.location = location
            existing.occupation = occupation
            existing.company = company
            existing.consent_version = consent_version
            existing.consent_signature = consent_signature
            existing.ip_address = ip_address
            existing.user_agent = user_agent
            existing.contact_email = contact_email
            existing.allow_direct_messages = allow_direct_messages
            existing.allow_email_contact = allow_email_contact
            existing.allow_phone_contact = allow_phone_contact
            existing.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        profile = ConsentProfile(
            user_id=user_id,
            display_name=display_name,
            bio=bio,
            location=location,
            occupation=occupation,
            company=company,
            consent_version=consent_version,
            consent_signature=consent_signature,
            ip_address=ip_address,
            user_agent=user_agent,
            contact_email=contact_email,
            allow_direct_messages=allow_direct_messages,
            allow_email_contact=allow_email_contact,
            allow_phone_contact=allow_phone_contact,
            consent_given_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)

        await self._process_photos_for_profile(profile)

        return profile

    async def add_photos(
        self,
        profile_id: str,
        photo_bytes: bytes,
        photo_url: str,
        thumbnail_url: Optional[str] = None,
        is_primary: bool = False,
    ) -> ConsentPhoto:
        profile = await self._get_profile(profile_id)
        if not profile:
            raise NotFoundException(f"Profile with id {profile_id} not found")
        
        if not profile.consent_given or not profile.is_active:
            raise BadRequestException(
                message="Profile is inactive or consent revoked"
            )
        
        face_result =  self.face_service.extract_face_embedding(image_bytes=photo_bytes)
        if not face_result:
            raise BadRequestException(message="No face detected in photo")

        photo_hash = hashlib.sha256(photo_bytes).hexdigest()
        existing = await self._get_photo_by_hash(profile_id,photo_hash)
        if existing:
            raise ConflictException(message="Photo already exists")
            
        photo = ConsentPhoto(
            profile_id=profile_id,
            photo_bytes=photo_bytes,
            photo_url=photo_url,
            thumbnail_url=thumbnail_url,
            is_primary=is_primary,
            is_active=True,
            face_confidence=face_result["confidence"],
            face_quality_score=face_result["quality_score"],
            created_at=datetime.utcnow(),
        )
        self.db.add(photo)

        profile.face_count = (profile.face_count or 0) + 1
        if is_primary or profile.primary_face_embedding is None:
            profile.primary_face_embedding = face_result["embedding"]
            photo.face_thumbnail_url = thumbnail_url or photo_url
        
        embeddings = list(profile.face_embeddings or [])
        embeddings.append({"embedding": face_result.embedding.tolist(),
            "photo_id": str(photo.id),
            "quality": face_result.confidence
        })
        profile.face_embeddings = embeddings
        
        await self.db.commit()
        await self.db.refresh(photo)
        return photo
    
    async def update_social_links(
        self,
        profile_id: str,
        social_links: Dict[str, str],
    ) -> ConsentProfile:
        profile = await self._get_profile(profile_id)
        if not profile:
            raise NotFoundException(f"Profile with id {profile_id} not found")
        
        valid_links = {}
        for key,url in social_links.items():
            if url and url.startswith(("https://",'https://')):
                valid_links[key] = url
        
        profile.social_links = valid_links
        profile.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def revoke_consent(
        self,
        profile_id: str,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> bool:
        profile = await self._get_profile(profile_id)
        if not profile:
            raise NotFoundException(f"Profile with id {profile_id} not found")
        
        profile.consent_given = False
        profile.is_active = False
        profile.revoked_at = datetime.utcnow()
        profile.revocation_reason = reason
        profile.revocation_ip = ip_address
        
        profile.primary_face_embedding = None
        profile.face_embeddings = []
        profile.face_thumbnail_url = None

        for photo in profile.photos:
            photo.is_active = False
            photo.face_embedding = None
        
        await self.db.commit()
        logger.info(f"🗑️ Consent revoked: profile={profile_id}")
        return True
    
    async def search_consent_profiles(
        self,
        target_embedding: np.ndarray,
        min_similarity: float = 0.68,
        limit: int = 100,
    ) -> List[Dict[str,Any]]:
        stmt = select(ConsentProfile).where(
            and_(
                ConsentProfile.consent_given == True,
                ConsentProfile.is_active == True,
                ConsentProfile.primary_face_embedding.isnot(None),
                func.array_length(ConsentProfile.face_embeddings,1) > 0
            )
        )
        results = await self.db.execute(stmt)
        profiles = results.scalars().all()
        
        if not profiles:
            logger.info("No profiles found")
            return []
        embeddings = []
        metadata = []

        for profile in profiles:
            if profile.primary_face_embedding:
                try:
                    emb = np.array(profile.primary_face_embedding,dtype=np.float32)
                    if emb.ndim == 1 and emb.shape[0] > 0:
                        embeddings.append(emb)
                        metadata.append(profile)
                except Exception as e:
                    logger.error(f"Failed to process embedding for profile {profile.id}: {e}")
                    continue
        if not embeddings:
            return []
        similarities = self.face_service.batch_compare(
            target_embedding,embeddings
        )

        matches = []
        for i,score in enumerate(similarities):
            if score >= min_similarity:
                profile = metadata[i]
                matches.append({
                    "profile_id": str(profile.id),
                    "user_id": str(profile.user_id),
                    "display_name": profile.display_name,
                    "bio": profile.bio,
                    "location": profile.location,
                    "occupation": profile.occupation,
                    "company": profile.company,
                    "thumbnail": profile.primary_face_embedding,
                    "social_links": profile.social_links,
                    "is_verified": profile.is_verified,
                    "is_featured": profile.is_featured,
                    "similarity": score,
                    "confidence_level": self.face_service.get_confidence_level(score),
                    "allow_direct_messages": profile.allow_direct_messages,
                    "source": "consent"
                })
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        logger.info(f"Found {len(matches)} matches")
        return matches[:limit]
    
    async def log_search_appearances(
        self,
        profile_id: str,
        search_task_id: str,
        similarity: float,
        confidence_level: str,
        rank_position: int,
        searcher_id: Optional[str] = None,
        searcher_tier: str = "free",
    ) -> ConsentSearchLog:
        reward_amount = REWARDS['search_appearance']
        if searcher_tier in ['pro','ultra']:
            reward_amount = REWARDS['premium_search']
        elif searcher_tier == "enterprise":
            reward_amount = REWARDS['enterprise_search']
        log = ConsentSearchLog(
            profile_id=profile_id,
            search_task_id=search_task_id,
            similarity=similarity,
            confidence_level=confidence_level,
            rank_position=rank_position,
            searcher_id=searcher_id,
            searcher_tier=searcher_tier,
        )

        self.db.add(log)
        await self.db.flush()

        profile = await self._get_profile(profile_id)
        if profile:
            profile.search_appearances = (profile.search_appearances or 0) + 1
            profile.lifetime_searches = (profile.lifetime_searches or 0) + 1
            profile.monthly_searches = (profile.monthly_searches or 0) + 1
            profile.last_searched_at = datetime.utcnow()
            
            reward = RewardLedger(
                user_id=profile.user_id,
                profile_id=profile.id,
                amount=reward_amount,
                reward_type="search_appearance",
                status="pending",
                description=f"Search appearance #{profile.lifetime_searches}",
                search_log_id=log.id,
            )
            self.db.add(reward)
            profile.pending_earnings = float(profile.pending_earnings or 0) + reward_amount
            profile.last_rewarded_at = datetime.utcnow()
        
        await self.db.commit()
        return log
    
    async def log_profile_click(
        self,
        profile_id: str,
        searcher_id: Optional[str] = None,
    ) -> bool:
        profile = await self._get_profile(profile_id)
        if not profile:
            return False
        
        profile.profile_views = (profile.profile_views or 0) + 1
        profile.click_throughs = (profile.click_throughs or 0) + 1
        
        reward_amount = REWARDS["profile_click"]
        reward = RewardLedger(
            user_id=profile.user_id,
            profile_id=profile.id,
            amount=reward_amount,
            reward_type="profile_click",
            status="pending",
            description="Profile click reward",
        )
        self.db.add(reward)
        
        profile.pending_earnings = float(profile.pending_earnings or 0) + reward_amount
        
        await self.db.commit()
        return True
    
    async def get_profile_stats(self, profile_id: str) -> Dict[str, Any]:
        profile = await self._get_profile(profile_id)
        if not profile:
            raise NotFoundException(message="Profile not found")
        
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        stmt = select(func.count(ConsentSearchLog.id)).where(
            and_(
                ConsentSearchLog.profile_id == profile_id,
                ConsentSearchLog.created_at >= thirty_days_ago,
            )
        )
        result = await self.db.execute(stmt)
        recent_searches = result.scalar() or 0
        
        return {
            "profile_id": str(profile.id),
            "is_active": profile.is_active,
            "is_verified": profile.is_verified,
            "face_count": profile.face_count or 0,
            "total_searches": profile.lifetime_searches or 0,
            "searches_last_30_days": recent_searches,
            "profile_views": profile.profile_views or 0,
            "click_throughs": profile.click_throughs or 0,
            "total_earnings": float(profile.total_earnings or 0),
            "pending_earnings": float(profile.pending_earnings or 0),
            "member_since": profile.created_at.isoformat() if profile.created_at else None,
            "last_searched_at": profile.last_searched_at.isoformat() if profile.last_searched_at else None,
        }
    
    async def get_user_consent_status(self, user_id: str) -> Dict[str, Any]:
        profile = await self._get_profile_by_user(user_id)
        
        if not profile:
            return {
                "has_profile": False,
                "consent_given": False,
                "is_active": False,
                "face_count": 0,
                "profile": None,
            }
        
        return {
            "has_profile": True,
            "consent_given": profile.consent_given,
            "is_active": profile.is_active,
            "face_count": profile.face_count or 0,
            "profile": profile,
        }
    
    async def _get_profile(self, profile_id: str) -> Optional[ConsentProfile]:
        stmt = select(ConsentProfile).where(ConsentProfile.id == profile_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _get_profile_by_user(self, user_id: str) -> Optional[ConsentProfile]:
        stmt = select(ConsentProfile).where(ConsentProfile.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _get_photo_by_hash(
        self,
        profile_id: str,
        photo_hash: str,
    ) -> Optional[ConsentPhoto]:
        stmt = select(ConsentPhoto).where(
            and_(
                ConsentPhoto.profile_id == profile_id,
                ConsentPhoto.photo_hash == photo_hash,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    def _confidence_level(self, similarity: float) -> str:
        if similarity >= 0.85:
            return "high"
        if similarity >= 0.70:
            return "medium"
        if similarity >= 0.55:
            return "low"
        return "negative"