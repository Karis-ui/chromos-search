import logging
import logging.handlers
import sys
import json
import uuid
import time
import os
from datetime import datetime
from typing import Optional, Dict, Any, Union, List
from contextvars import ContextVar
from functools import wraps
import traceback
from pathlib import Path

from app.core.config import settings

correlation_id_var: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)
request_id_var: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
user_id_var: ContextVar[Optional[str]] = ContextVar('user_id', default=None)

def get_correlation_id() -> str:
    corr_id = correlation_id_var.get()
    if corr_id is None:
        corr_id = str(uuid.uuid4())
        correlation_id_var.set(corr_id)
    return corr_id

def set_correlation_id(corr_id: str) -> None:
    correlation_id_var.set(corr_id)

def get_request_id() -> Optional[str]:
    return request_id_var.get()

def set_request_id(req_id: str) -> None:
    request_id_var.set(req_id)

def get_user_id() -> Optional[str]:
    return user_id_var.get()

def set_user_id(user_id: str) -> None:
    user_id_var.set(user_id)
    
class JSONFormatter(logging.Formatter):
    def __init__(
        self,
        fmt: Optional[str] = None,
        datefmt: Optional[str] = None,
        style: str = '%',
        validate: bool = True,
        *,
        defaults: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(fmt, datefmt, style, validate, defaults=defaults)
        self.default_fields = {
            "service": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION,
        }
    
    def format(self, record: logging.LogRecord) -> str:
        corr_id = get_correlation_id()
        req_id = get_request_id()
        user_id = get_user_id()
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "correlation_id": corr_id,
            "request_id": req_id,
            "user_id": user_id,
            "environment": settings.ENVIRONMENT,
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
        }
        
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": ''.join(traceback.format_tb(record.exc_info[2])),
            }
            
        if hasattr(record, 'extra'):
            log_entry.update(record.extra)
        if hasattr(record, 'custom_fields'):
            log_entry.update(record.custom_fields)
        
        log_entry = {k: v for k, v in log_entry.items() if v is not None}
        
        return json.dumps(log_entry, default=str)

class ConsoleFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[36m',     
        'INFO': '\033[32m',  
        'WARNING': '\033[33m', 
        'ERROR': '\033[31m', 
        'CRITICAL': '\033[41m', 
    }
    RESET = '\033[0m'
    
    def __init__(
        self,
        fmt: str = "%(asctime)s | %(levelname)-8s | %(correlation_id)s | %(message)s",
        datefmt: str = "%Y-%m-%d %H:%M:%S",
    ):
        super().__init__(fmt, datefmt)
    
    def format(self, record: logging.LogRecord) -> str:
        record.correlation_id = get_correlation_id()[:8] 
        color = self.COLORS.get(record.levelname, '')
        
        formatted = super().format(record)
        
        if settings.ENVIRONMENT != 'production':
            formatted = f"{color}{formatted}{self.RESET}"
        
        return formatted

class LoggerFactory:
    _initialized = False
    _console_handler = None
    _file_handler = None
    _json_handler = None
    
    @classmethod
    def _setup_handlers(cls):
        if cls._initialized:
            return
        
        cls._console_handler = logging.StreamHandler(sys.stdout)
        cls._console_handler.setLevel(getattr(logging, settings.LOG_LEVEL))
        cls._console_handler.setFormatter(ConsoleFormatter())
        
        log_dir = Path(settings.LOG_FILE).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        
        cls._file_handler = logging.handlers.RotatingFileHandler(
            filename=settings.LOG_FILE,
            maxBytes=settings.LOG_MAX_SIZE,
            backupCount=settings.LOG_BACKUP_COUNT,
            encoding='utf-8',
        )
        cls._file_handler.setLevel(logging.DEBUG)
        cls._file_handler.setFormatter(ConsoleFormatter())
        
        json_log_file = log_dir / "chronos.json.log"
        cls._json_handler = logging.handlers.RotatingFileHandler(
            filename=str(json_log_file),
            maxBytes=settings.LOG_MAX_SIZE,
            backupCount=settings.LOG_BACKUP_COUNT,
            encoding='utf-8',
        )
        cls._json_handler.setLevel(logging.DEBUG)
        cls._json_handler.setFormatter(JSONFormatter())
        
        cls._initialized = True
    
    @classmethod
    def get_logger(
        cls,
        name: str,
        level: Optional[str] = None,
        add_console: bool = True,
        add_file: bool = True,
        add_json: bool = True,
    ) -> logging.Logger:
        cls._setup_handlers()
        
        logger = logging.getLogger(name)
        
        level_value = getattr(logging, (level or settings.LOG_LEVEL).upper())
        logger.setLevel(level_value)
        
        if logger.handlers:
            logger.handlers.clear()
        
        if add_console and cls._console_handler:
            logger.addHandler(cls._console_handler)
        
        if add_file and cls._file_handler:
            logger.addHandler(cls._file_handler)
        
        if add_json and settings.LOG_JSON_FORMAT and cls._json_handler:
            logger.addHandler(cls._json_handler)
        
        logger.propagate = False
        
        return logger

