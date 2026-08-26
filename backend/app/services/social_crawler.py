import asyncio
import time
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timedelta
import httpx
import json
from urllib.parse import urlparse

from app.core.logger import logger, log_social_api_call
from app.core.config import settings
from app.models.domain import SocialPost, Platform, MediaType
from app.core.exceptions import SocialAPIException

class SocialCrawlerService:
    def __init__(self):
        self.session = True
        self._rate_limiters = {}
        
    async def _get_session(self) -> httpx.AsyncClient:
        if self.session is None or self.session.is_closed:
            self.session = httpx.AsyncClient(
                timeout=settings.SOCIAL_API_TIMEOUT,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=10,max_connections=50)
            )
        return self.session
    
    async def fetch_platfrom_posts(self,
        platforms: List[str],
        since_date: datetime,
        limit: int = 10000,
        progress_callback: Optional[callable] = None,
    ) -> List[SocialPost]:
        all_posts = []
        platform_methods = {
            "instagram": self._fetch_instagram_posts,
            "facebook": self._fetch_facebook_posts,
            "twitter": self._fetch_twitter_posts,
            "tiktok": self._fetch_tiktok_posts,
            "telegram": self._fetch_telegram_posts,
            "reddit": self._fetch_reddit_posts,
            "youtube": self._fetch_youtube_posts,
        }
        valid_platforms = [p for p in platforms if p in platform_methods]
        if not valid_platforms:
            logger.warning(f"No valid platform forun in: {platforms}")
            return []
        
        total_platforms = len(valid_platforms)
        for idx, platform in enumerate(valid_platforms):
            try:
                await self._update_progress(
                    progress_callback,20 + (idx / total_platforms) * 20,f"Fetching posts from {platform}"
                )
                method = platform_methods[platform]
                posts = await method(since_date,limit // total_platforms)
                all_posts.extend(posts)
            except Exception as e:
                logger.error(f"Failed to fetch {platform}: {str(e)}")
                continue
        return all_posts
    
    async def _fetch_instagram_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        """Fetch posts from Instagram"""
        posts = []
        
        try:
            if not settings.INSTAGRAM_ACCESS_TOKEN:
                # Use mock data for development
                return await self._generate_mock_posts(Platform.INSTAGRAM, since_date, limit)
            
            # Actual Instagram API call would go here
            # Using instagrapi or Graph API
            
            # For now, return mock data
            return await self._generate_mock_posts(Platform.INSTAGRAM, since_date, limit)
            
        except Exception as e:
            log_social_api_call(
                platform="instagram",
                endpoint="user/media",
                duration_ms=0,
                success=False,
                error=str(e),
            )
            return []
    
    async def _fetch_facebook_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        try:
            # Facebook Graph API integration
            return await self._generate_mock_posts(Platform.FACEBOOK, since_date, limit)
        except Exception as e:
            logger.error(f"Facebook fetch failed: {str(e)}")
            return []
    
    async def _fetch_twitter_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        try:
            # Twitter API v2 integration
            return await self._generate_mock_posts(Platform.TWITTER, since_date, limit)
        except Exception as e:
            logger.error(f"Twitter fetch failed: {str(e)}")
            return []
    
    async def _fetch_tiktok_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        """Fetch posts from TikTok"""
        try:
            return await self._generate_mock_posts(Platform.TIKTOK, since_date, limit)
        except Exception as e:
            logger.error(f"TikTok fetch failed: {str(e)}")
            return []
    
    async def _fetch_telegram_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        try:
            return await self._generate_mock_posts(Platform.TELEGRAM, since_date, limit)
        except Exception as e:
            logger.error(f"Telegram fetch failed: {str(e)}")
            return []
    
    async def _fetch_reddit_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        try:
            return await self._generate_mock_posts(Platform.REDDIT, since_date, limit)
        except Exception as e:
            logger.error(f"Reddit fetch failed: {str(e)}")
            return []
    
    async def _fetch_youtube_posts(
        self,
        since_date: datetime,
        limit: int,
    ) -> List[SocialPost]:
        try:
            return await self._generate_mock_posts(Platform.YOUTUBE, since_date, limit)
        except Exception as e:
            logger.error(f"YouTube fetch failed: {str(e)}")
            return []
    
    async def _generate_mock_posts(
        self,
        platform: Platform,
        since_date: datetime,
        count: int,
    ) -> List[SocialPost]:
        import random
        import uuid
        
        posts = []
        mock_users = [
            ("john_doe", "John Doe"),
            ("jane_smith", "Jane Smith"),
            ("alex_wilson", "Alex Wilson"),
            ("emma_davis", "Emma Davis"),
            ("mike_brown", "Mike Brown"),
        ]
        
        mock_captions = [
            "Just had an amazing day! #blessed",
            "Check out this awesome view 🌅",
            "New project launching soon! 🚀",
            "Feeling grateful today",
            "Throwback to that time we...",
            "Absolutely loving this vibe 💫",
            "Can't wait for the weekend!",
            "Big things coming, stay tuned",
            "This is what dreams are made of",
            "Living my best life",
        ]
        
        mock_media_types = [MediaType.IMAGE, MediaType.VIDEO]
        
        for i in range(min(count, 100)): 
            days_ago = random.randint(0, (datetime.utcnow() - since_date).days)
            posted_at = datetime.utcnow() - timedelta(days=days_ago)
            
            username, full_name = random.choice(mock_users)
            
            likes = random.randint(10, 10000)
            shares = random.randint(0, 1000)
            comments = random.randint(0, 500)
            
            post = SocialPost(
                id=uuid.uuid4(),
                platform=platform,
                external_id=f"mock_{platform.value}_{i}_{int(time.time())}",
                platform_url=f"https://{platform.value}.com/p/mock_{i}",
                posted_at=posted_at,
                crawled_at=datetime.utcnow(),
                media_type=random.choice(mock_media_types),
                media_url=f"https://example.com/media/mock_{i}.jpg",
                thumbnail_url=f"https://example.com/thumb/mock_{i}.jpg",
                caption=random.choice(mock_captions),
                hashtags=["#mock", "#test", "#chronos"],
                mentions=[],
                author_username=username,
                author_full_name=full_name,
                author_id=f"user_{username}",
                likes=likes,
                shares=shares,
                comments=comments,
                is_active=True,
            )
            
            posts.append(post)
        
        return posts
    
    async def _update_progress(
        self,
        callback: Optional[callable],
        progress: int,
        message: str,
    ):
        """Update progress via callback"""
        if callback:
            try:
                await callback(progress, message)
            except Exception as e:
                pass