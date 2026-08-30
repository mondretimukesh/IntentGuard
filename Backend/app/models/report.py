import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, JSON
from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    job_id = Column(String(36), index=True, nullable=False)
    package_name = Column(String(255), index=True, nullable=False)
    app_name = Column(String(255), nullable=False)
    version = Column(String(50), default="1.0.0", nullable=False)
    sha256 = Column(String(64), index=True, nullable=False)
    file_size = Column(String(50), default="0 MB", nullable=False)
    risk_score = Column(Integer, default=0, nullable=False)
    risk_level = Column(String(50), default="low", index=True, nullable=False)  # "low" | "review" | "high" | "critical"
    risk_classification = Column(String(100), default="Low Risk (Clean Profile)", nullable=False)
    full_report_json = Column(JSON, default=dict, nullable=False)
    pdf_path = Column(String(512), nullable=True)
    user_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
