from datetime import datetime, timedelta
from typing import Optional, Any, Dict, List
import json
import re

def format_time_ago(date: datetime) -> str:
    if not date:
        return "unknown"
    
    now = datetime.utcnow()
    delta = now - date
    
    seconds = delta.total_seconds()
    minutes = seconds / 60
    hours = minutes / 60
    days = hours / 24
    weeks = days / 7
    months = days / 30
    years = days / 365
    
    if seconds < 60:
        return "just now"
    elif minutes < 60:
        return f"{int(minutes)}m ago"
    elif hours < 24:
        return f"{int(hours)}h ago"
    elif days < 7:
        return f"{int(days)}d ago"
    elif weeks < 4:
        return f"{int(weeks)}w ago"
    elif months < 12:
        return f"{int(months)}mo ago"
    else:
        return f"{int(years)}y ago"

def format_date_short(date: datetime) -> str:
    if not date:
        return "N/A"
    return date.strftime("%b %d, %Y")

def format_date_full(date: datetime) -> str:
    if not date:
        return "N/A"
    return date.strftime("%b %d, %Y %H:%M")

def format_time_iso(date: datetime) -> str:
    if not date:
        return None
    return date.isoformat() + "Z"

def format_number(num: int) -> str:
    if num is None:
        return "0"
    
    if num < 1000:
        return str(num)
    elif num < 1000000:
        return f"{num/1000:.1f}K"
    elif num < 1000000000:
        return f"{num/1000000:.1f}M"
    else:
        return f"{num/1000000000:.1f}B"

def format_percentage(value: float, decimals: int = 1) -> str:
    if value is None:
        return "0%"
    return f"{value * 100:.{decimals}f}%"

def format_currency(amount: float, currency: str = "$") -> str:
    if amount is None:
        return f"{currency}0.00"
    return f"{currency}{amount:,.2f}"

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024**2:
        return f"{size_bytes/1024:.1f} KB"
    elif size_bytes < 1024**3:
        return f"{size_bytes/1024**2:.1f} MB"
    elif size_bytes < 1024**4:
        return f"{size_bytes/1024**3:.1f} GB"
    else:
        return f"{size_bytes/1024**4:.1f} TB"

def format_confidence(score: float) -> str:
    if score is None:
        return "0%"
    return f"{score * 100:.1f}%"

def get_confidence_level(score: float) -> str:
    if score >= 0.85:
        return "high"
    elif score >= 0.70:
        return "medium"
    elif score >= 0.55:
        return "low"
    else:
        return "negative"

def get_confidence_color(score: float) -> str:
    level = get_confidence_level(score)
    colors = {
        "high": "#4ade80",     
        "medium": "#facc15",   
        "low": "#fb923c",     
        "negative": "#f87171", 
    }
    return colors.get(level, "#94a3b8") 

def get_platform_icon(platform: str) -> str:
    icons = {
        "instagram": "📸",
        "facebook": "👍",
        "twitter": "🐦",
        "tiktok": "🎵",
        "telegram": "✈️",
        "reddit": "🤖",
        "youtube": "▶️",
        "linkedin": "💼",
        "snapchat": "👻",
        "pinterest": "📌",
    }
    return icons.get(platform.lower(), "🌐")

def get_platform_color(platform: str) -> str:
    colors = {
        "instagram": "#E4405F",
        "facebook": "#1877F2",
        "twitter": "#1DA1F2",
        "tiktok": "#000000",
        "telegram": "#26A5E4",
        "reddit": "#FF4500",
        "youtube": "#FF0000",
        "linkedin": "#0A66C2",
        "snapchat": "#FFFC00",
        "pinterest": "#E60023",
    }
    return colors.get(platform.lower(), "#94a3b8")

def pretty_json(data: Any) -> str:
    try:
        return json.dumps(data, indent=2, default=str)
    except:
        return str(data)

def safe_json_parse(json_str: str) -> Optional[Dict]:
    try:
        return json.loads(json_str)
    except:
        return None

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    if not text:
        return ""
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def truncate_middle(text: str, max_length: int = 100, suffix: str = "...") -> str:
    if not text:
        return ""
    
    if len(text) <= max_length:
        return text
    
    half = (max_length - len(suffix)) // 2
    return text[:half] + suffix + text[-half:]

__all__ = [
    "format_time_ago",
    "format_date_short",
    "format_date_full",
    "format_time_iso",
    
    "format_number",
    "format_percentage",
    "format_currency",
    
    "format_file_size",
    
    "format_confidence",
    "get_confidence_level",
    "get_confidence_color",
    
    "get_platform_icon",
    "get_platform_color",
    
    "pretty_json",
    "safe_json_parse",
    
    "truncate_text",
    "truncate_middle",
]