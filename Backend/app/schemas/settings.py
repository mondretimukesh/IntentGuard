from typing import Optional, List, Dict
from app.schemas.base import CamelModel


class CapabilityTuningWeights(CamelModel):
    accessibility_service: int = 30
    system_overlay: int = 25
    notification_access: int = 15
    sms_access: int = 15
    boot_persistence: int = 10
    suspicious_networking: int = 10


class RiskWeights(CamelModel):
    malware_evidence: float = 0.30
    capability_risk: float = 0.25
    purpose_mismatch: float = 0.15
    behavioral_anomalies: float = 0.15
    fraud_pathway: float = 0.10
    certificate_reputation: float = 0.05


class ThreatIntelSource(CamelModel):
    name: str
    status: str  # "connected" | "unknown"
    last_synced: str


class AppSettings(CamelModel):
    auto_delete_apks: bool = True
    retain_history: bool = True
    capability_tuning: CapabilityTuningWeights = CapabilityTuningWeights()


class UpdateAppSettingsRequest(CamelModel):
    auto_delete_apks: Optional[bool] = None
    retain_history: Optional[bool] = None
    capability_tuning: Optional[CapabilityTuningWeights] = None
