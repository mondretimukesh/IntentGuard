import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: f"log_{uuid.uuid4().hex[:8]}", index=True)
    user_email = Column(String(255), nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    action = Column(String(255), nullable=False)
    event = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), default="127.0.0.1", nullable=False)
    severity = Column(String(50), default="info", nullable=False)
    timestamp = Column(DateTime, default=utcnow, nullable=False, index=True)
