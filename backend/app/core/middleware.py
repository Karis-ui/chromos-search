from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
from typing import Dict, Any, Optional, List
import time
import uuid
import logging
from contextvars import ContextVar
from app.core.config import settings
from app.core.security import get_secure_headers
from app.core.logger import get_correlation_id, set_correlation_id

logger = logging.getLogger(__name__)

class CorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
        for header, value in get_secure_headers().items():
            request.headers[header] = value
        set_correlation_id(correlation_id)
        request.state.correlation_id = correlation_id
        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        correlation_id = get_correlation_id()
        logger.info(
            f"Request: {request.method} {request.url.path} with correlation ID: {correlation_id}",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("User-Agent"),
            }
        )
        response: Response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            f"Request: {request.method} {request.url.path} completed in {process_time:.4f}s with status code {response.status_code}",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("User-Agent"),
                "status_code": response.status_code,
                "process_time": process_time,
            }
        )
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        for header, value in get_secure_headers().items():
            response.headers[header] = value
        return response
    
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 100, time_window: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.requests: Dict[str, List[float]] = {}
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/docs", "/openapi.json","/favcon.icon"]:
            return await call_next(request)
        client_ip = request.client.host if request.client else "unknown"
        key = f"Rate limit: global:{client_ip}"
        
        from app.core.security import RateLimiter
        rate_limiter = RateLimiter(self.rate_limit, self.time_window)
        allowed,headers = await rate_limiter.is_allowed(key,limit=self.rate_limit,window=self.time_window,period=settings.RATE_LIMIT_PERIOD)
        if not allowed:
            return Response(status_code=429, content="Too Many Requests")
        response: Response = await call_next(request)
        
        for key ,value in headers.items():
            response.headers[key] = value
        return response
    
class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response: Response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = get_correlation_id()
        return response

def setup_middlewares(app):
    app.add_middleware(CorrelationMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"] if settings.DEBUG else settings.TRUSTED_HOSTS)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1024)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware, rate_limit=settings.RATE_LIMIT, time_window=settings.RATE_LIMIT_WINDOW)
    app.add_middleware(TimingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app

__all__ = [
    "CorrelationMiddleware",
    "RequestLoggingMiddleware",
    "SecurityHeadersMiddleware",
    "RateLimitMiddleware",
    "TimingMiddleware",
    "setup_middlewares"
]