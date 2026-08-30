import pytest
from app.schemas.evidence import (
    EvidenceJson,
    Permission,
    HighPrivilegeHooks,
    CertificateInfo,
    MLPrediction,
)
from app.schemas.settings import CapabilityTuningWeights, RiskWeights
from app.services.scoring.engine import (
    calculate_capability_risk,
    calculate_purpose_mismatch,
    calculate_behavioral_anomalies,
    calculate_fraud_pathway,
    calculate_certificate_reputation,
    compute_six_factor_score,
)


def test_benign_calculator_scoring():
    """Test pure scoring engine on a benign calculator APK profile."""
    evidence = EvidenceJson(
        packageName="com.utility.smartcalc",
        appName="Smart Calculator",
        fileSizeBytes=5000000,
        sha256="7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
        manifestXml="<manifest></manifest>",
        declaredCategory="Calculator",
        permissions=[
            Permission(name="android.permission.VIBRATE", protectionLevel="normal"),
        ],
        hooks=HighPrivilegeHooks(
            accessibilityService=False,
            systemOverlayWindow=False,
            notificationListener=False,
            smsAccess=False,
            bootPersistence=False,
            hiddenReceivers=[]
        ),
        certificate=CertificateInfo(
            issuer="CN=Google Inc",
            subject="CN=Google Inc",
            sha256Fingerprint="abc123cert",
            validFrom="2020-01-01",
            validTo="2040-01-01",
            selfSigned=False,
            signingKeyAgeDays=1500,
        ),
        suspiciousStrings=[],
        suspiciousApiCalls=[]
    )

    ml_pred = MLPrediction(
        malwareProbability=0.02,
        predictedLabel="benign",
        confidence=0.98
    )

    tuning = CapabilityTuningWeights()
    weights = RiskWeights()

    # Assert individual factor calculations
    cap_risk = calculate_capability_risk(evidence, tuning)
    assert cap_risk == 0.0

    purpose_risk = calculate_purpose_mismatch(evidence)
    assert purpose_risk == 0.0

    behavior_risk = calculate_behavioral_anomalies(evidence)
    assert behavior_risk == 0.0

    fraud_risk = calculate_fraud_pathway(evidence)
    assert fraud_risk == 0.0

    cert_risk = calculate_certificate_reputation(evidence)
    assert cert_risk == 0.0

    # Full 6-factor score calculation
    result = compute_six_factor_score(evidence, ml_pred, tuning, weights)

    # R = 0.30*(2.0) + 0.25*(0) + 0.15*(0) + 0.15*(0) + 0.10*(0) + 0.05*(0) = 0.6 -> round = 1
    assert result["overallRiskScore"] == 1
    assert result["riskLevel"] == "low"
    assert "Low Risk" in result["riskClassification"]