def get_logger(name: str) -> logging.Logger:
    return LoggerFactory.get_logger(name)

class LoggerMixin:
    
    @property
    def logger(self) -> logging.Logger:
        if not hasattr(self, '_logger'):
            self._logger = get_logger(self.__class__.__name__)
        return self._logger

def log_performance(threshold_ms: float = 1000):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = time.perf_counter()
            
            try:
                result = await func(*args, **kwargs)
                duration = (time.perf_counter() - start_time) * 1000
                
                # Log performance
                log_level = logging.WARNING if duration > threshold_ms else logging.DEBUG
                logger.log(
                    log_level,
                    f"Performance: {func.__name__} took {duration:.2f}ms",
                    extra={
                        "function": func.__name__,
                        "duration_ms": duration,
                        "threshold_ms": threshold_ms,
                    }
                )
                
                return result
                
            except Exception as e:
                duration = (time.perf_counter() - start_time) * 1000
                logger.error(
                    f"Performance error: {func.__name__} failed after {duration:.2f}ms",
                    extra={
                        "function": func.__name__,
                        "duration_ms": duration,
                        "error": str(e),
                    },
                    exc_info=True
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = time.perf_counter()
            
            try:
                result = func(*args, **kwargs)
                duration = (time.perf_counter() - start_time) * 1000
                
                log_level = logging.WARNING if duration > threshold_ms else logging.DEBUG
                logger.log(
                    log_level,
                    f"Performance: {func.__name__} took {duration:.2f}ms",
                    extra={
                        "function": func.__name__,
                        "duration_ms": duration,
                        "threshold_ms": threshold_ms,
                    }
                )
                
                return result
                
            except Exception as e:
                duration = (time.perf_counter() - start_time) * 1000
                logger.error(
                    f"Performance error: {func.__name__} failed after {duration:.2f}ms",
                    extra={
                        "function": func.__name__,
                        "duration_ms": duration,
                        "error": str(e),
                    },
                    exc_info=True
                )
                raise
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

def log_error(logger: Optional[logging.Logger] = None):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            _logger = logger or get_logger(func.__module__)
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                _logger.error(
                    f"Error in {func.__name__}: {str(e)}",
                    extra={
                        "function": func.__name__,
                        "args": str(args[:10]),  # Limit to avoid huge logs
                        "kwargs": str(kwargs)[:200],
                        "error_type": type(e).__name__,
                    },
                    exc_info=True
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            _logger = logger or get_logger(func.__module__)
            try:
                return func(*args, **kwargs)
            except Exception as e:
                _logger.error(
                    f"Error in {func.__name__}: {str(e)}",
                    extra={
                        "function": func.__name__,
                        "args": str(args[:10]),
                        "kwargs": str(kwargs)[:200],
                        "error_type": type(e).__name__,
                    },
                    exc_info=True
                )
                raise
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

class LogContext:
    def __init__(
        self,
        correlation_id: Optional[str] = None,
        request_id: Optional[str] = None,
        user_id: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None,
    ):
        self.correlation_id = correlation_id or str(uuid.uuid4())
        self.request_id = request_id
        self.user_id = user_id
        self.extra = extra or {}
        self._previous_context = {}
    
    def __enter__(self):
        self._previous_context = {
            'correlation_id': correlation_id_var.get(),
            'request_id': request_id_var.get(),
            'user_id': user_id_var.get(),
        }
        
        correlation_id_var.set(self.correlation_id)
        if self.request_id:
            request_id_var.set(self.request_id)
        if self.user_id:
            user_id_var.set(self.user_id)
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        correlation_id_var.set(self._previous_context['correlation_id'])
        if self._previous_context['request_id']:
            request_id_var.set(self._previous_context['request_id'])
        if self._previous_context['user_id']:
            user_id_var.set(self._previous_context['user_id'])

logger = get_logger("chronos")

def log_request(
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    client_ip: Optional[str] = None,
    user_agent: Optional[str] = None,
    user_id: Optional[str] = None,
) -> None:
    logger.info(
        f"HTTP Request: {method} {path} -> {status_code} ({duration_ms:.2f}ms)",
        extra={
            "type": "http_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "user_id": user_id,
        }
    )

def log_search(
    task_id: str,
    user_id: str,
    platforms: List[str],
    time_range_days: int,
    results_count: int,
    duration_ms: float,
    status: str,
) -> None:
    logger.info(
        f"Search: {task_id} - Found {results_count} results in {duration_ms:.2f}ms",
        extra={
            "type": "search",
            "task_id": task_id,
            "user_id": user_id,
            "platforms": platforms,
            "time_range_days": time_range_days,
            "results_count": results_count,
            "duration_ms": duration_ms,
            "status": status,
        }
    )

def log_ml_operation(
    operation: str,
    model: str,
    duration_ms: float,
    success: bool,
    input_size: Optional[int] = None,
    output_size: Optional[int] = None,
) -> None:
    logger.info(
        f"ML Operation: {operation} using {model} - {'Success' if success else 'Failed'} ({duration_ms:.2f}ms)",
        extra={
            "type": "ml_operation",
            "operation": operation,
            "model": model,
            "duration_ms": duration_ms,
            "success": success,
            "input_size": input_size,
            "output_size": output_size,
        }
    )

def log_db_operation(
    operation: str,
    table: str,
    duration_ms: float,
    success: bool,
    rows_affected: Optional[int] = None,
) -> None:
    logger.debug(
        f"DB Operation: {operation} on {table} - {'Success' if success else 'Failed'} ({duration_ms:.2f}ms)",
        extra={
            "type": "db_operation",
            "operation": operation,
            "table": table,
            "duration_ms": duration_ms,
            "success": success,
            "rows_affected": rows_affected,
        }
    )

def log_social_api_call(
    platform: str,
    endpoint: str,
    duration_ms: float,
    success: bool,
    status_code: Optional[int] = None,
    error: Optional[str] = None,
) -> None:
    logger.info(
        f"Social API: {platform} {endpoint} - {'Success' if success else 'Failed'} ({duration_ms:.2f}ms)",
        extra={
            "type": "social_api",
            "platform": platform,
            "endpoint": endpoint,
            "duration_ms": duration_ms,
            "success": success,
            "status_code": status_code,
            "error": error,
        }
    )

def log_system_event(
    event_type: str,
    message: str,
    severity: str = "info",
    data: Optional[Dict[str, Any]] = None,
) -> None:
    level_map = {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warning": logging.WARNING,
        "error": logging.ERROR,
        "critical": logging.CRITICAL,
    }
    
    log_level = level_map.get(severity, logging.INFO)
    
    logger.log(
        log_level,
        f"System Event: {event_type} - {message}",
        extra={
            "type": "system_event",
            "event_type": event_type,
            "severity": severity,
            "data": data or {},
        }
    )

def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ConsoleFormatter())
    root_logger.addHandler(console_handler)
    
    logger.info(
        f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} starting...",
        extra={"environment": settings.ENVIRONMENT}
    )
    
    return logger

__all__ = [
    "get_logger",
    "logger",
    "setup_logging",
    "get_correlation_id",
    "set_correlation_id",
    "get_request_id",
    "set_request_id",
    "get_user_id",
    "set_user_id",
    "LogContext",
    "LoggerMixin",
    "log_performance",
    "log_error",
    "log_request",
    "log_search",
    "log_ml_operation",
    "log_db_operation",
    "log_social_api_call",
    "log_system_event",
]