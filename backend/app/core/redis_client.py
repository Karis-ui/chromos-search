import redis.asyncio as redis
from redis.asyncio import Redis
from redis.asyncio.connection import ConnectionPool
from typing import Optional, Any, Dict, List, Union
import json
import logging
from functools import lru_cache
import asyncio
import time
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.exceptions import CacheException

logger = logging.getLogger(__name__)

class RedisConnectionPool:
    _instance: Optional[ConnectionPool] = None
    _client: Optional[Redis] = None
    _lock = asyncio.Lock()
    
    @classmethod
    async def get_pool(cls) -> ConnectionPool:
        if cls._instance is None:
            async with cls._lock:
                logger.info("Creating new Redis connection pool...")
                if cls._instance is None:
                    cls._instance = ConnectionPool(
                        host = settings.REDIS_HOST,
                        port = settings.REDIS_PORT,
                        db = settings.REDIS_DB,
                        password = settings.REDIS_PASSWORD.get_secret_value() if settings.REDIS_PASSWORD else None,
                        max_connections = settings.REDIS_MAX_CONNECTIONS,
                        decode_responses = settings.REDIS_DECODE_RESPONSES,
                        socket_timeout = settings.REDIS_SOCKET_TIMEOUT,
                        socket_keepalive = True,
                        health_check_interval = settings.REDIS_HEALTH_CHECK_INTERVAL,
                        retry_on_timeout = settings.REDIS_RETRY_ON_TIMEOUT,
                    )
        return cls._instance
    
    @classmethod
    async def get_client(cls) -> Redis:
        if cls._client is None:
            async with cls._lock:
                logger.info("Creating new Redis client...")
                if cls._client is None:
                    pool = await cls.get_pool()
                    cls._client = Redis(connection_pool=pool)
        return cls._client
    
    @classmethod
    async def close_pool(cls):
        if cls._client:
            await cls._client.close()
            cls._client = None
        if cls._instance:
            await cls._instance.disconnect()
            cls._instance = None
        logger.info("Redis connection pool closed.")
    
