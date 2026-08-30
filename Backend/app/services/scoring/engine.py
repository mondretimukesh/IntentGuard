"""
Pure, Isolated 6-Factor Risk Scoring Engine.
Calculates overall and dimensional risk scores from static evidence and ML classification.
"""
from typing import Dict, Any, Tuple
from app.schemas.evidence import EvidenceJson, MLPrediction
from app.schemas.settings import CapabilityTuningWeights, RiskWeights


def calculate_capability_risk(
    evidence: EvidenceJson,
    tuning: CapabilityTuningWeights
) -> float:
    """Compute capability risk score (0-100) using dynamic tuning weights."""
    score = 0.0
    hooks = evidence.hooks

    if hooks.accessibilityService:
        score += tuning.accessibility_service
    if hooks.systemOverlayWindow:
        score += tuning.system_overlay
    if hooks.notificationListener:
        score += tuning.notification_access
    if hooks.smsAccess:
        score += tuning.sms_access
    if hooks.bootPersistence:
        score += tuning.boot_persistence
    
    # Check for suspicious networking / reflection in API calls
    has_networking = any(
        "http" in s.lower() or "socket" in s.lower() or "telemetry" in s.lower()
        for s in evidence.suspiciousStrings
    )
    has_reflection = any(
        "reflect" in a.lower() or "classloader" in a.lower()
        for a in evidence.suspiciousApiCalls
    )
    if has_networking or has_reflection:
        score += tuning.suspicious_networking

    return min(100.0, max(0.0, float(score)))


def calculate_purpose_mismatch(evidence: EvidenceJson) -> float:
    """
    Compute purpose mismatch score (0-100) by comparing declared app category
    with requested dangerous capabilities.
    """
    category = (evidence.declaredCategory or "Unknown").lower()
    hooks = evidence.hooks
    perm_names = [p.name for p in evidence.permissions]

    score = 0.0

    # Offline / Basic categories (Calculator, Clock, Flashlight)
    if category in ["calculator", "clock", "flashlight", "wallpaper"]:
        if hooks.smsAccess or "android.permission.READ_SMS" in perm_names:
            score += 40.0
        if hooks.accessibilityService:
            score += 35.0
        if hooks.systemOverlayWindow:
            score += 25.0
        if hooks.notificationListener:
            score += 20.0

    # Utility / Tool Category
    elif category in ["utility", "tools", "system"]:
        if hooks.accessibilityService and hooks.systemOverlayWindow:
            score += 65.0
        elif hooks.accessibilityService or hooks.systemOverlayWindow:
            score += 35.0
        if hooks.smsAccess:
            score += 30.0

    # Messaging / Social Category
    elif category in ["messaging", "communication", "social"]:
        # SMS is normal, but overlay and accessibility are unexpected
        if hooks.accessibilityService:
            score += 35.0
        if hooks.systemOverlayWindow:
            score += 30.0

    # Default / Unknown
    else:
        if hooks.accessibilityService:
            score += 30.0
        if hooks.systemOverlayWindow:
            score += 25.0
        if hooks.smsAccess:
            score += 20.0

    return min(100.0, max(0.0, float(score)))


def calculate_behavioral_anomalies(evidence: EvidenceJson) -> float:
    """Compute behavioral anomalies score (0-100) from persistence and dynamic execution hooks."""
    score = 0.0
    hooks = evidence.hooks

    if hooks.bootPersistence:
        score += 25.0

    # Hidden or multiple unexported receivers
    if len(hooks.hiddenReceivers) > 0:
        score += min(35.0, len(hooks.hiddenReceivers) * 15.0)

    # Suspicious API calls (reflection, DexClassLoader, weak ciphers)
    if len(evidence.suspiciousApiCalls) > 0:
        score += min(40.0, len(evidence.suspiciousApiCalls) * 15.0)

    return min(100.0, max(0.0, float(score)))


def calculate_fraud_pathway(evidence: EvidenceJson) -> float:
    """
    Compute fraud pathway score (0-100) detecting synergistic attack chains
    (e.g., Overlay + SMS OTP theft + Accessibility auto-execution).
    """
    hooks = evidence.hooks
    has_overlay = hooks.systemOverlayWindow
    has_sms = hooks.smsAccess or hooks.notificationListener
    has_accessibility = hooks.accessibilityService

    # 1. Full Takeover Triad: Overlay + SMS/Notification + Accessibility
    if has_overlay and has_sms and has_accessibility:
        return 100.0

    # 2. Overlay + SMS Interception (Credential Theft + OTP Bypass)
    if has_overlay and has_sms:
        return 80.0

    # 3. Overlay + Accessibility (UI Hijack & Keylogging)
    if has_overlay and has_accessibility:
        return 75.0

    # 4. SMS + Notification Listener (Dual 2FA Interception)
    if hooks.smsAccess and hooks.notificationListener:
        return 60.0

    # 5. Single High-Threat Vector
    if has_accessibility:
        return 40.0
    if has_overlay:
        return 35.0
    if has_sms:
        return 30.0

    return 0.0


def calculate_certificate_reputation(evidence: EvidenceJson) -> float:
    """Compute certificate reputation risk score (0-100) (100 = highest risk)."""
    cert = evidence.certificate
    score = 0.0

    if cert.selfSigned:
        score += 50.0

    if "debug" in cert.issuer.lower() or "debug" in cert.subject.lower():
        score += 25.0

    if cert.signingKeyAgeDays < 30:
        score += 25.0
    elif cert.signingKeyAgeDays < 90:
        score += 15.0

    return min(100.0, max(0.0, float(score)))


