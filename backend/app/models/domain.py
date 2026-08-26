from sqlalchemy import (
    Column, String, DateTime, Float, Integer, JSON, 
    Text, Boolean, BigInteger, ForeignKey, UniqueConstraint,
    Index, Enum as SQLAlchemyEnum, ARRAY, Numeric, CheckConstraint,
    Table, ForeignKeyConstraint
)
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR, JSONB, ARRAY as PG_ARRAY
from sqlalchemy.sql import func, text
from sqlalchemy.orm import relationship, validates, backref
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, timedelta
import uuid
import enum
import json
from typing import Optional, List, Dict, Any

from app.core.database import Base
from app.core.logger import logger

class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    VOICE = "voice"
    TEXT = "text"
    GIF = "gif"
    STORY = "story"
    REEL = "reel"
    LIVESTREAM = "livestream"
    POLL = "poll"
    ARTICLE = "article"

class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    TIKTOK = "tiktok"
    TELEGRAM = "telegram"
    REDDIT = "reddit"
    YOUTUBE = "youtube"
    SNAPCHAT = "snapchat"
    LINKEDIN = "linkedin"
    PINTEREST = "pinterest"
    DISCORD = "discord"
    WHATSAPP = "whatsapp"

class SearchStatus(str, enum.Enum):
    PENDING = "pending"
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class ConfidenceLevel(str, enum.Enum):
    HIGH = "high"      
    MEDIUM = "medium"    
    LOW = "low"          
    NEGATIVE = "negative"  
    UNKNOWN = "unknown"

