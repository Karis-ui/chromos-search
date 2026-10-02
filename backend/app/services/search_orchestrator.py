import asyncio
import time
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, text

from app.core.logger import logger, log_search, log_performance
from app.models.domain import SocialPost, SearchResult, SearchHistory, SearchStatus
from app.services.ml_service import FaceRecognitionService, VoiceRecognitionService, HybridMatchingService
from app.services.social_crawler import SocialCrawlerService
from app.core.redis_client import CacheService
from app.core.exceptions import SearchException, MLException
from app.services.consent_service import ConsentService

class SearchOrchestrator:
    def __init__(
        self,
        db: AsyncSession,
        cache: CacheService,
        face_service: FaceRecognitionService,
        voice_service: VoiceRecognitionService,
        crawler: SocialCrawlerService,
    ):
        self.db = db
        self.cache = cache
        self.face_service = face_service
        self.voice_service = voice_service
        self.hybrid_service = HybridMatchingService()
        self.crawler = crawler
    
    @log_performance(threshold_ms=5000)
    async def execute_search(
        self,
        task_id: str,
        face_embedding: Optional[np.ndarray],
        voice_embedding: Optional[np.ndarray],
        biometric_type: str,
        time_range_days: int,
        platforms: List[str],
        min_confidence: float = 0.68,
        user_id: Optional[str] = None,
        progress_callback: Optional[callable] = None,
    ) -> Dict[str, Any]: 
        start_time = time.time()
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=time_range_days)
            await self._update_progress(progress_callback,10,"Calculating time window....")
            consent_searches = []
            if face_embedding is not None and biometric_type in ['face','hybrid']:
                try:
                    await self._update_progress(progress_callback,10,"Searching consent profiles...")
                    consent_service = ConsentService(self.db)
                    consent_matches = await consent_service.search_consent_profiles(
                        target_embedding=face_embedding,min_similarity=min_confidence,limit=100
                    )
                    logger.info(f"🟢 Found {len(consent_matches)} consent matches")
                    for idx,match in enumerate(consent_matches):
                        try:
                            await consent_service.log_search_appearances(
                                profile_id=match["profile_id"],
                            search_task_id=task_id,
                            similarity=match["similarity"],
                            confidence_level=match["confidence_level"],
                            rank_position=idx + 1,
                            searcher_id=user_id,
                            searcher_tier="free",
                            )
                        except Exception as e:
                            logger.warning(f"Failed to log consent appearance:")

                except Exception as e:
                    logger.error(f"Consent search failed: {str(e)}")
                    consent_matches = []
            
            await self._update_progress(progress_callback,20,"Searching public profiles...")
            posts = await self.crawler.fetch_platform_posts(
                platforms=platforms,
                since_date=cutoff_date,
                limit=1000,
                target_embedding=face_embedding,
                progress_callback=progress_callback,
            )
        
            total_scanned = len(posts)
            logger.info(f"📊 Fetched {total_scanned} social posts")
        
            await self._update_progress(
                progress_callback,
                45,
                f"Analyzing {total_scanned} social posts...",
            )
            posts_with_emb = [p for p in posts if p.face_embedding is not None]
        
            social_matches = []
            if posts_with_emb and face_embedding is not None:
                await self._update_progress(progress_callback, 60, "Comparing biometrics...")
            
            social_matches = await self._perform_matching(
                target_face=face_embedding,
                target_voice=voice_embedding,
                posts=posts_with_emb,
                min_confidence=min_confidence,
                biometric_type=biometric_type,
            )
            
            logger.info(f"🔵 Found {len(social_matches)} social matches")
            await self._update_progress(progress_callback, 80, "Ranking results...")
            
            unified_consent = [
                {
                    "source": "consent",
                    "profile_id": m["profile_id"],
                    "user_id": m["user_id"],
                    "display_name": m["display_name"],
                    "bio": m.get("bio"),
                    "location": m.get("location"),
                    "occupation": m.get("occupation"),
                    "company": m.get("company"),
                    "thumbnail": m.get("thumbnail"),
                    "social_links": m.get("social_links", {}),
                    "is_verified": m.get("is_verified", False),
                    "is_featured": m.get("is_featured", False),
                    "allow_direct_messages": m.get("allow_direct_messages", True),
                    "similarity": m["similarity"],
                    "confidence_level": m["confidence_level"],
                    "face_score": m["similarity"],
                    "voice_score": 0.0,
                    "match_type": "face",
                }
                for m in consent_matches
            ]
            
            unified_social = []
            for m in social_matches:
                post = m["post"]
                unified_social.append({
                    "source": "social",
                    "post_id": str(post.id),
                    "platform": post.platform.value if hasattr(post.platform, 'value') else str(post.platform),
                    "url": post.platform_url,
                    "thumbnail": post.thumbnail_url or post.media_url,
                    "posted_at": post.posted_at.isoformat() if post.posted_at else None,
                    "caption": post.caption,
                    "author_username": post.author_username,
                    "author_full_name": post.author_full_name,
                    "likes": post.likes or 0,
                    "shares": post.shares or 0,
                    "comments": post.comments or 0,
                    "location": post.location,
                    "similarity": m["similarity"],
                    "confidence_level": self._get_confidence_level(m["similarity"]),
                    "face_score": m.get("face_score", 0),
                    "voice_score": m.get("voice_score", 0),
                    "match_type": m.get("match_type", "face"),
                })
        
                all_matches = unified_consent + unified_social
        
            for match in all_matches:
                source_boost = 1.1 if match["source"] == "consent" else 1.0
                match["final_score"] = match["similarity"] * source_boost
        
            all_matches.sort(key=lambda x: x["final_score"], reverse=True)
        
            for idx, match in enumerate(all_matches):
                match["rank"] = idx + 1
        
            await self._update_progress(progress_callback, 90, "Saving results...")
        
            if social_matches:
                await self._store_results(task_id, social_matches, user_id)
        
            await self._update_search_history(
                task_id=task_id,
                status=SearchStatus.COMPLETED,
                results_count=len(all_matches),
                top_confidence=all_matches[0]["similarity"] if all_matches else 0,
                duration_ms=(time.time() - start_time) * 1000,
            )
        
            await self._update_progress(
                progress_callback,
                100,
                f"Found {len(all_matches)} matches ({len(consent_matches)} consent, {len(social_matches)} social)",
            )
        
            log_search(
                task_id=task_id,
                user_id=user_id or "anonymous",
                platforms=platforms,
                time_range_days=time_range_days,
                results_count=len(all_matches),
                duration_ms=(time.time() - start_time) * 1000,
                status="completed",
            )
        
            return {
                "status": "completed",
                "matches": all_matches[:200],  # Top 200
                "consent_count": len(consent_matches),
                "social_count": len(social_matches),
                "total_count": len(all_matches),
                "total_scanned": total_scanned,
                "duration_ms": (time.time() - start_time) * 1000,
            }
        
        except Exception as e:
            logger.error(f"Search failed: {str(e)}", exc_info=True)
            await self._update_search_history(
                task_id=task_id,
                status=SearchStatus.FAILED,
                error_message=str(e),
            )
            raise SearchException(message=f"Search failed: {str(e)}")
                          
    async def _extract_post_embeddings(
        self,
        posts: List[SocialPost],
        biometric_type: str,
        progress_callback: Optional[callable] = None,
    ) -> List[Dict[str,Any]]:
        results = []
        batch_size = 50
        for i in range(0,len(posts),batch_size):
            batch = posts[i:i + batch_size]
            progress = 50 + (i / len(posts)) * 20
            await self._update_progress(
                progress_callback,progress,f"Processing batch {i//batch_size + 1}/{(len(posts)-1)//batch_size + 1}"
            )
            tasks = []
            for post in batch:
                if biometric_type in ("face", "hybrid"):
                    tasks.append(self._extract_face_from_post(post))
                if biometric_type in ("voice", "hybrid"):
                    tasks.append(self._extract_voice_from_post(post))
            batch_results = await asyncio.gather(*tasks)
            for post,result in zip(batch,batch_results):
                if result:
                    results.append({
                        "post":post,
                        "embedding":result
                    })
        return results
    
    async def _extract_face_from_post(self, post: SocialPost) -> Optional[np.ndarray]:
        if post.face_embedding:
            return np.array(post.face_embedding)
        \
        try:
            if post.media_url:
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.get(post.media_url, timeout=30)
                    if response.status_code == 200:
                        face_result = self.face_service.extract_face_embedding(
                            response.content
                        )
                        if face_result:
                            return face_result.embedding
        except Exception as e:
            logger.debug(f"Face extraction failed for post {post.id}: {str(e)}")
        
        return None
    
    async def _extract_voice_from_post(self, post: SocialPost) -> Optional[np.ndarray]:
        if post.voice_embedding:
            return np.array(post.voice_embedding)
        
        try:
            if post.media_url:
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.get(post.media_url, timeout=30)
                    if response.status_code == 200:
                        voice_result = await self.voice_service.extract_voice_embedding(
                            response.content
                        )
                        if voice_result:
                            return voice_result.embedding
        except Exception as e:
            logger.debug(f"Face extraction failed for post {post.id}: {str(e)}")
        return None
    
    async def _perform_matching(
        self,
        target_face: Optional[np.ndarray],
        target_voice: Optional[np.ndarray],
        posts: List[Dict[str, Any]],
        min_confidence: float,
        biometric_type: str,
    ) -> List[Dict[str, Any]]:
        matches = []
        
        if not posts:
            return matches
        
        embeddings = [p["embedding"] for p in posts]
        posts_data = [p["post"] for p in posts]
        
        face_matches = []
        if target_face is not None and biometric_type in ["face", "hybrid"]:
            face_scores = self.face_service.batch_compare(target_face, embeddings)
            
            for i, score in enumerate(face_scores):
                if score >= min_confidence:
                    face_matches.append({
                        "post": posts_data[i],
                        "similarity": score,
                        "type": "face",
                        "original_index": i,
                    })
        
        voice_matches = []
        if target_voice is not None and biometric_type in ["voice", "hybrid"]:
            voice_scores = self.voice_service.batch_compare(target_voice, embeddings)
            
            for i, score in enumerate(voice_scores):
                if score >= min_confidence:
                    voice_matches.append({
                        "post": posts_data[i],
                        "similarity": score,
                        "type": "voice",
                        "original_index": i,
                    })
        
        combined = {}
        
        for match in face_matches:
            idx = match["original_index"]
            if idx not in combined:
                combined[idx] = {
                    "post": match["post"],
                    "face_score": match["similarity"],
                    "voice_score": 0.0,
                    "type": "face",
                }
            else:
                combined[idx]["face_score"] = match["similarity"]
        
        for match in voice_matches:
            idx = match["original_index"]
            if idx not in combined:
                combined[idx] = {
                    "post": match["post"],
                    "face_score": 0.0,
                    "voice_score": match["similarity"],
                    "type": "voice",
                }
            else:
                combined[idx]["voice_score"] = match["similarity"]
        
        for idx, data in combined.items():
            face_weight = 0.7 if data["type"] == "face" else 0.5
            voice_weight = 0.7 if data["type"] == "voice" else 0.5
            
            if data["type"] == "hybrid":
                total_weight = face_weight + voice_weight
                final_score = (
                    data["face_score"] * face_weight +
                    data["voice_score"] * voice_weight
                ) / total_weight
            else:
                final_score = max(data["face_score"], data["voice_score"])
            
            data["similarity"] = float(final_score)
            data["confidence"] = float(final_score)
        
        result = [
            {
                "post": data["post"],
                "similarity": data["similarity"],
                "confidence": data["confidence"],
                "face_score": data.get("face_score", 0),
                "voice_score": data.get("voice_score", 0),
                "match_type": data["type"],
            }
            for data in combined.values()
            if data["similarity"] >= min_confidence
        ]
        
        result.sort(key=lambda x: x["similarity"], reverse=True)
        
        return result
    
    def _rank_results(self,matches: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
        now = datetime.utcnow()
        for match in matches:
            post = match["post"]
            similarity = match['similarity']
            if post.posted_at:
                days_ago = (now - post.posted_at).days
                recency_score = max(0,1 - (days_ago /100))
            else:
                recency_score = 0.5
            
            engagement =post.likes + post.shares + post.comments
            engagement_score = min(1,engagement / 10000)
            platform_weights = {
                "instagram": 1.0,
                "facebook": 0.9,
                "twitter": 0.9,
                "tiktok": 1.0,
                "youtube": 0.8,
                "linkedin": 0.7,
                "reddit": 0.6,
                "telegram": 0.5,
            }
            platform_score = platform_weights.get(post.platform.value,0.5)
            final_score = (
                similarity * 0.5 +
                recency_score * 0.2 +
                engagement_score * 0.15 +
                platform_score * 0.15
            )
            match["final_score"] = final_score
            match["recency_score"] = recency_score
            match["engagement_score"] = engagement_score
            match["platform_score"] = platform_score
            match["confidence_level"] = self._get_confidence_level(similarity)
        matches.sort(key=lambda x: x["final_score"],reverse=True)
        for i, match in enumerate(matches):
            match["rank"] = i + 1
        return matches
    
    def _get_confidence_level(self,similarity: float) ->str:
        if similarity >= 0.85:
            return "High"
        elif similarity >= 0.70:
            return "Medium"
        elif similarity >= 0.55:
            return "Low"
        else:
            return "Negative"
    
    async def _store_results(
        self,
        task_id: str,
        matches: List[Dict[str, Any]],
        user_id: Optional[str] = None,
    ):
        for i, match in enumerate(matches[:500]):
            result = SearchResult(
                task_id=task_id,
                post_id=match["post"].id,
                similarity_score=match["similarity"],
                confidence_score=match["confidence"],
                confidence_level=match.get("confidence_level", "unknown"),
                method_used=match.get("match_type", "unknown"),
                face_match_score=match.get("face_score"),
                voice_match_score=match.get("voice_score"),
                rank_position=match.get("rank", i + 1),
                metadata_snapshot={
                    "recency_score": match.get("recency_score"),
                    "engagement_score": match.get("engagement_score"),
                    "platform_score": match.get("platform_score"),
                    "final_score": match.get("final_score"),
                },
            )
            self.db.add(result)
        await self.db.commit()
    
    async def _update_search_history(
        self,
        task_id: str,
        status: SearchStatus,
        results_count: int = 0,
        top_confidence: float = 0,
        duration_ms: float = 0,
        error_message: Optional[str] = None,
    ):
        stmt = select(SearchHistory).where(SearchHistory.task_id == task_id)
        result = await self.db.execute(stmt)
        history = result.scalar_one_or_none()
        if history:
            history.status = status
            history.results_count = results_count
            history.top_confidence = top_confidence
            history.duration_ms = int(duration_ms)
            history.completed_at = datetime.utcnow()
            
            if error_message:
                history.error_message = error_message
            await self.db.commit()
            
    
    async def _update_progress(
        self,
        callback:Optional[callable],
        progress:int,
        message:str
    ):
        if callback:
            try:
                await callback(progress,message)
            except Exception as e:
                logger.warning(f"Progress callback failed: {str(e)}")