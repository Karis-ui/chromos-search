import re
import uuid
from typing import Any, Optional, List, Dict, Union
from datetime import datetime
from urllib.parse import urlparse

def validate_username(username:str) -> bool:
    if not username:
        return False
    if len(username) < 3 or len(username) > 50:
        return False
    
    pattern = r'^[a-zA-Z][a-zA-Z0-9_]*$'
    return bool(re.match(pattern,username))

def validate_password(password:str) -> Dict[str,Any]:
    return{
        "min_length": len(password) >= 8,
        "has_uppercase": any(c.isupper() for c in password),
        "has_lowercase": any(c.islower() for c in password),
        "has_digit": any(c.isdigit() for c in password),
        "has_special": any(c in '!@#$%^&*()_+-=[]{};:,.<>?' for c in password),
        "no_common": password.lower() not in ['password', '12345678', 'qwerty123', 'admin123'],
    }
def is_password_strong(password: str) -> bool:
    validation = validate_password(password)
    return all(validation.values())

def validate_url(url: str) -> bool:
    if not url:
        return False
    
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_image_file(filename: str) -> bool:
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'}
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)

def validate_video_file(filename: str) -> bool:
    allowed_extensions = {'.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.mpeg'}
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)

def validate_file_size(file_size: int, max_size_mb: int = 50) -> bool:
    return file_size <= max_size_mb * 1024 * 1024

def validate_media_type(content_type: str) -> str:
    if content_type.startswith('image/'):
        return 'image'
    elif content_type.startswith('video/'):
        return 'video'
    elif content_type.startswith('audio/'):
        return 'audio'
    else:
        return 'unknown'

def validate_date_range(start_date: datetime, end_date: datetime) -> bool:
    return start_date < end_date

def validate_time_range_days(days: int, min_days: int = 1, max_days: int = 180) -> bool:
    return min_days <= days <= max_days

def is_valid_iso_date(date_str: str) -> bool:
    try:
        datetime.fromisoformat(date_str)
        return True
    except:
        return False

def validate_uuid(uuid_str: str) -> bool:
    try:
        uuid.UUID(uuid_str)
        return True
    except ValueError:
        return False

def validate_uuid_list(uuid_list: List[str]) -> List[bool]:
    return [validate_uuid(u) for u in uuid_list]

def validate_json(data: Any) -> bool:
    try:
        import json
        json.dumps(data)
        return True
    except:
        return False

def validate_platform(platform: str) -> bool:
    valid_platforms = {
        'instagram', 'facebook', 'twitter', 'tiktok', 
        'telegram', 'reddit', 'youtube', 'linkedin'
    }
    return platform.lower() in valid_platforms

def validate_platforms(platforms: List[str]) -> List[str]:
    return [p for p in platforms if validate_platform(p)]

def sanitize_input(text: str, max_length: int = 1000) -> str:
    if not text:
        return ""
    
    text = text.strip()
    
    if len(text) > max_length:
        text = text[:max_length]
    
    dangerous = ['<', '>', '&', '"', "'", '`']
    for char in dangerous:
        text = text.replace(char, '')
    
    return text

def sanitize_filename(filename: str) -> str:
    filename = filename.replace('/', '').replace('\\', '')
    
    import re
    filename = re.sub(r'[^\w\-_.]', '', filename)
    
    return filename

def sanitize_email(email: str) -> str:
    if not email:
        return ""
    
    email = email.strip().lower()
    return email

__all__ = [
    "validate_email",
    "validate_username",
    "validate_password",
    "is_password_strong",
    
    "validate_url",
    "validate_image_file",
    "validate_video_file",
    "validate_file_size",
    "validate_media_type",
    
    "validate_date_range",
    "validate_time_range_days",
    "is_valid_iso_date",
    
    "validate_uuid",
    "validate_uuid_list",
    
    "validate_json",
    "validate_platform",
    "validate_platforms",
    
    "sanitize_input",
    "sanitize_filename",
    "sanitize_email",
]
