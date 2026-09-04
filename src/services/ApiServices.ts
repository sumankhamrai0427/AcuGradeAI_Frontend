import axios from 'axios';
import { GET_APIS, POST_APIS, PUT_APIS, DELETE_APIS } from '../connection';
import { AuthTokens, ApiError } from '../types/api';

// ─────────────────────────────────────────────
// Token Storage Utilities
// ─────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'acugrade_access_token';
const REFRESH_TOKEN_KEY = 'acugrade_refresh_token';

export function getStoredTokens(): AuthTokens | null {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  if (
    !accessToken || !refreshToken ||
    accessToken === 'undefined' || refreshToken === 'undefined' ||
    accessToken === 'null' || refreshToken === 'null'
  ) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function storeTokens(tokensOrAccessToken: AuthTokens | string, maybeRefreshToken?: string) {
  let accToken = '';
  let refToken = '';

  if (typeof tokensOrAccessToken === 'string') {
    accToken = tokensOrAccessToken;
    refToken = maybeRefreshToken || '';
  } else if (tokensOrAccessToken && typeof tokensOrAccessToken === 'object') {
    accToken = tokensOrAccessToken.accessToken || '';
    refToken = tokensOrAccessToken.refreshToken || '';
  }

  if (accToken && accToken !== 'undefined' && accToken !== 'null') {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accToken);
  }
  if (refToken && refToken !== 'undefined' && refToken !== 'null') {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
  }
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function decodeTokenPayload(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Axios Instance & Interceptors
// ─────────────────────────────────────────────
const apiClient = axios.create();

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// Attach Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Handle 401 TOKEN_EXPIRED with auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED';

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getStoredTokens();
        if (!tokens) throw new Error('No refresh token');
        const res = await axios.post(POST_APIS.refreshToken, { refreshToken: tokens.refreshToken });
        const data = res.data;
        const newAccessToken = data.data?.accessToken || data.data?.tokens?.accessToken;
        const newRefreshToken = data.data?.refreshToken || data.data?.tokens?.refreshToken;
        if (newAccessToken && newRefreshToken) {
          storeTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
        throw new Error('Invalid tokens from refresh');
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error shape
    const code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    const message = error.response?.data?.message || error.response?.data?.error?.message || 'Request failed';
    const customError = new ApiError(code, message, error.response?.status);
    return Promise.reject(customError);
  }
);

// ─────────────────────────────────────────────
// ApiServices Class
// ─────────────────────────────────────────────
class ApiServices {
  /** Unwraps `response.data.data` just like the old fetch wrapper returned `json.data` */
  private async get(url: string) {
    const res = await apiClient.get(url);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async post(url: string, body?: any) {
    const res = await apiClient.post(url, body);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async put(url: string, body?: any) {
    const res = await apiClient.put(url, body);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async del(url: string) {
    const res = await apiClient.delete(url);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  // ── Auth ──────────────────────────────────
  /** Returns raw axios response so LoginPage can read response.data directly */
  login(body: any) { return apiClient.post(POST_APIS.login, body); }
  googleLogin(body: any) { return apiClient.post(POST_APIS.googleLogin, body); }
  register(body: any) { return this.post(POST_APIS.register, body); }
  getRoles() { return this.get(GET_APIS.roles); }
  verifySession() { return this.get(GET_APIS.verifySession); }
  async getMenuPermissions() { 
    const res = await this.get(GET_APIS.menuPermissions);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.pageAccess)) return res.pageAccess;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }
  childLogin(body: any) { return this.post(POST_APIS.childLogin, body); }
  logout(body: any) { return this.post(POST_APIS.logout, body); }

  // ── Master Data ───────────────────────────
  getChildRegistrationOptions() { return this.get(GET_APIS.childRegistrationOptions); }

  // ── Parent ────────────────────────────────
  getParentDashboard() { return this.get(GET_APIS.parentDashboard); }
  getMe() { return this.get(GET_APIS.parentMe); }
  getChildren() { return this.get(GET_APIS.parentChildren); }
  addChild(body: any) { return this.post(POST_APIS.addChild, body); }
  updateChild(childId: string | number, body: any) { return this.put(PUT_APIS.updateChild(childId), body); }
  deleteChild(childId: string | number) { return this.del(DELETE_APIS.deleteChild(childId)); }
  getChildOverview(childId: string | number) { return this.get(GET_APIS.childOverview(childId)); }
  getChildLearningPath(childId: string | number) { return this.get(GET_APIS.childLearningPath(childId)); }

  // ── Exams ─────────────────────────────────
  generateExam(body: any) { return this.post(POST_APIS.generateExam, body); }
  generateQuickTest(studentId: string | number, limit: number = 10) {
    return this.post(POST_APIS.generateQuickTest, { studentId, limit });
  }
  submitExam(examId: string, body: any) { return this.post(POST_APIS.submitExam(examId), body); }

  // ── Runbooks ──────────────────────────────
  listRunbooks(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`${GET_APIS.runbooks}${params ? `?${params}` : ''}`);
  }
  createRunbook(body: any) { return this.post(POST_APIS.createRunbook, body); }
  updateRunbook(id: string, body: any) { return this.put(PUT_APIS.updateRunbook(id), body); }
  removeRunbook(id: string) { return this.del(DELETE_APIS.deleteRunbook(id)); }

  // ── Gamification ──────────────────────────
  listBadges() { return this.get(GET_APIS.badges); }
  awardXp(body: any) { return this.post(POST_APIS.awardXp, body); }
  leaderboard(period: string = 'all_time') { return this.get(`${GET_APIS.leaderboard}?period=${period}`); }

  // ── Communication ─────────────────────────
  listTeachers() { return this.get(GET_APIS.teachers); }
  listConversations() { return this.get(GET_APIS.conversations); }
  createConversation(body: any) { return this.post(POST_APIS.createConversation, body); }
  sendMessage(conversationId: string, body: any) { return this.post(POST_APIS.sendMessage(conversationId), body); }
  markMessageRead(messageId: string) { return this.put(PUT_APIS.markMessageRead(messageId)); }
  createDossier(body: any) { return this.post(POST_APIS.createDossier, body); }
  listDossiers() { return this.get(GET_APIS.dossiers); }
  deleteDossier(dossierId: string) { return this.del(DELETE_APIS.deleteDossier(dossierId)); }
  getDossierPreview(studentId: string | number) { return this.get(GET_APIS.dossierPreview(studentId)); }
  getPublicDossier(shareToken: string) { return this.get(GET_APIS.publicDossier(shareToken)); }
  schedulePTM(body: any) { return this.post(POST_APIS.schedulePTM, body); }
  listPTMSchedules() { return this.get(GET_APIS.ptmSchedules); }

  // ── Subscriptions ─────────────────────────
  listPlans() { return this.get(GET_APIS.subscriptionPlans); }
  upgradeSubscription(body: any) { return this.post(POST_APIS.upgradeSubscription, body); }

  // ── Admin ─────────────────────────────────
  adminLogin(body: any) { return apiClient.post(POST_APIS.adminLogin, body); }
  adminResetPassword(body: any) { return this.post(POST_APIS.adminResetPassword, body); }
  adminStatistics() { return this.get(GET_APIS.adminStatistics); }
  resetQuota(studentId: string | number) { return this.post(POST_APIS.resetQuota(studentId)); }

  // ── Health ────────────────────────────────
  checkHealth() { return this.get(GET_APIS.health); }
}

export default new ApiServices();
