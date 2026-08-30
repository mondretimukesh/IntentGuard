import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging, RequestIdMiddleware
from app.api import api_router
import app.db.session as db_session_module
from app.db.session import Base
from app.db.init_db import init_db

# Initialize Structured Logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup initialization and graceful shutdown."""
    # Attempt table creation on configured DB, fallback to SQLite if PostgreSQL not running
    try:
        async with db_session_module.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with db_session_module.AsyncSessionLocal() as session:
            await init_db(session)
    except Exception as e:
        logger.warning("Primary database connection could not be established (%s). Initializing embedded SQLite standalone database.", e)
        db_session_module.fallback_to_sqlite()
        async with db_session_module.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with db_session_module.AsyncSessionLocal() as session:
            await init_db(session)

    yield

    # Teardown
    await db_session_module.engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Android Malware & Financial Risk Analysis Platform Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(RequestIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Disposition"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
