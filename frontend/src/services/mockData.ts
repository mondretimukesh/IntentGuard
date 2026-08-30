import type {
  AnalysisJobResponse,
  AnalysisReport,
  AppSettings,
  HealthStatus,
  PaginatedHistoryResponse,
  RiskWeights,
  ThreatIntelSource,
} from '../types';

export const MOCK_REPORT: AnalysisReport = {
  jobId: 'job-mock-overlay-8520',
  packageName: 'com.bank.overlay.trojan',
  appName: 'Banking Trojan Overlay',
  version: '2.4.1',
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  fileSize: '4.8 MB',
  riskScore: 85,
  riskLevel: 'high',
  riskClassification: 'CRITICAL THREAT: Overlay & SMS Interception Malware',
  scanDate: new Date().toISOString(),
  riskComponents: [
    {
      id: 'malware',
      name: 'Malware Evidence',
      score: 90,
      weight: 0.30,
      color: '#E8935A',
      description: 'Detection of known malware signatures, DEX byte patterns, and C2 payload heuristics.',
    },
    {
      id: 'capability',
      name: 'Capability Risk',
      score: 85,
      weight: 0.25,
      color: '#F87171',
      description: 'High-risk permissions such as Accessibility Services, System Overlays, and Notification Listeners.',
    },
    {
      id: 'purpose',
      name: 'Purpose Mismatch',
      score: 75,
      weight: 0.15,
      color: '#FBBF24',
      description: 'Discrepancy between declared app functionality (e.g. calculator) and requested permissions.',
    },
    {
      id: 'behavioral',
      name: 'Behavioral Anomalies',
      score: 80,
      weight: 0.15,
      color: '#FBBF24',
      description: 'Unusual runtime artifacts including BOOT_COMPLETED auto-restart and dynamic DEX loading.',
    },
    {
      id: 'fraud',
      name: 'Fraud Pathway',
      score: 95,
      weight: 0.10,
      color: '#F87171',
      description: 'Combined attack chains where overlays capture credentials and SMS interception steals 2FA OTPs.',
    },
    {
      id: 'cert',
      name: 'Certificate Reputation',
      score: 40,
      weight: 0.05,
      color: '#4FB8A6',
      description: 'Verification of APK signing certificate longevity, issuer trust, and developer key reputation.',
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      title: 'Accessibility Service Privilege Escalation',
      description: 'Requests BIND_ACCESSIBILITY_SERVICE allowing silent interaction with banking and 2FA authentication dialogs.',
      severity: 'critical',
      icon: 'accessibility_new',
    },
    {
      id: 'ev-2',
      title: 'System Overlay Injection Capability',
      description: 'Declares SYSTEM_ALERT_WINDOW permission enabling deceptive fake login screens drawn over legitimate apps.',
      severity: 'high',
      icon: 'layers',
    },
    {
      id: 'ev-3',
      title: 'Real-Time SMS OTP Interception',
      description: 'Registers RECEIVE_SMS and READ_SMS receivers to capture verification codes before user notification.',
      severity: 'high',
      icon: 'chat',
    },
    {
      id: 'ev-4',
      title: 'Boot Persistence & Silent Auto-Restart',
      description: 'Hooked to RECEIVE_BOOT_COMPLETED to launch hidden background C2 polling immediately upon device power-on.',
      severity: 'medium',
      icon: 'sync',
    },
  ],
  permissions: [
    {
      name: 'android.permission.BIND_ACCESSIBILITY_SERVICE',
      category: 'unexpected',
      justification: 'Abused to simulate touch events, steal pin codes, and read screen content without consent.',
      protectionLevel: 'dangerous',
      isDangerous: true,
    },
    {
      name: 'android.permission.SYSTEM_ALERT_WINDOW',
      category: 'unexpected',
      justification: 'Used for overlay attack vector drawing phishing windows over banking apps.',
      protectionLevel: 'signature|appop',
      isDangerous: true,
    },
    {
      name: 'android.permission.RECEIVE_SMS',
      category: 'questionable',
      justification: 'Intercepts incoming 2FA authentication SMS messages.',
      protectionLevel: 'dangerous',
      isDangerous: true,
    },
    {
      name: 'android.permission.INTERNET',
      category: 'expected',
      justification: 'Required for Command and Control (C2) network communications.',
      protectionLevel: 'normal',
      isDangerous: false,
    },
    {
      name: 'android.permission.RECEIVE_BOOT_COMPLETED',
      category: 'questionable',
      justification: 'Ensures persistence across device reboot cycles.',
      protectionLevel: 'normal',
      isDangerous: false,
    },
  ],
  attackPathway: {
    title: 'Overlay Credential Stealing & OTP Interception Vector',
    summary: 'The application disguises itself as a utility tool while executing an automated 4-step banking fraud chain.',
    steps: [
      {
        id: 'step-1',
        label: 'System Overlay Injection Target',
        icon: 'layers',
        description: 'Detects launch of targeted banking applications and renders an identical fake login window.',
        severity: 'high',
      },
      {
        id: 'step-2',
        label: 'SMS Listener & Interception',
        icon: 'chat',
        description: 'Reads incoming SMS messages containing 2FA OTP codes sent by financial institutions.',
        severity: 'high',
      },
      {
        id: 'step-3',
        label: 'Accessibility Keylogger',
        icon: 'accessibility_new',
        description: 'Captures typed passwords and bypasses biometric prompt confirmations silently.',
        severity: 'critical',
      },
      {
        id: 'step-4',
        label: 'Automated Fraud Execution',
        icon: 'warning',
        description: 'Exfiltrates stolen credentials and 2FA OTPs to remote C2 server to finalize fraudulent transfers.',
        severity: 'critical',
      },
    ],
  },
  recommendations: [
    {
      id: 'rec-1',
      title: 'Immediately Revoke Accessibility & Overlay Permissions',
      guidance: 'Navigate to System Settings > Accessibility and turn off Accessibility Service for this application package immediately.',
      severity: 'critical',
      icon: 'block',
    },
    {
      id: 'rec-2',
      title: 'Quarantine & Uninstall Package',
      guidance: 'Use IntentGuard Workspace or device MDM to force uninstall package com.bank.overlay.trojan.',
      severity: 'critical',
      icon: 'delete',
    },
    {
      id: 'rec-3',
      title: 'Reset Banking & 2FA Account Credentials',
      guidance: 'Initiate password resets for all financial accounts accessed on this device while the malware was installed.',
      severity: 'warning',
      icon: 'key',
    },
  ],
  pipelineSteps: [
    { id: 1, statusCode: 'queued', name: 'Job Queued', status: 'completed' },
    { id: 2, statusCode: 'validating', name: 'Native SHA-256 Hashing', status: 'completed' },
    { id: 3, statusCode: 'static_analysis', name: 'Manifest & DEX Parsing', status: 'completed' },
    { id: 4, statusCode: 'purpose_matching', name: 'Intent-Permission Correlation', status: 'completed' },
    { id: 5, statusCode: 'transparency_eval', name: 'Behavioral Anomaly Analysis', status: 'completed' },
    { id: 6, statusCode: 'threat_intel', name: 'CTI Feed Correlation', status: 'completed' },
    { id: 7, statusCode: 'risk_scoring', name: '6-Factor Weight Scoring', status: 'completed' },
    { id: 8, statusCode: 'complete', name: 'Report Finalized', status: 'completed' },
  ],
  manifestXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bank.overlay.trojan"
    android:versionCode="104"
    android:versionName="2.4.1">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />

    <application
        android:allowBackup="false"
        android:icon="@drawable/ic_launcher"
        android:label="Banking Trojan Overlay"
        android:theme="@style/AppTheme">

        <service
            android:name=".services.OverlayAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
        </service>

        <receiver android:name=".receivers.SmsOtpListener">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>`,
};

export const MOCK_HISTORY_ITEMS = [
  {
    id: 'job-mock-overlay-8520',
    appName: 'Banking Trojan Overlay',
    packageName: 'com.bank.overlay.trojan',
    riskScore: 85,
    riskLevel: 'high' as const,
    scanDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'job-mock-miner-6812',
    appName: 'Background CryptoMiner Pro',
    packageName: 'org.monero.stealth.miner',
    riskScore: 68,
    riskLevel: 'review' as const,
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    sha256: 'f41c521198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b812',
  },
  {
    id: 'job-mock-calc-1200',
    appName: 'Simple Calculator HD',
    packageName: 'com.utility.calc.hd',
    riskScore: 12,
    riskLevel: 'low' as const,
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    sha256: 'a1b2c3d498fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
  },
  {
    id: 'job-mock-sms-9230',
    appName: 'SMS OTP Interceptor Payload',
    packageName: 'com.stealth.sms.interceptor',
    riskScore: 92,
    riskLevel: 'critical' as const,
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    sha256: '99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
  },
  {
    id: 'job-mock-dropper-8810',
    appName: 'System Update Dropper',
    packageName: 'com.sys.update.installer',
    riskScore: 88,
    riskLevel: 'critical' as const,
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    sha256: '7766554433221100aabbccddeeff00112233445566778899aabbccddeeff0011',
  },
];

export const MOCK_HISTORY_RESPONSE: PaginatedHistoryResponse = {
  items: MOCK_HISTORY_ITEMS,
  total: MOCK_HISTORY_ITEMS.length,
  page: 1,
  totalPages: 1,
};

export const MOCK_SETTINGS: AppSettings = {
  autoDeleteApks: true,
  retainHistory: true,
  capabilityTuning: {
    accessibilityService: 30,
    systemOverlay: 25,
    notificationAccess: 15,
    smsAccess: 15,
    bootPersistence: 10,
    suspiciousNetworking: 10,
  },
};

export const MOCK_THREAT_INTEL_SOURCES: ThreatIntelSource[] = [
  { name: 'VirusTotal Intelligence API', status: 'connected', lastSynced: '5 mins ago' },
  { name: 'AlienVault OTX Threat Exchange', status: 'connected', lastSynced: '12 mins ago' },
  { name: 'Abuse.ch MalwareBazaar', status: 'connected', lastSynced: '1 hour ago' },
  { name: 'ThreatFox IoC Stream', status: 'connected', lastSynced: '3 hours ago' },
];

export const MOCK_HEALTH_STATUS: HealthStatus = {
  status: 'ok',
  version: '1.4.0',
  timestamp: new Date().toISOString(),
  apiMode: 'Preview Mock Engine',
};
