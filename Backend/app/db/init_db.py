import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.settings import SystemSetting
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


async def init_db(db: AsyncSession) -> None:
    """Initialize database tables and seed default admin user and system settings."""
    # Check default admin user
    result = await db.execute(select(User).where(User.email == settings.DEFAULT_ADMIN_EMAIL))
    admin = result.scalars().first()
    
    if not admin:
        admin_user = User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            full_name=settings.DEFAULT_ADMIN_NAME,
            hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            role="admin",
            organization="CTI Core Operations",
            status="active",
        )
        db.add(admin_user)
        logger.info("Created default system administrator: %s", settings.DEFAULT_ADMIN_EMAIL)
        
        # Initial audit log
        init_log = AuditLog(
            user_email=settings.DEFAULT_ADMIN_EMAIL,
            role="admin",
            action="System Initialized",
            event="System Initialized",
            details="Default platform admin created and database schema initialized.",
            ip_address="127.0.0.1",
            severity="info",
            timestamp=utcnow()
        )
        db.add(init_log)

    # Check system settings
    settings_result = await db.execute(select(SystemSetting).where(SystemSetting.id == 1))
    system_setting = settings_result.scalars().first()
    
    if not system_setting:
        new_settings = SystemSetting(id=1)
        db.add(new_settings)
        logger.info("Initialized default system settings and risk formulas.")
        
    await db.commit()
