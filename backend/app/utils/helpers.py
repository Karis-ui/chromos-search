import os
import json
import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, List, Union
from functools import wraps
import time
import asyncio

from app.core.logger import logger

def generate_id(prefix: str = "") -> str:
    import uuid
    unique_id = str(uuid.uuid4()).replace('-', '')[:16]
    return f"{prefix}_{unique_id}" if prefix else unique_id

def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

def generate_verification_code(length: int = 6) -> str:
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def generate_random_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_username(base: str = "user") -> str:
    import uuid
    suffix = str(uuid.uuid4())[:8]
    return f"{base}_{suffix}"

def hash_string(text: str, algorithm: str = "sha256") -> str:
    hash_func = hashlib.new(algorithm)
    hash_func.update(text.encode('utf-8'))
    return hash_func.hexdigest()

def hash_file(file_content: bytes, algorithm: str = "sha256") -> str:
    hash_func = hashlib.new(algorithm)
    hash_func.update(file_content)
    return hash_func.hexdigest()

def hash_file_chunked(file_path: str, algorithm: str = "sha256", chunk_size: int = 8192) -> str:
    hash_func = hashlib.new(algorithm)
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(chunk_size), b''):
            hash_func.update(chunk)
    return hash_func.hexdigest()

def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

def days_ago(days: int) -> datetime:
    return datetime.utcnow() - timedelta(days=days)

def format_duration(seconds: float) -> str:
    if seconds < 60:
        return f"{seconds:.2f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds:.1f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"

def parse_iso_date(date_str: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        return None

def deep_merge(dict1: Dict, dict2: Dict) -> Dict:
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def filter_dict(data: Dict, keys: List[str]) -> Dict:
    return {k: v for k, v in data.items() if k in keys}

def exclude_keys(data: Dict, keys: List[str]) -> Dict:
    return {k: v for k, v in data.items() if k not in keys}

def safe_get(data: Dict, key: str, default: Any = None) -> Any:
    return data.get(key, default)

def singleton(cls):
    instances = {}
    
    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return get_instance

def retry(max_retries: int = 3, delay: float = 1.0, exponential: bool = True):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        wait_time = delay * (2 ** attempt) if exponential else delay
                        logger.warning(
                            f"Retry {attempt + 1}/{max_retries} for {func.__name__}: {str(e)}"
                        )
                        await asyncio.sleep(wait_time)
            raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        wait_time = delay * (2 ** attempt) if exponential else delay
                        logger.warning(
                            f"Retry {attempt + 1}/{max_retries} for {func.__name__}: {str(e)}"
                        )
                        time.sleep(wait_time)
            raise last_exception
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

__all__ = [
    "generate_id",
    "generate_token",
    "generate_verification_code",
    "generate_random_password",
    "generate_username",
    
    "hash_string",
    "hash_file",
    "hash_file_chunked",
    
    "now_iso",
    "days_ago",
    "format_duration",
    "parse_iso_date",
    
    "deep_merge",
    "filter_dict",
    "exclude_keys",
    "safe_get",
    
    "singleton",
    "retry",
]