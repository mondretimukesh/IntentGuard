// ── Risk Classification ──────────────────────────────────────────────
export type RiskLevel = 'low' | 'review' | 'high' | 'critical' | 'insufficient';

export interface RiskClassification {
  level: RiskLevel;
  label: string;
  color: string;
}

// ── Risk Components (fixed 6 weighted dimensions) ────────────────────
export interface RiskComponent {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  color: string;
  description?: string;
}

// ── Fixed READ-ONLY Risk Formula Weights (Must sum to 1.00) ─────────
export interface RiskWeights {
  malwareEvidence: number;       // 0.30
  capabilityRisk: number;        // 0.25
  purposeMismatch: number;       // 0.15
  behavioralAnomalies: number;   // 0.15
  fraudPathway: number;          // 0.10
  certificateReputation: number; // 0.05
}

// ── Capability Signal Tuning (Secondary point increments) ─────────────
export interface CapabilityTuningWeights {
  accessibilityService: number; // +30
  systemOverlay: number;        // +25
  notificationAccess: number;   // +15
  smsAccess: number;            // +15
  bootPersistence: number;      // +10
  suspiciousNetworking: number; // +10
}

// ── Evidence ─────────────────────────────────────────────────────────
export type EvidenceSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Evidence {
  id: string;
  title: string;
  description: string;
  severity: EvidenceSeverity;
  icon: string;
}

// ── Permissions ──────────────────────────────────────────────────────
export type PermissionCategory = 'expected' | 'questionable' | 'unexpected';

export interface Permission {
  name: string;
  category: PermissionCategory;
  justification: string;
  protectionLevel?: string;
  isDangerous?: boolean;
}

// ── Attack Pathway ──────────────────────────────────────────────────
export interface AttackStep {
  id: string;
  label: string;
  icon: string;
  description: string;
  severity: EvidenceSeverity;
}

export interface AttackPathway {
  title: string;
  steps: AttackStep[];
  summary: string;
}

// ── Recommendations ─────────────────────────────────────────────────
export type RecommendationSeverity = 'critical' | 'warning' | 'info';

export interface Recommendation {
  id: string;
  title: string;
  guidance: string;
  severity: RecommendationSeverity;
  icon: string;
}

// ── Analysis Job Status & Terminal Logs (Exact Enum per Contract) ─────
export type AnalysisJobStatus =
  | 'queued'
  | 'validating'
  | 'static_analysis'
  | 'purpose_matching'
  | 'transparency_eval'
  | 'ml_classification'
  | 'threat_intel'
  | 'risk_scoring'
  | 'complete'
  | 'failed';

export interface PipelineStep {
  id: number;
  statusCode?: AnalysisJobStatus;
  name: string;
  status: 'completed' | 'active' | 'pending';
  description?: string;
}

export interface LogMessage {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
  color?: string;
}

export interface AnalysisJobResponse {
  jobId: string;
  status: AnalysisJobStatus;
  currentStep: string;
  logs: LogMessage[];
  estimatedTimeRemaining: number;
  sha256?: string;
  reportId?: string;
  error?: string;
}

// ── Scan History ─────────────────────────────────────────────────────
export interface ScanRecord {
  id: string;
  appName: string;
  packageName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  scanDate: string;
  sha256: string;
}

export interface PaginatedHistoryResponse {
  items: ScanRecord[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Full Analysis Report (mirrors GET /api/report/{id}) ──────────────
export interface AnalysisReport {
  jobId: string;
  packageName: string;
  appName: string;
  version: string;
  sha256: string;
  fileSize: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskClassification: string;
  riskComponents: RiskComponent[];
  evidence: Evidence[];
  permissions: Permission[];
  attackPathway: AttackPathway;
  recommendations: Recommendation[];
  pipelineSteps: PipelineStep[];
  scanDate: string;
  manifestXml?: string;
}

// ── Threat Intel Sources ─────────────────────────────────────────────
export interface ThreatIntelSource {
  name: string;
  status: 'connected' | 'unknown';
  lastSynced: string;
}

// ── Health Check Response ────────────────────────────────────────────
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'offline';
  version: string;
  timestamp: string;
  apiMode?: string;
}

// ── Settings ─────────────────────────────────────────────────────────
export interface AppSettings {
  autoDeleteApks: boolean;
  retainHistory: boolean;
  capabilityTuning: CapabilityTuningWeights;
}
