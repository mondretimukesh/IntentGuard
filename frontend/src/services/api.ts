import type {
  AnalysisJobResponse,
  AnalysisReport,
  AppSettings,
  HealthStatus,
  PaginatedHistoryResponse,
  RiskWeights,
  ThreatIntelSource,
} from '../types';

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

// ── DIRECT REST API CALLS TO BACKEND ──────────────────────────────

/**
 * POST /api/analyze — Upload APK file to Backend for analysis
 */
export async function analyzeApk(
  fileInput: File | { name: string; size: string; sha256: string }
): Promise<{ jobId: string; sha256: string }> {
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

  if (!res.ok) {
    throw new Error(`Failed to upload APK for analysis. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * GET /api/analyze/{id} — Poll job status from Backend
 */
export async function getJobStatus(jobId: string): Promise<AnalysisJobResponse> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/analyze/${jobId}`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job status for ${jobId}. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * GET /api/report/{id} — Fetch full structured report from Backend
 */
export async function getReport(id: string): Promise<AnalysisReport> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/report/${id}`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch report for ID ${id}. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * GET /api/report/{id}/export — Download PDF Report Blob from Backend
 */
export async function exportReportPdf(id: string): Promise<Blob> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/report/${id}/export`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to export PDF report for ID ${id}. Status: ${res.status}`);
  }

  return await res.blob();
}

/**
 * GET /api/history — Paginated scan history from Backend
 */
export async function getScanHistory(params?: {
  page?: number;
  filter?: string;
  search?: string;
}): Promise<PaginatedHistoryResponse> {
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

  if (!res.ok) {
    throw new Error(`Failed to fetch scan history. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * DELETE /api/history/{id} — Delete scan record on Backend
 */
export async function deleteScanRecord(id: string): Promise<void> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/history/${id}`, {
    method: 'DELETE',
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    console.warn(`Could not delete scan record ${id} on backend.`);
  }
}

/**
 * GET /api/settings — Fetch application settings from Backend
 */
export async function getSettings(): Promise<AppSettings> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/settings`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch app settings. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * PATCH /api/settings — Update application settings on Backend
 */
export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
    },
    body: JSON.stringify(partial),
  });

  if (!res.ok) {
    throw new Error(`Failed to update app settings. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * GET /api/settings/risk-weights — Fetch Risk Formula Weights from Backend
 */
export async function getRiskWeights(): Promise<RiskWeights> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/settings/risk-weights`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    return FIXED_RISK_WEIGHTS;
  }

  return await res.json();
}

/**
 * GET /api/settings/threat-intel-sources — Fetch Connected CTI Feeds from Backend
 */
export async function getThreatIntelSources(): Promise<ThreatIntelSource[]> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/settings/threat-intel-sources`, {
    headers: config.apiKey ? { 'X-API-Key': config.apiKey } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch threat intel sources. Status: ${res.status}`);
  }

  return await res.json();
}

/**
 * GET /api/health — Service Health Check on Backend
 */
export async function getHealthStatus(customUrl?: string): Promise<HealthStatus> {
  const config = getStoredApiConfig();
  const targetUrl = customUrl || config.baseUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
    // Backend offline response
  }

  return {
    status: 'offline',
    version: '1.4.0',
    timestamp: new Date().toISOString(),
  };
}
