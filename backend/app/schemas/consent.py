from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ConsentProfileResponse(BaseModel):
    id: str
    user_id: str
    display_name: str
    bio: Optional[str]
    location: Optional[str]
    occupation: Optional[str]
    company: Optional[str]
    
    consent_given: bool
    consent_version: str
    consent_given_at: Optional[str]
    is_active: bool
    is_verified: bool
    is_featured: bool
    
    face_count: int
    face_thumbnail_url: Optional[str]
    
    social_links: Dict[str, str]
    
    contact_email: Optional[str]
    allow_direct_messages: bool
    allow_email_contact: bool
    allow_phone_contact: bool
    
    profile_views: int
    search_appearances: int
    click_throughs: int
    lifetime_searches: int
    monthly_searches: int
    
    total_earnings: float
    pending_earnings: float
    
    created_at: str
    updated_at: str
    last_searched_at: Optional[str]
    revoked_at: Optional[str]
    
    class Config:
        from_attributes = True


class ConsentPhotoResponse(BaseModel):
    id: str
    photo_url: str
    thumbnail_url: Optional[str]
    is_primary: bool
    is_active: bool
    face_confidence: Optional[float]
    face_quality_score: Optional[float]
    created_at: str
    
    class Config:
        from_attributes = True

class ConsentStatsResponse(BaseModel):
    profile_id: str
    is_active: bool
    is_verified: bool
    face_count: int
    total_searches: int
    searches_last_30_days: int
    profile_views: int
    click_throughs: int
    total_earnings: float
    pending_earnings: float
    member_since: Optional[str]
    last_searched_at: Optional[str]

class ConsentSearchResult(BaseModel):
    profile_id: str
    user_id: str
    display_name: str
    bio: Optional[str]
    location: Optional[str]
    occupation: Optional[str]
    company: Optional[str]
    thumbnail: Optional[str]
    social_links: Dict[str, str]
    is_verified: bool
    is_featured: bool
    similarity: float
    confidence_level: str
    allow_direct_messages: bool
    source: str = "consent"

class ConsentSearchResponse(BaseModel):
    status: str
    total: int
    matches: List[ConsentSearchResult]
    duration_ms: float

class ConsentStatusResponse(BaseModel):
    """Quick consent status check"""
    has_profile: bool
    consent_given: bool
    is_active: bool
    face_count: int
    profile: Optional[ConsentProfileResponse] = None