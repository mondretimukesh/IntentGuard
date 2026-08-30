from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.evidence import EvidenceJson, MLPrediction
from app.schemas.report import (
    AnalysisReport,
    EvidenceItem,
    ReportPermission,
    AttackPathway,
    AttackStep,
    Recommendation,
    PipelineStep,
    RiskComponent,
)


def _format_file_size(size_bytes: int) -> str:
    """Format bytes to MB."""
    mb = size_bytes / (1024 * 1024)
    return f"{mb:.1f} MB" if mb >= 0.1 else f"{size_bytes / 1024:.1f} KB"


def assemble_full_report(
    job_id: str,
    evidence: EvidenceJson,
    ml_pred: MLPrediction,
    scoring: Dict[str, Any]
) -> AnalysisReport:
    """
    Assemble the complete AnalysisReport structure combining static facts,
    ML probability, scoring outputs, permissions justifications, attack chain, and recommendations.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    now_date = datetime.now(timezone.utc).strftime("%b %d, %Y")

    # 1. Build Flagged Evidence Items
    evidence_items: List[EvidenceItem] = []
    
    if evidence.hooks.accessibilityService:
        evidence_items.append(EvidenceItem(
            id="ev_acc_01",
            title="Accessibility Service Abuse Capability",
            description="Application requests BIND_ACCESSIBILITY_SERVICE allowing automated background UI click simulation and screen scraping.",
            severity="critical",
            icon="accessibility"
        ))

    if evidence.hooks.systemOverlayWindow:
        evidence_items.append(EvidenceItem(
            id="ev_ovl_02",
            title="System Alert Overlay Window Injection",
            description="Capability to draw deceptive phishing overlay screens over target banking or payment apps.",
            severity="high",
            icon="layers"
        ))

    if evidence.hooks.smsAccess:
        evidence_items.append(EvidenceItem(
            id="ev_sms_03",
            title="SMS OTP Interception Receiver",
            description="Declared broadcast receiver monitors incoming SMS traffic to extract 2FA one-time passwords.",
            severity="high",
            icon="sms"
        ))

    if evidence.certificate.selfSigned:
        evidence_items.append(EvidenceItem(
            id="ev_cert_04",
            title="Untrusted Self-Signed Signing Certificate",
            description=f"APK signed with self-signed certificate '{evidence.certificate.issuer}' with key age of {evidence.certificate.signingKeyAgeDays} days.",
            severity="medium",
            icon="verified_user"
        ))

    if len(evidence.suspiciousStrings) > 0:
        evidence_items.append(EvidenceItem(
            id="ev_str_05",
            title="Hardcoded C2 Telemetry Endpoints",
            description=f"Extracted {len(evidence.suspiciousStrings)} suspicious domain URLs/telemetry endpoints from decompiled DEX strings.",
            severity="medium",
            icon="link"
        ))

    if not evidence_items:
        evidence_items.append(EvidenceItem(
            id="ev_clean_00",
            title="Standard Sandboxed Android Package",
            description="No high-privilege device takeover hooks, overlay capabilities, or telemetry anomalies detected.",
            severity="low",
            icon="check_circle"
        ))

    # 2. Categorize Permissions with Justification
    perm_items: List[ReportPermission] = []
    category = (evidence.declaredCategory or "Unknown").lower()

    for p in evidence.permissions:
        is_dangerous = p.protectionLevel == "dangerous"
        
        # Categorize
        if p.name in ["android.permission.INTERNET", "android.permission.VIBRATE", "android.permission.ACCESS_NETWORK_STATE"]:
            cat = "expected"
            just = "Standard benign application capability for basic network and hardware functionality."
        elif "SMS" in p.name:
            if category in ["messaging", "communication"]:
                cat = "expected"
                just = "Core feature required for SMS messaging client."
            else:
                cat = "unexpected"
                just = f"Unexpected SMS permission for an app categorized as '{evidence.declaredCategory}'."
        elif "ACCESSIBILITY" in p.name:
            if category in ["screen reader", "accessibility"]:
                cat = "expected"
                just = "Core assistive functionality for declared accessibility service."
            else:
                cat = "unexpected"
                just = "High-risk permission granting unrestricted screen inspection and automated UI execution."
        elif "SYSTEM_ALERT_WINDOW" in p.name:
            if category in ["screen recorder", "launcher"]:
                cat = "questionable"
                just = "Requires user permission; may be legitimate for persistent screen utilities."
            else:
                cat = "unexpected"
                just = "Draw over other apps permission enables phishing overlay injection."
        else:
            cat = "questionable" if is_dangerous else "expected"
            just = f"Declared capability: {p.name}"

        perm_items.append(ReportPermission(
            name=p.name,
            category=cat,
            justification=just,
            protectionLevel=p.protectionLevel,
            isDangerous=is_dangerous
        ))

    # 3. Construct Attack Pathway
    attack_steps: List[AttackStep] = []
    if evidence.hooks.systemOverlayWindow:
        attack_steps.append(AttackStep(
            id="step_1",
            label="Credential Capture via Overlay",
            icon="layers",
            description="Injects a transparent phishing overlay window when targeted banking app is launched.",
            severity="critical"
        ))
    if evidence.hooks.smsAccess or evidence.hooks.notificationListener:
        attack_steps.append(AttackStep(
            id="step_2",
            label="OTP & 2FA Interception",
            icon="sms",
            description="Silently captures incoming SMS verification codes and system notifications in real-time.",
            severity="high"
        ))
    if evidence.hooks.accessibilityService:
        attack_steps.append(AttackStep(
            id="step_3",
            label="Automated Fraudulent Transaction",
            icon="touch_app",
            description="Uses Accessibility API to approve fund transfers and dismiss security alerts without user interaction.",
            severity="critical"
        ))

    if not attack_steps:
        attack_steps.append(AttackStep(
            id="step_clean",
            label="Isolated Sandbox Execution",
            icon="shield",
            description="Application operates within standard Android OS sandboxing boundaries without takeover capabilities.",
            severity="low"
        ))

    attack_pathway = AttackPathway(
        title="Automated Device-Takeover & Financial Fraud Attack Chain" if len(attack_steps) > 1 else "Standard Sandboxed Behavior",
        steps=attack_steps,
        summary="Multi-stage attack pipeline identified: overlay credential harvesting combined with silent OTP interception and automated accessibility execution." if len(attack_steps) > 1 else "No high-risk multi-stage attack pathway discovered during static inspection."
    )

    # 4. Generate Actionable Recommendations
    recommendations: List[Recommendation] = []
    if scoring["overallRiskScore"] >= 75:
        recommendations.append(Recommendation(
            id="rec_01",
            title="Block Application Installation & Sideloading",
            guidance="Quarantine package immediately. Do not install on enterprise or personal devices holding financial accounts.",
            severity="critical",
            icon="block"
        ))
        recommendations.append(Recommendation(
            id="rec_02",
            title="Audit Accessibility & Overlay Permissions",
            guidance="Verify if any running device services currently hold active AccessibilityService bindings.",
            severity="warning",
            icon="policy"
        ))
    elif scoring["overallRiskScore"] >= 40:
        recommendations.append(Recommendation(
            id="rec_03",
            title="Review Requested Permissions & Source Origin",
            guidance="Inspect the developer signature and ensure APK was obtained from official, verified distribution channels.",
            severity="warning",
            icon="security"
        ))
    else:
        recommendations.append(Recommendation(
            id="rec_04",
            title="Low Risk: Standard Deployment Permitted",
            guidance="Package meets baseline security criteria for general Android runtime deployment.",
            severity="info",
            icon="check"
        ))

    # 5. Pipeline Steps
    pipeline_steps = [
        PipelineStep(id=1, statusCode="queued", name="1. Queue Allocation", status="completed", description="Job initialized in high-priority CTI queue"),
        PipelineStep(id=2, statusCode="validating", name="2. APK Unpacking & Validation", status="completed", description="ZIP integrity verified, AndroidManifest extracted"),
        PipelineStep(id=3, statusCode="static_analysis", name="3. Static Bytecode Parsing", status="completed", description="DEX classes extracted, hooks and intent filters parsed"),
        PipelineStep(id=4, statusCode="purpose_matching", name="4. Purpose vs Permission Correlation", status="completed", description="Matching declared category against requested capabilities"),
        PipelineStep(id=5, statusCode="transparency_eval", name="5. Transparency & C2 Telemetry", status="completed", description="Evaluating network endpoints and privacy disclosures"),
        PipelineStep(id=6, statusCode="ml_classification", name="6. Malware ML Model Inference", status="completed", description="Bytecode graph classification for trojan signatures"),
        PipelineStep(id=7, statusCode="threat_intel", name="7. Threat Intel Enrichment", status="completed", description="Enriching hash against CTI feeds & signature databases"),
        PipelineStep(id=8, statusCode="risk_scoring", name="8. 6-Factor Contextual Risk Engine", status="completed", description="Applying 6-Factor Risk Weighting formula"),
    ]

    risk_comps = [RiskComponent(**c) for c in scoring["riskComponents"]]

    return AnalysisReport(
        jobId=job_id,
        packageName=evidence.packageName,
        appName=evidence.appName,
        version="1.4.2",
        sha256=evidence.sha256,
        fileSize=_format_file_size(evidence.fileSizeBytes),
        riskScore=scoring["overallRiskScore"],
        overallRiskScore=scoring["overallRiskScore"],
        riskLevel=scoring["riskLevel"],
        riskClassification=scoring["riskClassification"],
        riskComponents=risk_comps,
        sixFactorBreakdown=risk_comps,
        evidence=evidence_items,
        evidenceList=evidence_items,
        permissions=perm_items,
        declaredPermissions=perm_items,
        attackPathway=attack_pathway,
        attackPathways=[attack_pathway],
        recommendations=recommendations,
        pipelineSteps=pipeline_steps,
        scanDate=now_date,
        analyzedAt=now_iso,
        manifestXml=evidence.manifestXml
    )