class UserRole(str, enum.Enum):
    USER = "user"
    PREMIUM = "premium"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    SYSTEM = "system"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class NotificationType(str, enum.Enum):
    SEARCH_COMPLETE = "search_complete"
    NEW_MATCH = "new_match"
    SYSTEM_ALERT = "system_alert"
    PREMIUM_EXPIRY = "premium_expiry"
    FEEDBACK_REQUEST = "feedback_request"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    salt = Column(String(64))
    
    full_name = Column(String(255))
    avatar_url = Column(Text)
    bio = Column(Text)
    phone_number = Column(String(20))
    
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False, index=True)
    verification_token = Column(String(255))
    verification_token_expires = Column(DateTime(timezone=True))
    
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, index=True)
    permissions = Column(JSONB, default=list)
    
    is_premium = Column(Boolean, default=False, index=True)
    premium_until = Column(DateTime(timezone=True))
    premium_features = Column(JSONB, default=dict)
    
    rate_limit_override = Column(Integer)
    daily_search_limit = Column(Integer, default=50)
    searches_today = Column(Integer, default=0)
    last_search_reset = Column(DateTime(timezone=True), default=func.now())
    
    preferences = Column(JSONB, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))
    last_seen_at = Column(DateTime(timezone=True))
    deleted_at = Column(DateTime(timezone=True))
    
    search_history = relationship("SearchHistory", back_populates="user", lazy="dynamic")
    api_keys = relationship("ApiKey", back_populates="user", lazy="dynamic")
    feedbacks = relationship("UserFeedback", back_populates="user", lazy="dynamic")
    notifications = relationship("Notification", back_populates="user", lazy="dynamic")
    
    @validates('email')
    def validate_email(self, key, value):
        if value and '@' not in value:
            raise ValueError(f"Invalid email: {value}")
        return value.lower()
    
    @validates('username')
    def validate_username(self, key, value):
        if value and not value.replace('_', '').isalnum():
            raise ValueError(f"Invalid username: {value}")
        return value
    
    @hybrid_property
    def is_admin(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    @hybrid_property
    def is_premium_active(self) -> bool:
        if not self.is_premium:
            return False
        if self.premium_until and self.premium_until < datetime.utcnow():
            return False
        return True
    
    @hybrid_property
    def searches_remaining_today(self) -> int:
        if self.last_search_reset:
            now = datetime.utcnow()
            if self.last_search_reset.date() < now.date():
                self.searches_today = 0
                self.last_search_reset = now
        return max(0, self.daily_search_limit - self.searches_today)
    
    __table_args__ = (
        Index('idx_users_email_active', 'email', 'is_active'),
        Index('idx_users_username_active', 'username', 'is_active'),
        Index('idx_users_role_active', 'role', 'is_active'),
        Index('idx_users_premium_active', 'is_premium', 'premium_until'),
        CheckConstraint('searches_today >= 0', name='check_searches_nonnegative'),
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    key = Column(String(64), unique=True, nullable=False, index=True)
    key_hash = Column(String(64), nullable=False, index=True)  # For secure lookup
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    scopes = Column(JSONB, default=list)
    
    rate_limit = Column(Integer, default=100)
    calls_today = Column(Integer, default=0)
    last_call_reset = Column(DateTime(timezone=True), default=func.now())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    last_used_at = Column(DateTime(timezone=True))
    
    is_active = Column(Boolean, default=True, index=True)
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime(timezone=True))
    revoked_reason = Column(Text)
    
    user = relationship("User", back_populates="api_keys")
    
    @hybrid_property
    def is_expired(self) -> bool:
        if self.expires_at:
            return self.expires_at < datetime.utcnow()
        return False
    
    @hybrid_property
    def calls_remaining_today(self) -> int:
        if self.last_call_reset:
            now = datetime.utcnow()
            if self.last_call_reset.date() < now.date():
                self.calls_today = 0
                self.last_call_reset = now
        return max(0, self.rate_limit - self.calls_today)
    
    __table_args__ = (
        Index('idx_apikeys_user_active', 'user_id', 'is_active'),
        Index('idx_apikeys_key_hash', 'key_hash'),
        Index('idx_apikeys_expires_at', 'expires_at'),
    )
    
    def __repr__(self) -> str:
        return f"<ApiKey {self.name} for user {self.user_id}>"

class SocialPost(Base):
    __tablename__ = "social_posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    platform = Column(SQLAlchemyEnum(Platform), nullable=False, index=True)
    external_id = Column(String(255), nullable=False)
    platform_url = Column(Text, nullable=False)
    
    posted_at = Column(DateTime(timezone=True), nullable=False, index=True)
    crawled_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    indexed_at = Column(DateTime(timezone=True))
    
    media_type = Column(SQLAlchemyEnum(MediaType), nullable=False)
    media_url = Column(Text)
    thumbnail_url = Column(Text)
    content = Column(Text)
    caption = Column(Text)
    hashtags = Column(JSONB, default=list)
    mentions = Column(JSONB, default=list)
    language = Column(String(10))
    content_length = Column(Integer)
    
    face_embedding = Column(JSONB)
    face_embeddings_multiple = Column(JSONB)
    face_detection_count = Column(Integer, default=0)
    voice_embedding = Column(JSONB)
    voice_duration = Column(Float)
    
    author_username = Column(String(255), index=True)
    author_full_name = Column(String(255))
    author_id = Column(String(255), index=True)
    author_profile_url = Column(Text)
    author_follower_count = Column(BigInteger)
    author_verified = Column(Boolean, default=False)
    
    likes = Column(BigInteger, default=0)
    shares = Column(BigInteger, default=0)
    comments = Column(BigInteger, default=0)
    views = Column(BigInteger, default=0)
    engagement_rate = Column(Numeric(10, 4))
    
    location = Column(JSONB)
    location_geo = Column(String(255))
    location_place_id = Column(String(255))
    
    parent_post_id = Column(UUID(as_uuid=True), ForeignKey("social_posts.id"))
    replies = relationship("SocialPost", remote_side=[id], backref="parent")
    
    search_vector = Column(TSVECTOR)
    keyword_weights = Column(JSONB)
    
    is_active = Column(Boolean, default=True, index=True)
    archived_at = Column(DateTime(timezone=True))
    deleted_at = Column(DateTime(timezone=True))
    
    metadata_json = Column(JSONB)
    verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True))
    verified_at = Column(DateTime(timezone=True))
    
    search_results = relationship("SearchResult", back_populates="post", lazy="dynamic")
    
    @hybrid_property
    def age_days(self) -> int:
        if self.posted_at:
            return (datetime.utcnow() - self.posted_at).days
        return 0
    
    @hybrid_property
    def is_recent(self) -> bool:
        return self.age_days <= 180 and self.is_active
    
    @hybrid_property
    def has_face(self) -> bool:
        return self.face_embedding is not None or self.face_embeddings_multiple is not None
    
    @hybrid_property
    def has_voice(self) -> bool:
        return self.voice_embedding is not None
    
    __table_args__ = (
        Index('idx_posts_platform_date', 'platform', 'posted_at', postgresql_using='brin'),
        Index('idx_posts_active_date', 'posted_at', postgresql_where=(is_active == True)),
        Index('idx_posts_author_date', 'author_id', 'posted_at'),
        Index('idx_posts_face_embedding', 'face_embedding', postgresql_using='ivfflat'),
        Index('idx_posts_search_vector', 'search_vector', postgresql_using='gin'),
        Index('idx_posts_hashtags', 'hashtags', postgresql_using='gin'),
        Index('idx_posts_location_geo', 'location_geo'),
        UniqueConstraint('platform', 'external_id', name='uq_post_platform_external'),
    )
    
    def __repr__(self) -> str:
        return f"<SocialPost {self.platform.value}:{self.external_id}>"

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(255), unique=True, nullable=False, index=True)
    
    query_media_url = Column(Text)
    query_media_hash = Column(String(64))
    query_media_type = Column(SQLAlchemyEnum(MediaType))
    query_text = Column(Text)  # For text-based searches
    time_range_days = Column(Integer, default=180)
    platforms = Column(JSONB, default=list)
    biometric_type = Column(String(50)) 
    match_threshold = Column(Float, default=0.68)
    max_results = Column(Integer, default=1000)
    model_version = Column(String(50))
    
    status = Column(SQLAlchemyEnum(SearchStatus), default=SearchStatus.PENDING, index=True)
    results_count = Column(Integer, default=0)
    top_confidence = Column(Float)
    avg_confidence = Column(Float)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True))
    duration_ms = Column(Integer)
    
    ip_address = Column(String(45))
    user_agent = Column(Text)
    client_type = Column(String(50))
    
    api_calls_made = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    estimated_cost = Column(Numeric(10, 6))
    
    error_message = Column(Text)
    error_code = Column(String(50))
    error_stack = Column(Text)
    
    user = relationship("User", back_populates="search_history")
    results = relationship("SearchResult", back_populates="search_history", lazy="dynamic")
    
    __table_args__ = (
        Index('idx_search_user_date', 'user_id', 'started_at DESC'),
        Index('idx_search_task_status', 'task_id', 'status'),
        Index('idx_search_status_created', 'status', 'started_at'),
    )
    
    def __repr__(self) -> str:
        return f"<SearchHistory {self.task_id} ({self.status.value})>"

