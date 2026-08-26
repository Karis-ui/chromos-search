from fastapi import APIRouter, Depends, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.v1.deps import get_current_active_user, get_db_session
from app.models.domain import User, UserFeedback, SearchResult
from app.core.logger import logger
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/feedback", tags=["Feedback"])

from pydantic import BaseModel,Field
from typing import Optional

class FeedbackCreate(BaseModel):
    is_match :bool
    confidence_correct: Optional[bool] = None
    actual_similarity: Optional[float] = Field(None, ge=0, le=1)
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = Field(None, max_length=1000)
    feedback_category: Optional[str] = None
    feedback_tags: Optional[List[str]] = []

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    result_id: str
    is_match: bool
    rating: Optional[int]
    feedback_text: Optional[str]
    feedback_category: Optional[str]
    created_at: str

@router.post("/{result_id}",status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    result_id: str,
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str,Any]:
    stmt = select(SearchResult).where(SearchResult.id == result_id)
    result = await db.execute(stmt)
    search_result = result.scalar_one_or_none()
    if not search_result:
        raise NotFoundException(
            message=f"Search result {result_id} not found"
        )
        
    stmt = select(UserFeedback).where(
        UserFeedback.result_id == result_id,
        UserFeedback.user_id == current_user.id
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.is_match = feedback.is_match
        existing.confidence_correct = feedback.confidence_correct
        existing.actual_similarity = feedback.actual_similarity
        existing.rating = feedback.rating
        existing.feedback_text = feedback.feedback_text
        existing.feedback_category = feedback.feedback_category
        existing.feedback_tags = feedback.feedback_tags
        existing.updated_at = datetime.utcnow()
    else:
        new_feedback = UserFeedback(
            user_id=current_user.id,
            result_id=result_id,
            is_match=feedback.is_match,
            confidence_correct=feedback.confidence_correct,
            actual_similarity=feedback.actual_similarity,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            feedback_category=feedback.feedback_category,
            feedback_tags=feedback.feedback_tags or [],
        )
        db.add(new_feedback)
    search_result.user_clicked = True
    search_result.user_clicked_at = datetime.utcnow()
    search_result.user_feedback_score = feedback.rating or 0
    
    await db.commit()
    logger.info(f"Feedback submitted for result {result_id} by user {current_user.id}")
    return {
        "message": "Feedback submitted successfully",
        "result_id": result_id,
        "is_match": feedback.is_match,
    }
    
@router.get("/my",response_model=List[FeedbackResponse])
async def get_my_feedback(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> List[FeedbackResponse]:
    stmt = select(UserFeedback).where(
        UserFeedback.user_id == current_user.id
    ).order_by(desc(UserFeedback.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    feedbacks = result.scalars().all()
    return [
        FeedbackResponse(
            id=str(f.id),
            user_id=str(f.user_id),
            result_id=str(f.result_id),
            is_match=f.is_match,
            rating=f.rating,
            feedback_text=f.feedback_text,
            feedback_category=f.feedback_category,
            created_at=f.created_at.isoformat(),
        )
        for f in feedbacks
    ]

@router.get("/stats")
async def get_feedback_users(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str,Any]:
    total = await db.scalar(
        select(func.count()).select_from(UserFeedback).where(UserFeedback.user_id == current_user.id)
    )
    matches = await db.scalar9
    select(func.count()).select_from(UserFeedback).where(
        UserFeedback.user_id == current_user.id,UserFeedback.is_match == True
    )
    avg_rating = await db.scalar(
        select(func.avg(UserFeedback.rating)).where(
            UserFeedback.user_id == current_user.id,UserFeedback.is_match == True
        )
    )
    return {
        "total_feedback": total or 0,
        "match_count": matches or 0,
        "match_rate": (matches / total * 100) if total and total > 0 else 0,
        "average_rating": float(avg_rating) if avg_rating else 0,
        "categories": {
            "face_quality": await db.scalar(
                select(func.count()).select_from(UserFeedback)
                .where(
                    UserFeedback.user_id == current_user.id,
                    UserFeedback.feedback_category == "face_quality"
                )
            ) or 0,
            "wrong_person": await db.scalar(
                select(func.count()).select_from(UserFeedback)
                .where(
                    UserFeedback.user_id == current_user.id,
                    UserFeedback.feedback_category == "wrong_person"
                )
            ) or 0,
        }
    }