def classify_risk_level(score: float, thresholds: Dict[str, int] = None) -> Tuple[str, str]:
    """Map numeric risk score to qualitative level and display title."""
    t = thresholds or {"critical": 80, "high": 60, "review": 40}

    if score >= t.get("critical", 80):
        return "critical", "Critical Threat (Device Takeover Vector)"
    elif score >= t.get("high", 60):
        return "high", "High Risk (Suspicious Capabilities)"
    elif score >= t.get("review", 40):
        return "review", "Review Required (Anomalous Signals)"
    else:
        return "low", "Low Risk (Clean Profile)"


def compute_six_factor_score(
    evidence: EvidenceJson,
    ml_pred: MLPrediction,
    tuning: CapabilityTuningWeights = None,
    weights: RiskWeights = None,
    thresholds: Dict[str, int] = None
) -> Dict[str, Any]:
    """
    Execute the pure 6-Factor Risk Scoring Engine.
    
    Formula:
    R = w1*MalwareEvidence + w2*CapabilityRisk + w3*PurposeMismatch +
        w4*BehavioralAnomalies + w5*FraudPathway + w6*CertificateReputation
    """
    t_weights = tuning or CapabilityTuningWeights()
    r_weights = weights or RiskWeights()

    # 1. Compute 6 Dimensional Sub-scores (0-100 each)
    s_malware = round(min(100.0, max(0.0, ml_pred.malwareProbability * 100.0)), 2)
    s_capability = round(calculate_capability_risk(evidence, t_weights), 2)
    s_purpose = round(calculate_purpose_mismatch(evidence), 2)
    s_behavior = round(calculate_behavioral_anomalies(evidence), 2)
    s_fraud = round(calculate_fraud_pathway(evidence), 2)
    s_cert = round(calculate_certificate_reputation(evidence), 2)

    # 2. Weighted Sum
    overall_score = (
        r_weights.malware_evidence * s_malware +
        r_weights.capability_risk * s_capability +
        r_weights.purpose_mismatch * s_purpose +
        r_weights.behavioral_anomalies * s_behavior +
        r_weights.fraud_pathway * s_fraud +
        r_weights.certificate_reputation * s_cert
    )

    # Clamp overall score to [0, 100]
    final_score = int(round(min(100.0, max(0.0, overall_score))))
    risk_level, risk_classification = classify_risk_level(final_score, thresholds)

    # 3. Construct Risk Components Breakdown
    risk_components = [
        {
            "id": "malwareEvidence",
            "name": "Malware Evidence",
            "score": int(s_malware),
            "weight": r_weights.malware_evidence,
            "color": "#EF4444" if s_malware >= 70 else "#F59E0B" if s_malware >= 40 else "#10B981",
            "description": "ML Bytecode pattern & classifier probability",
        },
        {
            "id": "capabilityRisk",
            "name": "Capability Risk",
            "score": int(s_capability),
            "weight": r_weights.capability_risk,
            "color": "#EF4444" if s_capability >= 70 else "#F59E0B" if s_capability >= 40 else "#10B981",
            "description": "High-privilege system hooks & accessibility abuse",
        },
        {
            "id": "purposeMismatch",
            "name": "Purpose Mismatch",
            "score": int(s_purpose),
            "weight": r_weights.purpose_mismatch,
            "color": "#EF4444" if s_purpose >= 70 else "#F59E0B" if s_purpose >= 40 else "#10B981",
            "description": "Declared application function vs requested permissions",
        },
        {
            "id": "behavioralAnomalies",
            "name": "Behavioral Anomalies",
            "score": int(s_behavior),
            "weight": r_weights.behavioral_anomalies,
            "color": "#EF4444" if s_behavior >= 70 else "#F59E0B" if s_behavior >= 40 else "#10B981",
            "description": "Boot persistence, hidden receivers, dynamic class loading",
        },
        {
            "id": "fraudPathway",
            "name": "Fraud Pathway",
            "score": int(s_fraud),
            "weight": r_weights.fraud_pathway,
            "color": "#EF4444" if s_fraud >= 70 else "#F59E0B" if s_fraud >= 40 else "#10B981",
            "description": "Synergistic overlay + SMS + accessibility takeover chains",
        },
        {
            "id": "certificateReputation",
            "name": "Certificate Reputation",
            "score": int(s_cert),
            "weight": r_weights.certificate_reputation,
            "color": "#EF4444" if s_cert >= 70 else "#F59E0B" if s_cert >= 40 else "#10B981",
            "description": "Signer key trust, age, and self-signed certificate rating",
        },
    ]

    return {
        "overallRiskScore": final_score,
        "riskScore": final_score,
        "riskLevel": risk_level,
        "riskClassification": risk_classification,
        "subScores": {
            "malwareEvidence": s_malware,
            "capabilityRisk": s_capability,
            "purposeMismatch": s_purpose,
            "behavioralAnomalies": s_behavior,
            "fraudPathway": s_fraud,
            "certificateReputation": s_cert,
        },
        "riskComponents": risk_components,
        "sixFactorBreakdown": risk_components,
    }