def test_banking_trojan_takeover_scoring():
    """Test pure scoring engine on a critical banking trojan APK profile."""
    evidence = EvidenceJson(
        packageName="com.fraud.overlay.banktakeover",
        appName="Banking Security Suite",
        fileSizeBytes=14500000,
        sha256="a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        manifestXml="<manifest></manifest>",
        declaredCategory="Utility",
        permissions=[
            Permission(name="android.permission.SYSTEM_ALERT_WINDOW", protectionLevel="dangerous"),
            Permission(name="android.permission.BIND_ACCESSIBILITY_SERVICE", protectionLevel="dangerous"),
            Permission(name="android.permission.READ_SMS", protectionLevel="dangerous"),
            Permission(name="android.permission.RECEIVE_SMS", protectionLevel="dangerous"),
            Permission(name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE", protectionLevel="dangerous"),
            Permission(name="android.permission.RECEIVE_BOOT_COMPLETED", protectionLevel="normal"),
        ],
        hooks=HighPrivilegeHooks(
            accessibilityService=True,
            systemOverlayWindow=True,
            notificationListener=True,
            smsAccess=True,
            bootPersistence=True,
            hiddenReceivers=["com.fraud.BootReceiver", "com.fraud.SmsReceiver"]
        ),
        certificate=CertificateInfo(
            issuer="CN=Android Debug, O=Android, C=US",
            subject="CN=Android Debug, O=Android, C=US",
            sha256Fingerprint="9b8d7c6a5e4f3a2b1c0d9e8f",
            validFrom="2026-01-01",
            validTo="2026-06-01",
            selfSigned=True,
            signingKeyAgeDays=10,
        ),
        suspiciousStrings=[
            "https://c2.threat-actor.com/gate.php",
            "http://185.220.101.5/inject"
        ],
        suspiciousApiCalls=[
            "Ljava/lang/reflect/Method;->invoke",
            "Ldalvik/system/DexClassLoader;-><init>"
        ]
    )

    ml_pred = MLPrediction(
        malwareProbability=0.96,
        predictedLabel="malware",
        confidence=0.99
    )

    tuning = CapabilityTuningWeights(
        accessibility_service=30,
        system_overlay=25,
        notification_access=15,
        sms_access=15,
        boot_persistence=10,
        suspicious_networking=10,
    )
    weights = RiskWeights(
        malware_evidence=0.30,
        capability_risk=0.25,
        purpose_mismatch=0.15,
        behavioral_anomalies=0.15,
        fraud_pathway=0.10,
        certificate_reputation=0.05,
    )

    # Capability score: 30 + 25 + 15 + 15 + 10 + 10 = 105 -> clamped to 100
    assert calculate_capability_risk(evidence, tuning) == 100.0

    # Purpose mismatch for Utility app asking for Accessibility + Overlay + SMS = 65 + 30 = 95
    assert calculate_purpose_mismatch(evidence) == 95.0

    # Behavioral anomalies: 25 (boot) + 30 (2 hidden) + 30 (2 apis) = 85
    assert calculate_behavioral_anomalies(evidence) == 85.0

    # Fraud pathway: Triad (Overlay + SMS + Accessibility) = 100
    assert calculate_fraud_pathway(evidence) == 100.0

    # Certificate risk: 50 (self-signed) + 25 (debug) + 25 (key age < 30) = 100
    assert calculate_certificate_reputation(evidence) == 100.0

    result = compute_six_factor_score(evidence, ml_pred, tuning, weights)

    # R = 0.30*(96.0) + 0.25*(100) + 0.15*(95) + 0.15*(85) + 0.10*(100) + 0.05*(100)
    #   = 28.8 + 25.0 + 14.25 + 12.75 + 10.0 + 5.0 = 95.8 -> round = 96
    assert result["overallRiskScore"] == 96
    assert result["riskLevel"] == "critical"
    assert "Critical Threat" in result["riskClassification"]


def test_dynamic_capability_tuning_runtime_adjustment():
    """Verify that changing capability tuning weights dynamically alters the sub-score."""
    evidence = EvidenceJson(
        packageName="com.test.app",
        appName="Test App",
        fileSizeBytes=100000,
        sha256="1122334455667788",
        manifestXml="<manifest></manifest>",
        declaredCategory="Utility",
        permissions=[],
        hooks=HighPrivilegeHooks(
            accessibilityService=True,
            systemOverlayWindow=False,
            notificationListener=False,
            smsAccess=False,
            bootPersistence=False,
            hiddenReceivers=[]
        ),
        certificate=CertificateInfo(
            issuer="CN=Test",
            subject="CN=Test",
            sha256Fingerprint="fingerprint",
            validFrom="2020-01-01",
            validTo="2030-01-01",
            selfSigned=False,
            signingKeyAgeDays=500,
        ),
        suspiciousStrings=[],
        suspiciousApiCalls=[]
    )

    # Standard tuning (accessibility = 30)
    default_tuning = CapabilityTuningWeights(accessibility_service=30)
    assert calculate_capability_risk(evidence, default_tuning) == 30.0

    # Custom adjusted tuning (accessibility = 50)
    custom_tuning = CapabilityTuningWeights(accessibility_service=50)
    assert calculate_capability_risk(evidence, custom_tuning) == 50.0
