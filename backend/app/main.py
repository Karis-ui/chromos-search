from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import time
import uuid

from app.core.config import settings
from app.core.logger import setup_logging, logger, set_correlation_id, get_correlation_id
from app.core.database import init_db, check_database_health
from app.core.redis_client import RedisConnectionPool
from app.core.middleware import setup_middleware
from app.api.v1.router import router as api_v1_router
from app.core.exceptions import ChronosException, format_error_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    try:
        await init_db(create_tables=True)
        logger.info("✅ Database initialized")
        
        db_health = await check_database_health()
        logger.info(f"✅ Database health: {db_health['status']}")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
    
    try:
        redis_client = await RedisConnectionPool.get_client()
        await redis_client.ping()
        logger.info("✅ Redis connection established")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {str(e)}")
    
    logger.info(f"✅ {settings.PROJECT_NAME} is ready!")
    logger.info(f"📍 API: http://{settings.HOST}:{settings.PORT}{settings.API_V1_STR}")
    logger.info(f"📍 Docs: http://{settings.HOST}:{settings.PORT}/docs")
    
    yield
    
    logger.info(f"🛑 {settings.PROJECT_NAME} shutting down...")
    
    from app.core.database import get_async_engine
    await get_async_engine().dispose()
    logger.info("✅ Database connections closed")
    
    await RedisConnectionPool.close()
    logger.info("✅ Redis connections closed")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.VERSION,
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID", "X-Response-Time"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"] if settings.DEBUG else settings.ALLOWED_ORIGINS,
    )
    
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        correlation_id = request.headers.get("X-Correlation-ID")
        if not correlation_id:
            correlation_id = request_id
        set_correlation_id(correlation_id)
        
        start_time = time.time()
        
        response = await call_next(request)
        
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Response-Time"] = f"{(time.time() - start_time) * 1000:.2f}ms"
        
        return response
    
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        correlation_id = get_correlation_id()
        
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
            }
        )
        
        response = await call_next(request)
        
        logger.info(
            f"Response: {request.method} {request.url.path} -> {response.status_code}",
            extra={
                "correlation_id": correlation_id,
                "status_code": response.status_code,
            }
        )
        
        return response
    
    @app.exception_handler(ChronosException)
    async def chronos_exception_handler(request: Request, exc: ChronosException):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
            headers={"X-Correlation-ID": get_correlation_id()},
        )
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        correlation_id = get_correlation_id()
        logger.error(
            f"Unhandled exception: {str(exc)}",
            extra={"correlation_id": correlation_id},
            exc_info=True,
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=format_error_response(
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={"correlation_id": correlation_id},
            ),
            headers={"X-Correlation-ID": correlation_id},
        )
    
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)
    
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "docs": "/docs" if settings.DEBUG else None,
        }
    
    @app.get("/health", tags=["Health"])
    async def health():
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "timestamp": time.time(),
        }
    
    return app

app = create_app()

__all__ = ["app"]