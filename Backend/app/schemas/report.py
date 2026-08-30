from typing import List, Optional, Any, Dict
from pydantic import Field
from app.schemas.base import CamelModel


class RiskComponent(CamelModel):
    id: str
    name: str
    score: int  # 0-100
    weight: float  # 0-1
    color: str
    description: Optional[str] = None


class EvidenceItem(CamelModel):
    id: str
    title: str
    description: str
    severity: str  # "critical" | "high" | "medium" | "low"
    icon: str


class ReportPermission(CamelModel):
    name: str
    category: str  # "expected" | "questionable" | "unexpected"
    justification: str
    protection_level: Optional[str] = "normal"
    is_dangerous: Optional[bool] = False


class AttackStep(CamelModel):
    id: str
    label: str
    icon: str
    description: str
    severity: str  # "critical" | "high" | "medium" | "low"


class AttackPathway(CamelModel):
    title: str
    steps: List[AttackStep] = []
    summary: str


class Recommendation(CamelModel):
    id: str
    title: str
    guidance: str
    severity: str  # "critical" | "warning" | "info"
    icon: str


class PipelineStep(CamelModel):
    id: int
    status_code: Optional[str] = None
    name: str
    status: str  # "completed" | "active" | "pending"
    description: Optional[str] = None


class AnalysisReport(CamelModel):
    job_id: str
    package_name: str
    app_name: str
    version: str = "1.0.0"
    sha256: str
    file_size: str
    risk_score: int
    overall_risk_score: Optional[int] = None
    risk_level: str  # "low" | "review" | "high" | "critical" | "insufficient"
    risk_classification: str
    risk_components: List[RiskComponent] = []
    six_factor_breakdown: Optional[List[RiskComponent]] = None
    evidence: List[EvidenceItem] = []
    evidence_list: Optional[List[EvidenceItem]] = None
    permissions: List[ReportPermission] = []
    declared_permissions: Optional[List[ReportPermission]] = None
    attack_pathway: AttackPathway
    attack_pathways: Optional[List[AttackPathway]] = None
    recommendations: List[Recommendation] = []
    pipeline_steps: List[PipelineStep] = []
    scan_date: str
    analyzed_at: Optional[str] = None
    manifest_xml: Optional[str] = None
