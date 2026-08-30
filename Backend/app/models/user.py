import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user" | "admin"
    organization = Column(String(255), default="General Analyst", nullable=False)
    status = Column(String(50), default="active", nullable=False)  # "active" | "suspended"
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    @property
    def is_active(self) -> bool:
        return self.status == "active"

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"
