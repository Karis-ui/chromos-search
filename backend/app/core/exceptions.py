from fastapi import status
from fastapi.responses import JSONResponse
from typing import Optional, Dict,Any, List

class ChronosException(Exception):
    def __init__(self, message: str, error_code: str = "CHRONOS_ERROR", status_code: int = status.HTTP_400_BAD_REQUEST, details: Optional[Any] = None, context: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        self.context = context or {}
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        error_response = {
            "error_code": self.error_code,
            "message": self.message,
            "status_code": self.status_code,
            "details": self.details,
            "context": self.context
        }
        if self.details is not None:
            error_response["details"] = self.details
        return error_response
    
ChromosException = ChronosException

class UnauthorizedException(ChronosException):
    def __init__(self, message: str = "Unauthorized", error_code: str = "UNAUTHORIZED", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_401_UNAUTHORIZED, details)
    
class ForbiddenException(ChromosException):
    def __init__(self, message: str = "Forbidden", error_code: str = "FORBIDDEN", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_403_FORBIDDEN, details)
    
class NotFoundException(ChromosException):
    def __init__(self, message: str = "Not Found", error_code: str = "NOT_FOUND", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_404_NOT_FOUND, details)

class ConflictException(ChromosException):
    def __init__(self, message: str = "Resource Conflict", error_code: str = "CONFLICT", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_409_CONFLICT, details)
    
class UnprocessableEntityException(ChromosException):
    def __init__(self, message: str = "Unprocessable Entity", error_code: str = "UNPROCESSABLE_ENTITY", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_422_UNPROCESSABLE_ENTITY, details)
    
class RateLimitException(ChromosException):
    def __init__(self, message: str = "Rate Limit Exceeded", error_code: str = "RATE_LIMIT_EXCEEDED", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_429_TOO_MANY_REQUESTS, details=details or {"retry_after": 60})  
        
class ValidationException(ChromosException):
    def __init__(self, message: str = "Validation Error", error_code: str = "VALIDATION_ERROR", details: Optional[Dict[str, Any]] = None,errors:Optional[List[Dict[str, Any]]] = None):
        super().__init__(message, error_code, status.HTTP_422_UNPROCESSABLE_ENTITY, details=details or {"errors": errors or []})
        
class SearchException(ChromosException):
    def __init__(self, message: str = "Search Error", error_code: str = "SEARCH_ERROR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_500_INTERNAL_SERVER_ERROR, details)
        
class MLException(ChromosException):
    def __init__(self, message: str = "ML Processing Error", error_code: str = "ML_ERROR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_500_INTERNAL_SERVER_ERROR, details)
    
class SocialAPIException(ChromosException):
    def __init__(self, message: str = "Social API Error", error_code: str = "SOCIAL_API_ERROR", platform: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_502_BAD_GATEWAY, details=details or {"platform": platform})
        self.platform = platform

class DatabaseException(ChromosException):
    def __init__(self, message: str = "Database Error", error_code: str = "DATABASE_ERROR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_500_INTERNAL_SERVER_ERROR, details)
    
class CacheException(ChromosException):
    def __init__(self, message: str = "Cache Error", error_code: str = "CACHE_ERROR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code, status.HTTP_500_INTERNAL_SERVER_ERROR, details)

class BadRequestException(ChronosException):
    def __init__(self, message: str = "Bad Request", error_code: str = "BAD_REQUEST", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )
        
class ExceptionHandlerFactory:
    @staticmethod
    def create_exception_handler(exception_class: type) -> callable:
        def handler(request, exc):
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.to_dict()
            )
        return handler
    
def format_error_response(exc: ChronosException) -> Dict[str, Any]:
    return {
        "error_code": exc.error_code,
        "message": exc.message,
        "status_code": exc.status_code,
        "details": exc.details,
        "context": exc.context,
    }

__all__ = [
    "ChronosException",
    "ChromosException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "NotFoundException",
    "ConflictException",
    "UnprocessableEntityException",
    "RateLimitException",
    "ValidationException",
    "SearchException",
    "MLException",
    "SocialAPIException",
    "DatabaseException",
    "CacheException",
    "ExceptionHandlerFactory",
    "format_error_response",
]