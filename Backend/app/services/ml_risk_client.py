"""
========================================================================================
TEAMMATE INTEGRATION BOUNDARY: ML & RISK ENGINE CLIENT
========================================================================================
IMPORTANT NOTICE FOR TEAMMATES:
This is THE SECOND OF ONLY TWO FILES in the entire backend that will change when the
ML & Risk Engine Lead teammate integrates their pretrained Random Forest model
(e.g., trained on CICMalDroid with 470 numerical feature vectors).

Current Status: MOCKED
Integration Target: Replace the body of `get_ml_classification(evidence)` with the call
                    to your Random Forest inference pipeline returning `MLPrediction`.

Contract:
- Function: get_ml_classification(evidence: EvidenceJson) -> MLPrediction
- Input: Validated EvidenceJson object produced by the Static Analyzer
- Output: Validated Pydantic MLPrediction object
========================================================================================
"""
from typing import List, Dict, Any
from app.schemas.evidence import EvidenceJson, MLPrediction


def get_ml_classification(evidence: EvidenceJson) -> MLPrediction:
    """
    Run Machine Learning inference on extracted static evidence features.
    
    MOCK IMPLEMENTATION:
    Computes a realistic, dynamic malware probability based on the presence
    and correlation of suspicious signals in the provided EvidenceJson.
    """
    risk_points = 0.0

    # 1. Evaluate High Privilege Hooks
    if evidence.hooks.accessibilityService:
        risk_points += 0.35
    if evidence.hooks.systemOverlayWindow:
        risk_points += 0.25
    if evidence.hooks.smsAccess:
        risk_points += 0.15
    if evidence.hooks.notificationListener:
        risk_points += 0.10
    if evidence.hooks.bootPersistence:
        risk_points += 0.05
    if len(evidence.hooks.hiddenReceivers) > 1:
        risk_points += 0.05

    # 2. Evaluate Suspicious Strings & URLs
    if len(evidence.suspiciousStrings) > 0:
        risk_points += min(0.20, len(evidence.suspiciousStrings) * 0.05)

    # 3. Evaluate Dangerous API calls
    if len(evidence.suspiciousApiCalls) > 0:
        risk_points += min(0.15, len(evidence.suspiciousApiCalls) * 0.05)

    # 4. Evaluate Certificate Signals
    if evidence.certificate.selfSigned:
        risk_points += 0.10
    if evidence.certificate.signingKeyAgeDays < 30:
        risk_points += 0.05

    # 5. Evaluate Dangerous Permissions
    dangerous_perms = [p for p in evidence.permissions if p.protectionLevel == "dangerous"]
    if len(dangerous_perms) >= 4:
        risk_points += 0.15
    elif len(dangerous_perms) >= 2:
        risk_points += 0.05

    # Clamp probability to [0.02, 0.98]
    malware_prob = min(0.98, max(0.02, round(risk_points, 4)))

    # Determine Label & Explainability Contributions
    top_contributions: List[Dict[str, Any]] = []

    if evidence.hooks.accessibilityService:
        top_contributions.append({
            "feature": "AccessibilityService_Hook",
            "weight": 0.35,
            "description": "Background UI automation & screen scrape vector detected"
        })
    if evidence.hooks.systemOverlayWindow:
        top_contributions.append({
            "feature": "SYSTEM_ALERT_WINDOW_Perm",
            "weight": 0.25,
            "description": "Phishing overlay window injection capability present"
        })
    if evidence.hooks.smsAccess:
        top_contributions.append({
            "feature": "SMS_Access_And_Interception",
            "weight": 0.15,
            "description": "2FA SMS OTP interception receiver declared"
        })
    if evidence.certificate.selfSigned:
        top_contributions.append({
            "feature": "Untrusted_SelfSigned_Certificate",
            "weight": 0.10,
            "description": "Untrusted debug certificate with short validity lifespan"
        })

    if malware_prob >= 0.70:
        predicted_label = "malware"
        confidence = min(0.99, round(malware_prob + 0.03, 2))
    elif malware_prob >= 0.40:
        predicted_label = "suspicious"
        confidence = round(0.70 + (malware_prob - 0.40), 2)
    else:
        predicted_label = "benign"
        confidence = round(1.0 - malware_prob, 2)

    return MLPrediction(
        malwareProbability=malware_prob,
        predictedLabel=predicted_label,
        confidence=confidence,
        topFeatureContributions=top_contributions if top_contributions else None
    )
