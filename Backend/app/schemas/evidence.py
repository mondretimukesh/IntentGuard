"""
Static Analyzer and ML & Risk Engine Data Contracts.
These models represent the exact frozen data shapes exchanged between
the Static Analyzer teammate, ML teammate, and backend scoring pipeline.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Permission(BaseModel):
    name: str                           # e.g. "android.permission.SYSTEM_ALERT_WINDOW"
    protectionLevel: str = "normal"     # "normal" | "dangerous" | "signature"
    declared: bool = True
    requestedAtRuntime: bool = False


class CertificateInfo(BaseModel):
    issuer: str
    subject: str
    sha256Fingerprint: str
    validFrom: str
    validTo: str
    selfSigned: bool = False
    signingKeyAgeDays: int = 365


class HighPrivilegeHooks(BaseModel):
    accessibilityService: bool = False
    systemOverlayWindow: bool = False
    notificationListener: bool = False
    smsAccess: bool = False
    bootPersistence: bool = False
    hiddenReceivers: List[str] = Field(default_factory=list)


class EvidenceJson(BaseModel):
    packageName: str
    appName: str
    fileSizeBytes: int
    sha256: str
    manifestXml: str
    declaredCategory: Optional[str] = None  # e.g. "Utility", "Banking", "Calculator", "Messaging"
    permissions: List[Permission] = Field(default_factory=list)
    hooks: HighPrivilegeHooks = Field(default_factory=HighPrivilegeHooks)
    certificate: CertificateInfo
    suspiciousStrings: List[str] = Field(default_factory=list)      # hardcoded URLs, banking keywords, etc.
    suspiciousApiCalls: List[str] = Field(default_factory=list)     # reflection, dynamic code loading, crypto misuse


class MLPrediction(BaseModel):
    malwareProbability: float           # 0.0–1.0, from Random Forest
    predictedLabel: str                 # e.g. "malware" | "benign" | "suspicious"
    confidence: float                   # 0.0–1.0
    topFeatureContributions: Optional[List[Dict[str, Any]]] = None  # explainable feature importance
