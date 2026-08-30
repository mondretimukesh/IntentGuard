import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text, JSON
from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    sha256 = Column(String(64), index=True, nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    file_path = Column(String(512), nullable=True)
    status = Column(String(50), default="queued", index=True, nullable=False)
    current_step = Column(String(100), default="Job Queued", nullable=False)
    estimated_time_remaining = Column(Integer, default=15, nullable=False)
    logs = Column(JSON, default=list, nullable=False)
    report_id = Column(String(36), nullable=True)
    error = Column(Text, nullable=True)
    user_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