class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(255), ForeignKey("search_history.task_id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey("social_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    similarity_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    confidence_level = Column(SQLAlchemyEnum(ConfidenceLevel), default=ConfidenceLevel.UNKNOWN)
    
    method_used = Column(String(50))
    face_match_score = Column(Float)
    voice_match_score = Column(Float)
    text_match_score = Column(Float)
    combined_score = Column(Float)
    
    rank_position = Column(Integer)
    rank_bucket = Column(String(20))  
    metadata_snapshot = Column(JSONB)
    
    user_clicked = Column(Boolean, default=False)
    user_clicked_at = Column(DateTime(timezone=True))
    user_flagged = Column(Boolean, default=False)
    user_flagged_at = Column(DateTime(timezone=True))
    user_feedback_score = Column(Integer, default=0) 
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    search_history = relationship("SearchHistory", back_populates="results")
    post = relationship("SocialPost", back_populates="search_results")
    feedbacks = relationship("UserFeedback", back_populates="search_result", lazy="dynamic")
    
    __table_args__ = (
        Index('idx_result_task_score', 'task_id', 'similarity_score DESC'),
        Index('idx_result_post_task', 'post_id', 'task_id'),
        Index('idx_result_confidence', 'confidence_score', 'confidence_level'),
        Index('idx_result_created', 'created_at'),
    )
    
    def __repr__(self) -> str:
        return f"<SearchResult {self.id} score={self.similarity_score:.3f}>"

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    result_id = Column(UUID(as_uuid=True), ForeignKey("search_results.id", ondelete="CASCADE"), nullable=False, index=True)
    
    is_match = Column(Boolean, nullable=False)
    confidence_correct = Column(Boolean)
    actual_similarity = Column(Float)
    rating = Column(Integer) 
    feedback_text = Column(Text)
    feedback_category = Column(String(50))
    feedback_tags = Column(JSONB, default=list)
    
    used_for_training = Column(Boolean, default=False)
    training_timestamp = Column(DateTime(timezone=True))
    training_version = Column(String(50))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user_agent = Column(Text)
    ip_address = Column(String(45))
    
    user = relationship("User", back_populates="feedbacks")
    search_result = relationship("SearchResult", back_populates="feedbacks")
    
    __table_args__ = (
        Index('idx_feedback_user_created', 'user_id', 'created_at'),
        Index('idx_feedback_result', 'result_id'),
        Index('idx_feedback_match', 'is_match'),
        Index('idx_feedback_training', 'used_for_training', 'training_version'),
    )
    
    def __repr__(self) -> str:
        return f"<UserFeedback {self.id} match={self.is_match}>"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    type = Column(SQLAlchemyEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSONB)
    
    is_read = Column(Boolean, default=False, index=True)
    is_sent = Column(Boolean, default=False)
    is_delivered = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    read_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="notifications")
    
    __table_args__ = (
        Index('idx_notifications_user_read', 'user_id', 'is_read'),
        Index('idx_notifications_created', 'created_at'),
    )
    
    def __repr__(self) -> str:
        return f"<Notification {self.type.value} for {self.user_id}>"

__all__ = [
    "MediaType",
    "Platform", 
    "SearchStatus",
    "ConfidenceLevel",
    "UserRole",
    "VerificationStatus",
    "NotificationType",
    "User",
    "ApiKey",
    "SocialPost",
    "SearchHistory",
    "SearchResult",
    "UserFeedback",
    "Notification",
]