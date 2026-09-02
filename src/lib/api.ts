// src/lib/api.ts
//
// Single point of contact with the AcuGrade Python backend (see /backend).
// Uses sessionStorage for token storage to ensure clean authentication state
// upon opening new sessions.

const ACCESS_TOKEN_KEY = 'acugrade_access_token';
const REFRESH_TOKEN_KEY = 'acugrade_refresh_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface MenuItemPermission {
  id: number;
  pageName: string;
  pageRoute: string;
  icon: string | null;
  menuOrder: number;
  isActive?: number | boolean;
}

export interface PageAccessItem {
  id: number;
  pageName: string;
  pageRoute: string;
  icon: string | null;
  menuOrder: number;
  isActive: number | boolean;
}

export interface RegistrationRole {
  id: number;
  roleName: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: number | boolean;
}

export interface AuthResponseData {
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
    role: string;
    subscriptionTier?: string;
    isActive: number | boolean;
    createdAt?: string;
  };
  pageAccess: PageAccessItem[];
}

export function getStoredTokens(): AuthTokens | null {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function storeTokens(tokens: AuthTokens) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  // Also clear legacy localStorage keys if present
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Decodes the role/subject out of a JWT without verifying it */
export function decodeTokenPayload(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const tokens = getStoredTokens();
  if (!tokens) return false;

  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = await res.json();
  const accessToken = data.data.accessToken || data.data.tokens?.accessToken;
  const refreshToken = data.data.refreshToken || data.data.tokens?.refreshToken;
  if (accessToken && refreshToken) {
    storeTokens({ accessToken, refreshToken });
    return true;
  }
  return false;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

/** Core request helper: attaches the bearer token, retries on 401 TOKEN_EXPIRED */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, isFormData = false } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (auth) {
      const tokens = getStoredTokens();
      if (tokens) headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
    return fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const errJson = await res.clone().json().catch(() => null);
    if (errJson?.error?.code === 'TOKEN_EXPIRED') {
      if (!refreshPromise) refreshPromise = tryRefreshToken().finally(() => (refreshPromise = null));
      const refreshed = await refreshPromise;
      if (refreshed) res = await doFetch();
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const code = json?.error?.code || 'UNKNOWN_ERROR';
    const message = json?.message || json?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiError(code, message, res.status);
  }
  return json.data as T;
}

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------
export const authApi = {
  getRoles: () => request<RegistrationRole[]>('/api/v1/auth/roles', { auth: false }),
  register: (name: string, email: string, password: string, role: string = 'PARENT') =>
    request<AuthResponseData>('/api/v1/auth/register', { method: 'POST', body: { name, email, password, role }, auth: false }),
  login: (email: string, password: string) =>
    request<AuthResponseData>('/api/v1/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  verifySession: () => request<{ valid: boolean; user: any; pageAccess: PageAccessItem[] }>('/api/v1/auth/verify'),
  getMenuPermissions: () => request<{ role: string; menuItems: PageAccessItem[]; pageAccess: PageAccessItem[] }>('/api/v1/auth/menu-permissions'),
  childLogin: (studentId: string | number, pin: string) =>
    request<{ accessToken: string; studentId: number; pageAccess: PageAccessItem[] }>('/api/v1/auth/child-login', { method: 'POST', body: { studentId, pin } }),
  logout: (refreshToken: string) =>
    request<{ loggedOut: boolean }>('/api/v1/auth/logout', { method: 'POST', body: { refreshToken } }),
};

// ------------------------------------------------------------
// Parent / children
// ------------------------------------------------------------
export const parentApi = {
  getMe: () => request<any>('/api/v1/parents/me'),
  getChildren: () => request<any[]>('/api/v1/parents/me/children'),
  addChild: (payload: any) => request<any>('/api/v1/parents/me/children', { method: 'POST', body: payload }),
  updateChild: (childId: string | number, payload: any) =>
    request<any>(`/api/v1/parents/me/children/${childId}`, { method: 'PUT', body: payload }),
  deleteChild: (childId: string | number) =>
    request<{ deleted: boolean }>(`/api/v1/parents/me/children/${childId}`, { method: 'DELETE' }),
  getChildOverview: (childId: string | number) =>
    request<{ child: any; recentExams: any[]; topicMastery: Record<string, number> }>(
      `/api/v1/parents/me/children/${childId}/overview`
    ),
  getChildLearningPath: (childId: string | number) =>
    request<any[]>(`/api/v1/parents/me/children/${childId}/learning-path`),
};

// ------------------------------------------------------------
// Exams
// ------------------------------------------------------------
export const examApi = {
  generate: (payload: {
    studentId: string | number; board: string; classGrade: string; subject: string; difficulty: string;
  }) => request<{ exam: any }>('/api/v1/exams/generate', { method: 'POST', body: payload }),
  submit: (examId: string, answers: Record<string, string>, timeTakenSeconds: number) =>
    request<{ submission: any; xpEarned: number; newlyUnlockedBadges: string[] }>(
      `/api/v1/exams/${examId}/submit`,
      { method: 'POST', body: { answers, timeTakenSeconds } }
    ),
};

// ------------------------------------------------------------
// Runbooks (admin)
// ------------------------------------------------------------
export const runbookApi = {
  list: (filters?: { board?: string; classGrade?: string; subject?: string }) => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return request<any[]>(`/api/v1/runbooks${params ? `?${params}` : ''}`, { auth: false });
  },
  create: (payload: any) => request<any>('/api/v1/runbooks', { method: 'POST', body: payload }),
  update: (id: string, payload: any) => request<any>(`/api/v1/runbooks/${id}`, { method: 'PUT', body: payload }),
  remove: (id: string) => request<{ deleted: boolean }>(`/api/v1/runbooks/${id}`, { method: 'DELETE' }),
};

// ------------------------------------------------------------
// Gamification / leaderboard
// ------------------------------------------------------------
export const gamificationApi = {
  listBadges: () => request<any[]>('/api/v1/gamification/badges', { auth: false }),
  awardXp: (studentId: string | number, amount: number, reason: string) =>
    request<{ xp: number; level: number }>('/api/v1/gamification/award-xp', {
      method: 'POST', body: { studentId, amount, reason },
    }),
  leaderboard: (period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time') =>
    request<any[]>(`/api/v1/leaderboard?period=${period}`, { auth: false }),
};

// ------------------------------------------------------------
// Parent-teacher communication
// ------------------------------------------------------------
export const communicationApi = {
  listTeachers: () => request<any[]>('/api/v1/teachers'),
  listConversations: () => request<any[]>('/api/v1/conversations'),
  createConversation: (teacherId: string | number, studentId: string | number) =>
    request<{ id: string }>('/api/v1/conversations', { method: 'POST', body: { teacherId, studentId } }),
  sendMessage: (conversationId: string, payload: any) =>
    request<any>(`/api/v1/conversations/${conversationId}/messages`, { method: 'POST', body: payload }),
  markRead: (messageId: string) => request<any>(`/api/v1/messages/${messageId}/read`, { method: 'PUT' }),
  createDossier: (payload: any) => request<any>('/api/v1/dossiers', { method: 'POST', body: payload }),
  listDossiers: () => request<any[]>('/api/v1/dossiers'),
  deleteDossier: (dossierId: string) =>
    request<{ deletedId: string; message: string }>(`/api/v1/dossiers/${encodeURIComponent(dossierId)}`, { method: 'DELETE' }),
  getDossierPreview: (studentId: string | number) =>
    request<any>(`/api/v1/dossiers/preview/${studentId}`),
  getPublicDossier: (shareToken: string) =>
    request<any>(`/api/v1/dossiers/public/${encodeURIComponent(shareToken)}`, { auth: false }),
  schedulePTM: (payload: { teacherId: string | number; studentId: string | number; scheduledAt: string; topic: string }) =>
    request<any>('/api/v1/ptm/schedule', { method: 'POST', body: payload }),
  listPTMSchedules: () => request<any[]>('/api/v1/ptm/schedules'),
};

// ------------------------------------------------------------
// Subscriptions
// ------------------------------------------------------------
export const subscriptionApi = {
  listPlans: () => request<any[]>('/api/v1/subscriptions/plans', { auth: false }),
  upgrade: (tier: string) =>
    request<{ subscriptionTier: string }>('/api/v1/subscriptions/upgrade', { method: 'POST', body: { tier } }),
};

// ------------------------------------------------------------
// Admin
// ------------------------------------------------------------
export const adminApi = {
  statistics: () => request<any>('/api/v1/admin/statistics', { auth: false }),
  resetQuota: (studentId: string | number) =>
    request<{ reset: boolean }>(`/api/v1/admin/children/${studentId}/reset-quota`, { method: 'POST' }),
};

export const healthApi = {
  check: () => request<any>('/api/v1/health', { auth: false }),
};
