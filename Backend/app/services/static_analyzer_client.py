"""
========================================================================================
TEAMMATE INTEGRATION BOUNDARY: STATIC ANALYZER CLIENT
========================================================================================
IMPORTANT NOTICE FOR TEAMMATES:
This is ONE OF ONLY TWO FILES in the entire backend that will change when the
Static Analyzer teammate integrates their real Androguard static analysis module.

Current Status: MOCKED
Integration Target: Replace the body of `get_static_evidence(apk_path)` with the call
                    to your Androguard extraction pipeline returning `EvidenceJson`.

Contract:
- Function: get_static_evidence(apk_path: str) -> EvidenceJson
- Input: Absolute or relative filepath to uploaded .apk file
- Output: Validated Pydantic EvidenceJson object
========================================================================================
"""
import os
import hashlib
from app.schemas.evidence import (
    EvidenceJson,
    Permission,
    HighPrivilegeHooks,
    CertificateInfo,
)


def _compute_file_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file on disk."""
    if not os.path.exists(filepath):
        return hashlib.sha256(filepath.encode()).hexdigest()
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def get_static_evidence(apk_path: str) -> EvidenceJson:
    """
    Extract security-relevant static facts from an APK file.
    
    MOCK IMPLEMENTATION:
    Returns realistic static evidence fixtures based on file characteristics,
    filename keywords, or computed SHA256.
    """
    file_name = os.path.basename(apk_path).lower()
    file_size = os.path.getsize(apk_path) if os.path.exists(apk_path) else 14889728
    sha256_hash = _compute_file_sha256(apk_path)

    # 1. High Threat / Banking Trojan Profile
    if any(k in file_name for k in ["bank", "trojan", "malware", "payload", "anubis", "cerberus", "sharkbot"]):
        manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.android.security.service" android:versionCode="104" android:versionName="1.4.2">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
    <application android:allowBackup="false" android:label="Security Update" android:icon="@drawable/ic_launcher">
        <service android:name="com.android.security.OverlayService" android:permission="android.permission.SYSTEM_ALERT_WINDOW" />
        <service android:name="com.android.security.CoreAccessibilityService" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
        </service>
        <receiver android:name="com.android.security.BootReceiver" android:enabled="true" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
        <receiver android:name="com.android.security.SmsReceiver" android:permission="android.permission.BROADCAST_SMS">
            <intent-filter>
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>"""
        return EvidenceJson(
            packageName="com.android.security.service",
            appName="Banking Security Suite (Trojan)",
            fileSizeBytes=file_size,
            sha256=sha256_hash,
            manifestXml=manifest_xml,
            declaredCategory="Utility",  # High mismatch: Utility app asking for banking overlay & SMS
            permissions=[
                Permission(name="android.permission.SYSTEM_ALERT_WINDOW", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.BIND_ACCESSIBILITY_SERVICE", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.READ_SMS", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.RECEIVE_SMS", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.RECEIVE_BOOT_COMPLETED", protectionLevel="normal", declared=True, requestedAtRuntime=False),
                Permission(name="android.permission.INTERNET", protectionLevel="normal", declared=True, requestedAtRuntime=False),
            ],
            hooks=HighPrivilegeHooks(
                accessibilityService=True,
                systemOverlayWindow=True,
                notificationListener=True,
                smsAccess=True,
                bootPersistence=True,
                hiddenReceivers=[
                    "com.android.security.BootReceiver",
                    "com.android.security.SmsReceiver",
                    "com.android.security.HiddenPayloadReceiver"
                ]
            ),
            certificate=CertificateInfo(
                issuer="CN=Android Debug, O=Android, C=US",
                subject="CN=Android Debug, O=Android, C=US",
                sha256Fingerprint="9b8d7c6a5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
                validFrom="2026-01-01T00:00:00Z",
                validTo="2026-06-01T00:00:00Z",
                selfSigned=True,
                signingKeyAgeDays=14,  # Fresh untrusted signer key
            ),
            suspiciousStrings=[
                "https://c2.threat-actor-domain.com/gate.php",
                "http://185.220.101.5/api/inject",
                "com.google.android.apps.authenticator2",
                "org.thoughtcrime.securesms",
                "banking_overlay_payload.dex"
            ],
            suspiciousApiCalls=[
                "Ljava/lang/reflect/Method;->invoke",
                "Ldalvik/system/DexClassLoader;-><init>",
                "Ljavax/crypto/Cipher;->getInstance(Ljava/lang/String;)Ljavax/crypto/Cipher; [DES/ECB/PKCS5Padding]",
                "Landroid/telephony/SmsManager;->sendTextMessage"
            ]
        )

    # 2. Medium/High Threat / SMS Spyware Profile
    elif any(k in file_name for k in ["sms", "spy", "stealth", "tracker"]):
        manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.quick.sms.helper" android:versionCode="201" android:versionName="2.0.1">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
    <application android:label="Quick SMS Messenger">
        <receiver android:name="com.quick.sms.SmsInterceptor">
            <intent-filter>
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>"""
        return EvidenceJson(
            packageName="com.quick.sms.helper",
            appName="SMS Spyware Stealth",
            fileSizeBytes=file_size,
            sha256=sha256_hash,
            manifestXml=manifest_xml,
            declaredCategory="Messaging",
            permissions=[
                Permission(name="android.permission.READ_SMS", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.RECEIVE_SMS", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE", protectionLevel="dangerous", declared=True, requestedAtRuntime=True),
                Permission(name="android.permission.RECEIVE_BOOT_COMPLETED", protectionLevel="normal", declared=True, requestedAtRuntime=False),
                Permission(name="android.permission.INTERNET", protectionLevel="normal", declared=True, requestedAtRuntime=False),
            ],
            hooks=HighPrivilegeHooks(
                accessibilityService=False,
                systemOverlayWindow=False,
                notificationListener=True,
                smsAccess=True,
                bootPersistence=True,
                hiddenReceivers=["com.quick.sms.SmsInterceptor"]
            ),
            certificate=CertificateInfo(
                issuer="CN=Developer QuickSMS, O=Tools Inc, C=US",
                subject="CN=Developer QuickSMS, O=Tools Inc, C=US",
                sha256Fingerprint="e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7",
                validFrom="2025-05-01T00:00:00Z",
                validTo="2028-05-01T00:00:00Z",
                selfSigned=False,
                signingKeyAgeDays=120,
            ),
            suspiciousStrings=[
                "https://telemetry-gateway.online/upload_sms.php",
                "api.telegram.org/bot7291829:AAFe"
            ],
            suspiciousApiCalls=[
                "Landroid/telephony/SmsManager;->sendTextMessage",
                "Ljava/lang/Runtime;->getRuntime"
            ]
        )

    # 3. Clean / Benign Profile (Default)
    manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.utility.smartcalc" android:versionCode="12" android:versionName="1.2.0">
    <uses-permission android:name="android.permission.VIBRATE" />
    <application android:allowBackup="true" android:label="Smart Calculator" android:icon="@drawable/icon">
        <activity android:name="com.utility.smartcalc.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""
    return EvidenceJson(
        packageName="com.utility.smartcalc",
        appName="Smart Calculator Utility",
        fileSizeBytes=file_size,
        sha256=sha256_hash,
        manifestXml=manifest_xml,
        declaredCategory="Calculator",
        permissions=[
            Permission(name="android.permission.VIBRATE", protectionLevel="normal", declared=True, requestedAtRuntime=False),
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
            issuer="CN=Android Open Source Project, OU=Android, O=Google Inc., L=Mountain View, ST=California, C=US",
            subject="CN=Android Open Source Project, OU=Android, O=Google Inc., L=Mountain View, ST=California, C=US",
            sha256Fingerprint="7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
            validFrom="2020-01-01T00:00:00Z",
            validTo="2045-01-01T00:00:00Z",
            selfSigned=False,
            signingKeyAgeDays=1825,
        ),
        suspiciousStrings=[],
        suspiciousApiCalls=[]
    )
