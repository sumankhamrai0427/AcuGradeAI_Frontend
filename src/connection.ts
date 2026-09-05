export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_V1 = `${BASE_URL}/api/v1`;

export const GET_APIS = {
  // Auth
  roles: `${API_V1}/auth/roles`,
  verifySession: `${API_V1}/auth/verify`,
  menuPermissions: `${API_V1}/auth/menu-permissions`,

  // Master Data
  childRegistrationOptions: `${API_V1}/master/child-registration-options`,

  // Parent
  parentDashboard: `${API_V1}/parents/dashboard`,
  parentMe: `${API_V1}/parents/me`,
  parentChildren: `${API_V1}/parents/me/children`,
  childOverview: (id: string | number) => `${API_V1}/parents/me/children/${id}/overview`,
  childLearningPath: (id: string | number) => `${API_V1}/parents/me/children/${id}/learning-path`,

  // Runbooks
  runbooks: `${API_V1}/runbooks`,

  // Gamification
  badges: `${API_V1}/gamification/badges`,
  leaderboard: `${API_V1}/leaderboard`,

  // Communication
  teachers: `${API_V1}/teachers`,
  conversations: `${API_V1}/conversations`,
  dossiers: `${API_V1}/dossiers`,
  dossierPreview: (id: string | number) => `${API_V1}/dossiers/preview/${id}`,
  publicDossier: (token: string) => `${API_V1}/dossiers/public/${encodeURIComponent(token)}`,
  ptmSchedules: `${API_V1}/ptm/schedules`,


  // Admin & Health
  adminStatistics: `${API_V1}/admin/statistics`,
  health: `${API_V1}/health`,
};

export const POST_APIS = {
  // Auth
  login: `${API_V1}/auth/login`,
  googleLogin: `${API_V1}/auth/google`,
  register: `${API_V1}/auth/register`,
  childLogin: `${API_V1}/auth/child-login`,
  logout: `${API_V1}/auth/logout`,
  refreshToken: `${API_V1}/auth/refresh`,

  // Parent
  addChild: `${API_V1}/parents/add-child`,

  // Exams
  generateExam: `${BASE_URL}/api/v1/exams/generate`,
  generateQuickTest: `${BASE_URL}/api/v1/exams/quick-test`,
  submitExam: (id: string) => `${BASE_URL}/api/v1/exams/${id}/submit`,

  // Chat
  chat: `${API_V1}/chat`,

  // Runbooks
  createRunbook: `${API_V1}/runbooks`,

  // Gamification
  awardXp: `${API_V1}/gamification/award-xp`,

  // Communication
  createConversation: `${API_V1}/conversations`,
  sendMessage: (id: string) => `${API_V1}/conversations/${id}/messages`,
  createDossier: `${API_V1}/dossiers`,
  schedulePTM: `${API_V1}/ptm/schedule`,


  // Admin
  adminLogin: `${API_V1}/admin/login`,
  adminResetPassword: `${API_V1}/admin/reset-password`,
};

export const PUT_APIS = {
  updateChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  updateRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  markMessageRead: (id: string) => `${API_V1}/messages/${id}/read`,
};

export const DELETE_APIS = {
  deleteChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  deleteRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  deleteDossier: (id: string) => `${API_V1}/dossiers/${encodeURIComponent(id)}`,
};
