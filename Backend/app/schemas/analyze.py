from typing import List, Optional
from app.schemas.base import CamelModel


class AnalyzeResponse(CamelModel):
    job_id: str
    sha256: str


class LogMessage(CamelModel):
    timestamp: str
    level: str  # "INFO" | "WARN" | "ERROR" | "SUCCESS"
    message: str
    color: Optional[str] = None


class JobStatusResponse(CamelModel):
    job_id: str
    status: str  # "queued" | "validating" | "static_analysis" | "purpose_matching" | "transparency_eval" | "ml_classification" | "threat_intel" | "risk_scoring" | "complete" | "failed"
    current_step: str
    logs: List[LogMessage] = []
    estimated_time_remaining: int = 0
    sha256: Optional[str] = None
    report_id: Optional[str] = None
    error: Optional[str] = None
