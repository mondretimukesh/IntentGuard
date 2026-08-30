import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Determine initial database URL
initial_db_url = settings.DATABASE_URL
connect_args = {}
if initial_db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    initial_db_url,
    echo=False,
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


def fallback_to_sqlite():
    global engine, AsyncSessionLocal
    logger.warning("Falling back database engine to local standalone SQLite: sqlite+aiosqlite:///./intentguard.db")
    engine = create_async_engine(
        "sqlite+aiosqlite:///./intentguard.db",
        echo=False,
        future=True,
        connect_args={"check_same_thread": False},
    )
    AsyncSessionLocal.configure(bind=engine)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