class CacheService:
    def __init__(self, redis_client: Optional[Redis] = None):
        self.redis_client = redis_client
        self._local_cache:Dict[str, Dict[str, Any]] = {}
        self._local_cache_ttl:Dict[str, float] = {}
        self._local_cache_enabled = settings.ENVIRONMENT in ["development", "staging"]
    
    async def get(self,key:str, use_local_cache:bool=True) -> Optional[Any]:
        if use_local_cache and self._local_cache_enabled:
            if key in self._local_cache and time.time() < self._local_cache_ttl.get(key, 0):
                return self._local_cache[key]
            else:
                del self._local_cache[key]
                del self._local_cache_ttl[key]
        
        client = await RedisConnectionPool.get_client()
        try:
            value = await client.get(key)
            if value is not None:
                value = json.loads(value)
                if use_local_cache and self._local_cache_enabled:
                    self._local_cache[key] = value
                    self._local_cache_ttl[key] = time.time() + 60
                return value
            return None
        except Exception as e:
            logger.error(f"Error getting key {key} from Redis: {e}")
            raise CacheException(message=f"Error getting key {key} from Redis", details={"error": str(e)})
    
    async def set(self,key:str, value:Any, ttl:Optional[int]=None, use_local:bool=True) -> None:
        try:
            if use_local and self._local_cache_enabled:
                self._local_cache[key] = value
                self._local_cache_ttl[key] = time.time() + (ttl if ttl else 60)
                if ttl:
                    await self.redis_client.setex(key, ttl, json.dumps(value))
            else:
                await self.redis_client.set(key, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Error setting key {key} in Redis: {e}")
            raise CacheException(message=f"Error setting key {key} in Redis", details={"error": str(e)})
    
    async def delete(self,key:str, use_local:bool=True) -> None:
        try:
            if use_local and self._local_cache_enabled:
                self._local_cache.pop(key, None)
                self._local_cache_ttl.pop(key, None)
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting key {key} from Redis: {e}")
            raise CacheException(message=f"Error deleting key {key} from Redis", details={"error": str(e)})
    
    async def exists(self,key:str) -> bool:
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking existence of key {key} in Redis: {e}")
            raise CacheException(message=f"Error checking existence of key {key} in Redis", details={"error": str(e)})
    
    async def mget(self,keys: List[str]) -> List[Optional[Any]]:
        try:
            values = await self.redis_client.mget(keys)
            return [json.loads(value) if value is not None else None for value in values]
        except Exception as e:
            logger.error(f"Error getting multiple keys {keys} from Redis: {e}")
            raise CacheException(message=f"Error getting multiple keys {keys} from Redis", details={"error": str(e)})
        
    async def mset(self, key_value_pairs: Dict[str, Any], ttl: Optional[int] = None) -> None:
        try:
            await self.redis_client.mset({k: json.dumps(v) for k, v in key_value_pairs.items()})
            if ttl:
                for key in key_value_pairs.keys():
                    await self.redis_client.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Error setting multiple keys {list(key_value_pairs.keys())} in Redis: {e}")
            raise CacheException(message=f"Error setting multiple keys {list(key_value_pairs.keys())} in Redis", details={"error": str(e)})
        
    async def hget(self,keys:str, field:str) -> Optional[Any]:
        try:
            value = await self.redis_client.hget(keys, field)
            return json.loads(value) if value is not None else None
        except Exception as e:
            logger.error(f"Error getting hash field {field} from key {keys} in Redis: {e}")
            raise CacheException(message=f"Error getting hash field {field} from key {keys} in Redis", details={"error": str(e)})
        
    async def hset(self,keys:str, field:str, value:Any) -> None:
        try:
            await self.redis_client.hset(keys, field, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Error setting hash field {field} in key {keys} in Redis: {e}")
            raise CacheException(message=f"Error setting hash field {field} in key {keys} in Redis", details={"error": str(e)})
        
    async def hgetall(self,key:str) -> Dict[str, Any]:
        try:
            values = await self.redis_client.hgetall(key)
            return {k: json.loads(v) for k, v in values.items()}
        except Exception as e:
            logger.error(f"Error getting all hash fields from key {key} in Redis: {e}")
            raise CacheException(message=f"Error getting all hash fields from key {key} in Redis", details={"error": str(e)})
        
    async def hmset(self, key: str, field_value_pairs: Dict[str, Any]) -> None:
        try:
            await self.redis_client.hmset(key, {k: json.dumps(v) for k, v in field_value_pairs.items()})
            return True
        except Exception as e:
            logger.error(f"Error setting multiple hash fields in key {key} in Redis: {e}")
            raise CacheException(message=f"Error setting multiple hash fields in key {key} in Redis", details={"error": str(e)})
        
    async def get_json(self, key: str) -> Optional[Dict[str, Any]]:
        try:
            value = await self.redis_client.get(key)
            return json.loads(value) if value is not None else None
        except Exception as e:
            logger.error(f"Error getting JSON from key {key} in Redis: {e}")
            raise CacheException(message=f"Error getting JSON from key {key} in Redis", details={"error": str(e)})
        
    async def set_json(self, key: str, value: Dict[str, Any], ttl: Optional[int] = None) -> None:
        try:
            await self.redis_client.set(key, json.dumps(value))
            if ttl:
                await self.redis_client.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Error setting JSON for key {key} in Redis: {e}")
            raise CacheException(message=f"Error setting JSON for key {key} in Redis", details={"error": str(e)})
        
    async def lpush(self,key:str,*values) -> int:
        try:
            return await self.redis_client.lpush(key, *[json.dumps(v) for v in values])
        except Exception as e:
            logger.error(f"Error pushing to list {key} in Redis: {e}")
            raise CacheException(message=f"Error pushing to list {key} in Redis", details={"error": str(e)})
        
    async def rpush(self,key:str,*values) -> int:
        try:
            return await self.redis_client.rpush(key, *[json.dumps(v) for v in values])
        except Exception as e:
            logger.error(f"Error pushing to list {key} in Redis: {e}")
            raise CacheException(message=f"Error pushing to list {key} in Redis", details={"error": str(e)})
        
    async def lpop(self, key: str) -> Optional[Dict[str, Any]]:
        try: 
            value = await self.redis_client.lpop(key)
            return json.loads(value) if value is not None else None
        except Exception as e:
            logger.error(f"Error popping from list {key} in Redis: {e}")
            raise CacheException(message=f"Error popping from list {key} in Redis", details={"error": str(e)})
        
    async def sadd(self, key: str, *members) -> int:
        try:
            return await self.client.sadd(key, *members)
        except Exception as e:
            logger.error(f"Redis sadd error: {str(e)}")
            return 0
    
    async def sismember(self, key: str, member: Any) -> bool:
        try:
            return await self.client.sismember(key, member)
        except Exception as e:
            logger.error(f"Redis sismember error: {str(e)}")
            return False
    
    async def smembers(self, key: str) -> List[Any]:
        try:
            return await self.client.smembers(key)
        except Exception as e:
            logger.error(f"Redis smembers error: {str(e)}")
            return []
    
    async def zadd(self, key: str, mapping: Dict[str, float]) -> int:
        try:
            return await self.client.zadd(key, mapping)
        except Exception as e:
            logger.error(f"Redis zadd error: {str(e)}")
            return 0
    
    async def zrange(
        self,
        key: str,
        start: int,
        end: int,
        withscores: bool = False
    ) -> List[Any]:
        try:
            return await self.client.zrange(key, start, end, withscores=withscores)
        except Exception as e:
            logger.error(f"Redis zrange error: {str(e)}")
            return []
    
    async def zrevrange(
        self,
        key: str,
        start: int,
        end: int,
        withscores: bool = False
    ) -> List[Any]:
        try:
            return await self.client.zrevrange(key, start, end, withscores=withscores)
        except Exception as e:
            logger.error(f"Redis zrevrange error: {str(e)}")
            return []
    
    async def publish(self, channel: str, message: Any) -> int:
        try:
            if isinstance(message, (dict, list)):
                message = json.dumps(message)
            return await self.client.publish(channel, message)
        except Exception as e:
            logger.error(f"Redis publish error: {str(e)}")
            return 0
    
    async def subscribe(self, channel: str) -> Any:
        try:
            pubsub = self.client.pubsub()
            await pubsub.subscribe(channel)
            return pubsub
        except Exception as e:
            logger.error(f"Redis subscribe error: {str(e)}")
            return None
    
    async def expire(self, key: str, ttl: int) -> bool:
        try:
            return await self.client.expire(key, ttl)
        except Exception as e:
            logger.error(f"Redis expire error: {str(e)}")
            return False
    
    async def ttl(self, key: str) -> int:
        try:
            return await self.client.ttl(key)
        except Exception as e:
            logger.error(f"Redis ttl error: {str(e)}")
            return -2
    
    async def clear_local_cache(self):
        self._local_cache.clear()
        self._local_cache_ttl.clear()
    
    async def health_check(self) -> bool:
        try:
            await self.client.ping()
            return True
        except Exception:
            return False

@lru_cache(maxsize=1)
def get_cache_service() -> CacheService:
    return CacheService()

async def get_redis() -> Redis:
    return await RedisConnectionPool.get_client()

async def get_cache() -> CacheService:
    client = await RedisConnectionPool.get_client()
    cache = get_cache_service()
    cache.client = client
    return cache

@asynccontextmanager
async def redis_context():
    client = await get_redis()
    try:
        yield client
    finally:
        pass

def cached(ttl: int = 300, key_prefix: str = ""):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key_parts = [key_prefix, func.__name__]
            
            if args:
                key_parts.extend([str(arg) for arg in args])
            
            if kwargs:
                for k, v in sorted(kwargs.items()):
                    if k not in ["self", "cls"]:
                        key_parts.append(f"{k}:{v}")
            
            cache_key = ":".join(key_parts)
            
            cache = await get_cache()
            
            cached_result = await cache.get_json(cache_key)
            if cached_result is not None:
                return cached_result
            
            result = await func(*args, **kwargs)
            
            if result is not None:
                await cache.set_json(cache_key, result, ttl)
            
            return result
        
        return wrapper
    
    return decorator

__all__ = [
    "RedisConnectionPool",
    "CacheService",
    "get_redis",
    "get_cache",
    "redis_context",
    "cached",
]