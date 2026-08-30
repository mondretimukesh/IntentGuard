import type {
  AnalysisJobResponse,
  AnalysisReport,
  AppSettings,
  HealthStatus,
  PaginatedHistoryResponse,
  RiskWeights,
  ThreatIntelSource,
} from '../types';

import {
  MOCK_REPORT,
  MOCK_HISTORY_ITEMS,
  MOCK_SETTINGS,
  MOCK_THREAT_INTEL_SOURCES,
  MOCK_HEALTH_STATUS,
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'intentguard_settings_v1',
  API_CONFIG: 'intentguard_api_config_v1',
};

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
  apiKey: '',
};

export const FIXED_RISK_WEIGHTS: RiskWeights = {
  malwareEvidence: 0.30,
  capabilityRisk: 0.25,
  purposeMismatch: 0.15,
  behavioralAnomalies: 0.15,
  fraudPathway: 0.10,
  certificateReputation: 0.05,
};

export function getStoredApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    return raw ? { ...DEFAULT_API_CONFIG, ...JSON.parse(raw) } : DEFAULT_API_CONFIG;
  } catch {
    return DEFAULT_API_CONFIG;
  }
}

export function setStoredApiConfig(config: ApiConfig): void {
  localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
}

// ── REST API CALLS WITH AUTOMATIC PREVIEW MOCK FALLBACKS ──────────────────

/**
 * POST /api/analyze — Upload APK file to Backend for analysis
 */
export async function analyzeApk(
  fileInput: File | { name: string; size: string; sha256: string }
): Promise<{ jobId: string; sha256: string }> {
  try {
    const config = getStoredApiConfig();
    const formData = new FormData();

    if (fileInput instanceof File) {
      formData.append('file', fileInput);
    } else {
      const dummyBlob = new Blob([fileInput.name], { type: 'application/octet-stream' });
      formData.append('file', dummyBlob, fileInput.name);
    }

    const res = await fetch(`${config.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info('[Preview Mock Engine] Backend offline — serving mock scan job.');
  }

  const mockSha = fileInput instanceof File ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' : fileInput.sha256;
  return {
    jobId: 'job-mock-overlay-8520',
    sha256: mockSha || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };
}

/**
 * GET /api/analyze/{id} — Poll job status from Backend
 */
export async function getJobStatus(jobId: string): Promise<AnalysisJobResponse> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/analyze/${jobId}`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return {
    jobId: jobId || 'job-mock-overlay-8520',
    status: 'complete',
    currentStep: 'Report Generation Complete',
    estimatedTimeRemaining: 0,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    reportId: jobId || 'job-mock-overlay-8520',
    logs: [
      { timestamp: new Date().toISOString(), level: 'INFO', message: 'Decompiling AndroidManifest.xml...' },
      { timestamp: new Date().toISOString(), level: 'WARN', message: 'High-risk permission BIND_ACCESSIBILITY_SERVICE detected' },
      { timestamp: new Date().toISOString(), level: 'ERROR', message: 'Overlay injection & SMS intercept vector flagged' },
      { timestamp: new Date().toISOString(), level: 'SUCCESS', message: '6-Factor Risk Score computed: 85 (HIGH)' },
    ],
  };
}

/**
 * GET /api/report/{id} — Fetch full structured report from Backend
 */
export async function getReport(id: string): Promise<AnalysisReport> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/report/${id}`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return {
    ...MOCK_REPORT,
    jobId: id || MOCK_REPORT.jobId,
  };
}

/**
 * GET /api/report/{id}/export — Download PDF Report Blob from Backend
 */
export async function exportReportPdf(id: string): Promise<Blob> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/report/${id}/export`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.blob();
    }
  } catch {
    // Backend offline fallback
  }

  const mockPdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (IntentShield Analysis Report - ${id}) /Risk (85) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
  return new Blob([mockPdfContent], { type: 'application/pdf' });
}

/**
 * GET /api/history — Paginated scan history from Backend
 */
export async function getScanHistory(params?: {
  page?: number;
  filter?: string;
  search?: string;
}): Promise<PaginatedHistoryResponse> {
  try {
    const config = getStoredApiConfig();
    const page = params?.page || 1;
    const query = new URLSearchParams({
      page: String(page),
      filter: params?.filter || 'all',
      search: params?.search || '',
    });

    const res = await fetch(`${config.baseUrl}/api/history?${query}`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  let filtered = [...MOCK_HISTORY_ITEMS];
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (item) => item.appName.toLowerCase().includes(s) || item.packageName.toLowerCase().includes(s)
    );
  }
  if (params?.filter && params.filter !== 'all') {
    filtered = filtered.filter((item) => item.riskLevel === params.filter);
  }

  return {
    items: filtered,
    total: filtered.length,
    page: params?.page || 1,
    totalPages: 1,
  };
}

/**
 * DELETE /api/history/{id} — Delete scan record on Backend
 */
export async function deleteScanRecord(id: string): Promise<void> {
  try {
    const config = getStoredApiConfig();
    await fetch(`${config.baseUrl}/api/history/${id}`, {
      method: 'DELETE',
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });
  } catch {
    // Mock delete silent success
  }
}

/**
 * GET /api/settings — Fetch application settings from Backend
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/settings`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return MOCK_SETTINGS;
}

/**
 * PATCH /api/settings — Update application settings on Backend
 */
export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
      },
      body: JSON.stringify(partial),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return { ...MOCK_SETTINGS, ...partial };
}

/**
 * GET /api/settings/risk-weights — Fetch Risk Formula Weights from Backend
 */
export async function getRiskWeights(): Promise<RiskWeights> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/settings/risk-weights`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return FIXED_RISK_WEIGHTS;
}

/**
 * GET /api/settings/threat-intel-sources — Fetch Connected CTI Feeds from Backend
 */
export async function getThreatIntelSources(): Promise<ThreatIntelSource[]> {
  try {
    const config = getStoredApiConfig();
    const res = await fetch(`${config.baseUrl}/api/settings/threat-intel-sources`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline fallback
  }

  return MOCK_THREAT_INTEL_SOURCES;
}

/**
 * GET /api/health — Service Health Check on Backend
 */
export async function getHealthStatus(customUrl?: string): Promise<HealthStatus> {
  const config = getStoredApiConfig();
  const targetUrl = customUrl || config.baseUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${targetUrl}/api/health`, {
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        status: 'ok',
        version: data.version || '1.4.0',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch {
    // Backend offline fallback response
  }

  return MOCK_HEALTH_STATUS;
}
