import os
import json
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseSettings, Field, SecretStr, validator, root_validator
from pydantic.env_settings import SettingsSourceCallable
from functools import lru_cache
import logging
from pathlib import Path
import yaml
from datetime import timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConfigSources:
    
    @staticmethod
    def load_env_file(env_file: str = ".env") -> dict:
        if not os.path.exists(env_file):
            return {}
        
        config = {}
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()
        return config
    
    @staticmethod
    def load_yaml_file(yaml_file: str = "config.yaml") -> dict:
        if not os.path.exists(yaml_file):
            return {}
        
        with open(yaml_file, 'r') as f:
            return yaml.safe_load(f) or {}
    
    @staticmethod
    def load_json_file(json_file: str = "config.json") -> dict:
        if not os.path.exists(json_file):
            return {}
        
        with open(json_file, 'r') as f:
            return json.load(f)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Chronos Search Engine"
    PROJECT_DESCRIPTION: str = "AI-powered social media search with 6-month temporal analysis"
    VERSION: str = "3.0.0-masterpiece"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    WORKERS: int = 4
    WORKER_TIMEOUT: int = 300
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://chronos.example.com",
    ]
    
    SECRET_KEY: SecretStr = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_EXPIRE_HOURS: int = 24
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 10
    
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_PASSWORD: SecretStr = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = "chronos"
    POSTGRES_POOL_SIZE: int = 20
    POSTGRES_MAX_OVERFLOW: int = 40
    POSTGRES_POOL_TIMEOUT: int = 30
    POSTGRES_ECHO: bool = False
    POSTGRES_POOL_PRE_PING: bool = True
    POSTGRES_POOL_RECYCLE: int = 3600
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD.get_secret_value()}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD.get_secret_value()}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def DATABASE_DSN(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD.get_secret_value()}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[SecretStr] = None
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_RETRY_ON_TIMEOUT: bool = True
    REDIS_HEALTH_CHECK_INTERVAL: int = 30
    REDIS_DECODE_RESPONSES: bool = True
    
    @property
    def REDIS_URL(self) -> str:
        password = f":{self.REDIS_PASSWORD.get_secret_value()}@" if self.REDIS_PASSWORD else ""
        return f"redis://{password}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    @property
    def REDIS_URL_BROKER(self) -> str:
        return self.REDIS_URL
    
    @property
    def REDIS_URL_BACKEND(self) -> str:
        return f"{self.REDIS_URL}/1"
    
    CELERY_BROKER_URL: str = Field(default=None, env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default=None, env="CELERY_RESULT_BACKEND")
    
    @property
    def CELERY_BROKER(self) -> str:
        return self.CELERY_BROKER_URL or self.REDIS_URL_BROKER
    
    @property
    def CELERY_BACKEND(self) -> str:
        return self.CELERY_RESULT_BACKEND or self.REDIS_URL_BACKEND
    
    CELERY_TASK_ALWAYS_EAGER: bool = False
    CELERY_TASK_EAGER_PROPAGATES: bool = True
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]
    CELERY_TIMEZONE: str = "UTC"
    CELERY_ENABLE_UTC: bool = True
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 3600
    CELERY_TASK_SOFT_TIME_LIMIT: int = 3000
    CELERY_WORKER_PREFETCH_MULTIPLIER: int = 1
    CELERY_WORKER_MAX_TASKS_PER_CHILD: int = 100
    CELERY_TASK_ACKS_LATE: bool = True
    CELERY_TASK_REJECT_ON_WORKER_LOST: bool = True
    CELERY_TASK_DEFAULT_QUEUE: str = "default"
    CELERY_TASK_ROUTES: Dict[str, Dict] = {
        "app.workers.search_worker.*": {"queue": "search"},
        "app.workers.sweeper_worker.*": {"queue": "sweeper"},
        "app.workers.feedback_worker.*": {"queue": "feedback"},
    }
    
    INSIGHTFACE_MODEL: str = "buffalo_l"
    INSIGHTFACE_PROVIDERS: List[str] = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    INSIGHTFACE_DET_SIZE: tuple = (640, 640)
    INSIGHTFACE_MAX_FACES: int = 1
    INSIGHTFACE_DET_THRESHOLD: float = 0.5
    
    FACE_MATCH_THRESHOLD: float = 0.68
    FACE_MATCH_STRICT_THRESHOLD: float = 0.75
    VOICE_MATCH_THRESHOLD: float = 0.75
    
    WHISPER_MODEL: str = "base"
    WHISPER_DEVICE: str = "cuda"
    WHISPER_COMPUTE_TYPE: str = "float16"
    WHISPER_LANGUAGE: Optional[str] = None
    WHISPER_TASK: str = "transcribe"
    
    INSTAGRAM_ACCESS_TOKEN: Optional[SecretStr] = None
    INSTAGRAM_BUSINESS_ID: Optional[str] = None
    
    FACEBOOK_ACCESS_TOKEN: Optional[SecretStr] = None
    FACEBOOK_APP_ID: Optional[str] = None
    FACEBOOK_APP_SECRET: Optional[SecretStr] = None
    
    TWITTER_BEARER_TOKEN: Optional[SecretStr] = None
    TWITTER_API_KEY: Optional[SecretStr] = None
    TWITTER_API_SECRET: Optional[SecretStr] = None
    
    TIKTOK_ACCESS_TOKEN: Optional[SecretStr] = None
    TIKTOK_REFRESH_TOKEN: Optional[SecretStr] = None
    
    TELEGRAM_BOT_TOKEN: Optional[SecretStr] = None
    
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[SecretStr] = None
    REDDIT_USER_AGENT: str = "ChronosSearch/3.0"
    
    YOUTUBE_API_KEY: Optional[SecretStr] = None
    
    SOCIAL_API_TIMEOUT: int = 30
    SOCIAL_API_RETRIES: int = 3
    SOCIAL_API_BACKOFF_FACTOR: float = 1.0
    SOCIAL_API_BATCH_SIZE: int = 100
    SOCIAL_API_RATE_LIMIT: int = 100
    
    DATA_RETENTION_DAYS: int = 180
    SWEEPER_CRON: str = "0 0 * * *"
    SWEEPER_BATCH_SIZE: int = 10000
    SWEEPER_ARCHIVE_ENABLED: bool = True
    SWEEPER_DELETE_ENABLED: bool = False
    
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    RATE_LIMIT_BURST: int = 20
    RATE_LIMIT_PREMIUM_MULTIPLIER: int = 5
    
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/chronos.log"
    LOG_FORMAT: str = "%(asctime)s | %(levelname)s | %(name)s | %(correlation_id)s | %(message)s"
    LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
    LOG_MAX_SIZE: int = 100 * 1024 * 1024
    LOG_BACKUP_COUNT: int = 10
    LOG_JSON_FORMAT: bool = False
    LOG_SENSITIVE_DATA: bool = False
    
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    METRICS_PATH: str = "/metrics"
    SENTRY_DSN: Optional[SecretStr] = None
    SENTRY_ENVIRONMENT: str = "production"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    SENTRY_PROFILES_SAMPLE_RATE: float = 0.1
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[SecretStr] = None
    SMTP_FROM_EMAIL: str = "noreply@chronos.com"
    SMTP_FROM_NAME: str = "Chronos Search"
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_TIMEOUT: int = 30
    
    UPLOAD_DIR: str = "uploads"
    STATIC_DIR: str = "static"
    TEMP_DIR: str = "tmp"
    ASSETS_DIR: str = "assets"
    
    SEARCH_RESULTS_LIMIT: int = 1000
    SEARCH_CACHE_TTL: int = 300
    SEARCH_CONCURRENT_REQUESTS: int = 10
    TEST_DATABASE_URL = "postgresql+asyncpg://chronos_user:chronos_pass@localhost:5432/chronos_test"
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        allowed = ["development", "staging", "production", "testing"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v
    
    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}")
        return v.upper()
    
    @validator("WHISPER_DEVICE")
    def validate_whisper_device(cls, v):
        allowed = ["cuda", "cpu", "mps"]
        if v not in allowed:
            raise ValueError(f"WHISPER_DEVICE must be one of {allowed}")
        return v
    
    @root_validator
    def validate_social_tokens(cls, values):
        if values.get("ENVIRONMENT") == "production":
            social_tokens = [
                values.get("INSTAGRAM_ACCESS_TOKEN"),
                values.get("FACEBOOK_ACCESS_TOKEN"),
                values.get("TWITTER_BEARER_TOKEN"),
                values.get("TIKTOK_ACCESS_TOKEN"),
            ]
            if not any(social_tokens):
                logger.warning(
                    "⚠️ No social platform tokens configured. "
                    "Search will use mock data. This is NOT recommended for production."
                )
        return values
    
    @root_validator
    def create_directories(cls, values):
        dirs = [
            values.get("UPLOAD_DIR", "uploads"),
            values.get("STATIC_DIR", "static"),
            values.get("TEMP_DIR", "tmp"),
            values.get("ASSETS_DIR", "assets"),
            os.path.dirname(values.get("LOG_FILE", "logs/chronos.log")),
        ]
        for d in dirs:
            if d and not os.path.exists(d):
                try:
                    os.makedirs(d, exist_ok=True)
                except Exception as e:
                    logger.warning(f"Could not create directory {d}: {e}")
        return values
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"
        
        @classmethod
        def customise_sources(cls, init_settings, env_settings, file_secret_settings):
            return (
                init_settings,
                env_settings,
                file_secret_settings,
                ConfigSources.load_env_file,
                ConfigSources.load_yaml_file,
                ConfigSources.load_json_file,
            )

class SettingsManager:
    
    _instance: Optional[Settings] = None
    _last_modified: float = 0
    _watch_file: Optional[str] = None
    
    @classmethod
    def get_settings(cls) -> Settings:
        env_file = ".env"
        current_mtime = os.path.getmtime(env_file) if os.path.exists(env_file) else 0
        
        if cls._instance is None or current_mtime > cls._last_modified:
            cls._instance = Settings()
            cls._last_modified = current_mtime
            if cls._instance.DEBUG:
                logger.info("🔄 Settings hot-reloaded")
        
        return cls._instance
    
    @classmethod
    def reload(cls):
        cls._instance = None
        return cls.get_settings()

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return SettingsManager.get_settings()

settings = get_settings()