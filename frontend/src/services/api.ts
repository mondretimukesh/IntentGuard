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
  TOKEN: 'intentguard_token',
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

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getAuthHeaders(): Record<string, string> {
  const config = getStoredApiConfig();
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  return headers;
}

// ── AUTHENTICATION API CALLS ──────────────────────────────────────

export interface AuthResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    status: string;
    organization?: string;
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponseData> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Authentication failed');
  }

  const data: AuthResponseData = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user',
  organization?: string
): Promise<AuthResponseData> {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ fullName, email, password, role, organization }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }

  const data: AuthResponseData = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function getCurrentUserProfile() {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return await res.json();
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Password update failed' }));
    throw new Error(err.detail || 'Password update failed');
  }
  return await res.json();
}

// ── ADMIN MANAGEMENT API CALLS ───────────────────────────────────

export async function getAdminUsers() {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin users');
  }
  return await res.json();
}

export async function createAdminUser(user: { name: string; email: string; role: 'user' | 'admin'; organization?: string }) {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ fullName: user.name, name: user.name, email: user.email, role: user.role, organization: user.organization }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create user' }));
    throw new Error(err.detail || 'Failed to create user');
  }
  return await res.json();
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    throw new Error('Failed to update user role');
  }
  return await res.json();
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update user status');
  }
  return await res.json();
}

export async function getAdminAuditLogs() {
  const config = getStoredApiConfig();
  const res = await fetch(`${config.baseUrl}/api/admin/audit-logs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  return await res.json();
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
      ...getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
  const candidateUrls = customUrl
    ? [customUrl]
    : [config.baseUrl, 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://127.0.0.1:8001'];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${url}/api/health`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // If discovered on another working candidate URL, update stored config
        if (!customUrl && url !== config.baseUrl) {
          setStoredApiConfig({ ...config, baseUrl: url });
        }
        return {
          status: 'ok',
          version: data.version || '1.4.0',
          timestamp: data.timestamp || new Date().toISOString(),
        };
      }
    } catch {
      // Continue probing next candidate
    }
  }

  return {
    status: 'offline',
    version: '1.4.0',
    timestamp: new Date().toISOString(),
  };
}
