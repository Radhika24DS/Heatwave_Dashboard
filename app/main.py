from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.api import api_router
from app.api.v1.health import router as health_router
from app.utils.responses import standard_response

# Initialize logging configuration
setup_logging()
logger = logging.getLogger("app.main")

# Build FastAPI app instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount health check endpoint at both root level (/) and v1 (for load balancers)
app.include_router(health_router)

# Mount versioned routers under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Global Exception Handler for Starlette/FastAPI HTTPExceptions
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP exception on {request.url.path}: status={exc.status_code}, detail={exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=standard_response(
            status="error",
            data=None,
            message=exc.detail
        )
    )

# Global Exception Handler for Pydantic Schema Validation Failures
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation failure on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=standard_response(
            status="error",
            data=exc.errors(),
            message="Request validation failed"
        )
    )

# Catch-all Exception Handler for internal system exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=standard_response(
            status="error",
            data=None,
            message="An unexpected system error occurred. Please try again later."
        )
    )
