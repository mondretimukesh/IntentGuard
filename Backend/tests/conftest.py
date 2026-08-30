import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import Base, get_db
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.settings import SystemSetting
from app.models.audit_log import AuditLog

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        # Seed test admin & test settings
        admin_user = User(
            id="admin_test_01",
            email="admin@intentguard.sec",
            full_name="Lead Admin",
            hashed_password=get_password_hash("AdminPassword123!"),
            role="admin",
            status="active",
        )
        session.add(admin_user)

        standard_user = User(
            id="user_test_01",
            email="analyst@intentguard.sec",
            full_name="Security Analyst",
            hashed_password=get_password_hash("AnalystPassword123!"),
            role="user",
            status="active",
        )
        session.add(standard_user)

        sys_setting = SystemSetting(id=1)
        session.add(sys_setting)

        await session.commit()

        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def admin_token() -> str:
    return create_access_token(subject="admin_test_01", role="admin")


@pytest.fixture
def user_token() -> str:
    return create_access_token(subject="user_test_01", role="user")
