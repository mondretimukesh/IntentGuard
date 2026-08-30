from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Boolean, DateTime, JSON
from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


DEFAULT_CAPABILITY_TUNING = {
    "accessibilityService": 30,
    "systemOverlay": 25,
    "notificationAccess": 15,
    "smsAccess": 15,
    "bootPersistence": 10,
    "suspiciousNetworking": 10,
}

DEFAULT_RISK_WEIGHTS = {
    "malwareEvidence": 0.30,
    "capabilityRisk": 0.25,
    "purposeMismatch": 0.15,
    "behavioralAnomalies": 0.15,
    "fraudPathway": 0.10,
    "certificateReputation": 0.05,
}

DEFAULT_THREAT_INTEL_SOURCES = [
    {"name": "VirusTotal Intelligence v3", "status": "connected", "lastSynced": "2 mins ago"},
    {"name": "MalwareBazaar CTI Feed", "status": "connected", "lastSynced": "5 mins ago"},
    {"name": "AbuseIPDB Global Blacklist", "status": "connected", "lastSynced": "12 mins ago"},
    {"name": "MISP Threat Exchange Node", "status": "connected", "lastSynced": "1 hour ago"},
]

DEFAULT_GLOBAL_THRESHOLDS = {
    "critical": 80,
    "high": 60,
    "review": 40,
    "rateLimit": 100,
}


class SystemSetting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    auto_delete_apks = Column(Boolean, default=True, nullable=False)
    retain_history = Column(Boolean, default=True, nullable=False)
    capability_tuning = Column(JSON, default=lambda: DEFAULT_CAPABILITY_TUNING, nullable=False)
    risk_weights = Column(JSON, default=lambda: DEFAULT_RISK_WEIGHTS, nullable=False)
    threat_intel_sources = Column(JSON, default=lambda: DEFAULT_THREAT_INTEL_SOURCES, nullable=False)
    global_thresholds = Column(JSON, default=lambda: DEFAULT_GLOBAL_THRESHOLDS, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
