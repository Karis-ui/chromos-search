import os
from typing import AsyncGenerator, Generator, Optional, Dict, Any
from contextlib import asynccontextmanager, contextmanager
from sqlalchemy import create_engine, MetaData, event, text
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool, QueuePool
from sqlalchemy.exc import SQLAlchemyError, OperationalError
import logging
import asyncio
from functools import wraps
import time

from app.core.config import settings
from app.core.exceptions import DatabaseException
from app.core.logger import logger, log_db_operation

Base = declarative_base()

async_engine: Optional[AsyncEngine] = None

def get_async_engine() -> AsyncEngine:
    global async_engine
    
    if async_engine is None:
        logger.info(f"🔌 Creating async database engine for {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
        
        try:
            async_engine = create_async_engine(
                settings.DATABASE_URL,
                echo=settings.POSTGRES_ECHO,
                pool_size=settings.POSTGRES_POOL_SIZE,
                max_overflow=settings.POSTGRES_MAX_OVERFLOW,
                pool_timeout=settings.POSTGRES_POOL_TIMEOUT,
                pool_pre_ping=settings.POSTGRES_POOL_PRE_PING,
                pool_recycle=settings.POSTGRES_POOL_RECYCLE,
                poolclass=AsyncAdaptedQueuePool,
                connect_args={
                    "timeout": 30,
                    "command_timeout": 60,
                    "server_settings": {
                        "application_name": "chronos_search",
                        "timezone": "UTC",
                    }
                }
            )
            
            @event.listens_for(async_engine.sync_engine, "connect")
            def connect(dbapi_connection, connection_record):
                logger.debug("Database connection established")
            
            @event.listens_for(async_engine.sync_engine, "checkout")
            def checkout(dbapi_connection, connection_record, connection_proxy):
                logger.debug("Database connection checked out")
            
            @event.listens_for(async_engine.sync_engine, "close")
            def close(dbapi_connection, connection_record):
                logger.debug("Database connection closed")
            
            logger.info("✅ Database engine created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create database engine: {str(e)}", exc_info=True)
            raise DatabaseException(
                message="Database connection failed",
                details={"error": str(e)}
            )
    
    return async_engine

AsyncSessionLocal = async_sessionmaker(
    get_async_engine(),
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=False,
    pool_size=5,
    pool_recycle=3600,
    pool_pre_ping=True,
    poolclass=QueuePool,
)

SyncSessionLocal = sessionmaker(
    sync_engine,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database transaction failed: {str(e)}", exc_info=True)
            raise
        finally:
            await session.close()

@asynccontextmanager
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()

@contextmanager
def get_sync_db() -> Generator[Session, None, None]:
    session = SyncSessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
        
def retry_db_operation(max_retries: int = 3, delay: float = 0.5):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except OperationalError as e:
                    last_exception = e
                    if "could not connect" in str(e) or "connection" in str(e).lower():
                        if attempt < max_retries - 1:
                            wait_time = delay * (2 ** attempt)
                            logger.warning(
                                f"Database connection error (attempt {attempt + 1}/{max_retries}), "
                                f"retrying in {wait_time:.2f}s: {str(e)}"
                            )
                            await asyncio.sleep(wait_time)
                            continue
                    raise
                except Exception as e:
                    raise
            
            if last_exception:
                raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except OperationalError as e:
                    last_exception = e
                    if "could not connect" in str(e) or "connection" in str(e).lower():
                        if attempt < max_retries - 1:
                            wait_time = delay * (2 ** attempt)
                            logger.warning(
                                f"Database connection error (attempt {attempt + 1}/{max_retries}), "
                                f"retrying in {wait_time:.2f}s: {str(e)}"
                            )
                            time.sleep(wait_time)
                            continue
                    raise
                except Exception as e:
                    raise
            
            if last_exception:
                raise last_exception
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

async def check_database_health() -> Dict[str, Any]:
    start_time = time.time()
    result = {
        "status": "healthy",
        "connected": False,
        "response_time_ms": 0,
        "details": {}
    }
    
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            result["connected"] = True
            
            timescale_check = await session.execute(
                text("SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'")
            )
            timescale_version = timescale_check.scalar()
            if timescale_version:
                result["details"]["timescaledb_version"] = timescale_version
            
            version_check = await session.execute(text("SELECT version()"))
            version = version_check.scalar()
            if version:
                result["details"]["postgresql_version"] = version.split()[1] if version else "unknown"
            
            conn_check = await session.execute(
                text("SELECT count(*) FROM pg_stat_activity")
            )
            result["details"]["active_connections"] = conn_check.scalar()
            
            table_check = await session.execute(
                text("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
            )
            result["details"]["table_count"] = table_check.scalar()
            
    except Exception as e:
        result["status"] = "unhealthy"
        result["details"]["error"] = str(e)
        logger.error(f"Database health check failed: {str(e)}")
    
    result["response_time_ms"] = (time.time() - start_time) * 1000
    
    return result

async def init_db(create_tables: bool = True) -> None:
    try:
        async with get_async_engine().begin() as conn:
            # Enable TimescaleDB extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE"))
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            
            if create_tables:
                await conn.run_sync(Base.metadata.create_all)
            
            logger.info("✅ Database initialized successfully")
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}", exc_info=True)
        raise DatabaseException(
            message="Database initialization failed",
            details={"error": str(e)}
        )

async def drop_all_tables() -> None:
    try:
        async with get_async_engine().begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        logger.warning("⚠️ All tables dropped")
    except Exception as e:
        logger.error(f"Failed to drop tables: {str(e)}", exc_info=True)
        raise

__all__ = [
    "Base",
    "get_async_engine",
    "AsyncSessionLocal",
    "get_db",
    "get_async_db",
    "get_sync_db",
    "retry_db_operation",
    "check_database_health",
    "init_db",
    "drop_all_tables",
]