import asyncio
import time
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, text

from app.core.logger import logger, log_search, log_performance
from app.core.cache import cached
from app.models.domain import SocialPost, SearchResult, SearchHistory, SearchStatus
from app.services.ml_service import FaceRecognitionService, VoiceRecognitionService, HybridMatchingService
from app.services.social_crawler import SocialCrawlerService
from app.core.redis_client import CacheService
from app.core.exceptions import SearchException, MLException

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
    ) -> Dict[str,Any]:
        start_time = time.time()
        results = []
        total_posts_scanned = 0
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=time_range_days)
            await self._update_progress(progress_callback,10,"Calculating time window")
            await select._update_progress(progress_callback,20,"Fetching posts from social platforms")
            posts = await self.crawler.fetch_platfrom_posts(
                platforms=platforms,
                since_date=cutoff_date,
                limit=10000,
                progress_callback=progress_callback
            )
            total_posts_scanned = len(posts)
            await self._update_progress(progress_callback,40,f"Retrieved {total_posts_scanned} posts")
            
            if not posts:
                await self._update_progress(progress_callback,100,"No posts found")
                return{
                    "status": "no_posts",
                    "matches": [],
                    "total_scanned": 0,
                    "duration_ms": (time.time() - start_time) * 1000,
                }
            await self._update_progress(progress_callback,50,"Extracting biometric features")
            posts_with_embeddings = await self._extract_post_embeddings(
                post=posts,
                biometric_type=biometric_type,
                progress_callback=progress_callback
            )
            if not posts_with_embeddings:
                await self._update_progress(progress_callback,100,"No biometric features found")
                return{
                    "status": "no_features",
                    "matches": [],
                    "total_scanned": total_posts_scanned,
                    "duration_ms": (time.time() - start_time) * 1000,
                }
            
            await self._update_progress(progress_callback,70,"Matching biometric signatures")
            matches = await self._perform_matching(
                target_face=face_embedding,
                target_voice=voice_embedding,
                posts=posts_with_embeddings,
                min_confidence=min_confidence,
                biometric_type=biometric_type,
            )
            
            await self._update_progress(progress_callback,85,"Ranking results")
            ranked_matches = self._rank_results(matches)
            
            await self._update_search_history(
                task_id=task_id,
                status=SearchStatus.COMPLETED,
                results_count=len(ranked_matches),
                top_confidence=ranked_matches[0]["similarity"] if ranked_matches else 0,
                duration_ms=(time.time() - start_time) * 1000,
            )
            await self._update_progress(progress_callback,100,f"Search complete! Found {len(ranked_matches)} matches")
            log_search(
                task_id=task_id,
                user_id=user_id or "anonymous",
                platforms=platforms,
                time_range_days=time_range_days,
                results_count=len(ranked_matches),
                duration_ms=(time.time() - start_time) * 1000,
                status="complete"
            )
            return {
                "status": "completed",
                "matches": ranked_matches[:100], 
                "total_scanned": total_posts_scanned,
                "total_matches": len(ranked_matches),
                "duration_ms": (time.time() - start_time) * 1000,
            }
        except Exception as e:
            logger.error(f"Search execution failed: {str(e)}", exc_info=True)
            await self._update_search_history(
                task_id=task_id,
                status=SearchStatus.FAILED,
                error_message=str(e)
            ) 
            raise SearchException(
                message=f"Search failed: {str(e)}",
                details={
                    "task_id": task_id,
                    "platforms": platforms,
                    "time_range_days": time_range_days,
                }
            )
            
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
                if biometric_type == "face" or bi == "hybrid":
                    tasks.append(self._extract_face_embeddings(post))
                elif biometric_type == "voice":
                    tasks.append(self._extract_voice_embeddings(post))
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
                        face_result = await self.face_service.extract_face_embedding(
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
    
    def _rank_results(self,matches: List[Dict[str,ANy]]) -> List[Dict[str,Any]]:
        now = datetime.utcnow9
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