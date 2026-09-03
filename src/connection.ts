export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const GET_APIS = {
  // Auth
  roles: `${BASE_URL}/api/v1/auth/roles`,
  verifySession: `${BASE_URL}/api/v1/auth/verify`,
  menuPermissions: `${BASE_URL}/api/v1/auth/menu-permissions`,

  // Parent
  parentDashboard: `${BASE_URL}/api/v1/parents/dashboard`,
  parentMe: `${BASE_URL}/api/v1/parents/me`,
  parentChildren: `${BASE_URL}/api/v1/parents/me/children`,
  childOverview: (id: string | number) => `${BASE_URL}/api/v1/parents/me/children/${id}/overview`,
  childLearningPath: (id: string | number) => `${BASE_URL}/api/v1/parents/me/children/${id}/learning-path`,

  // Runbooks
  runbooks: `${BASE_URL}/api/v1/runbooks`,

  // Gamification
  badges: `${BASE_URL}/api/v1/gamification/badges`,
  leaderboard: `${BASE_URL}/api/v1/leaderboard`,

  // Communication
  teachers: `${BASE_URL}/api/v1/teachers`,
  conversations: `${BASE_URL}/api/v1/conversations`,
  dossiers: `${BASE_URL}/api/v1/dossiers`,
  dossierPreview: (id: string | number) => `${BASE_URL}/api/v1/dossiers/preview/${id}`,
  publicDossier: (token: string) => `${BASE_URL}/api/v1/dossiers/public/${encodeURIComponent(token)}`,
  ptmSchedules: `${BASE_URL}/api/v1/ptm/schedules`,

  // Subscriptions
  subscriptionPlans: `${BASE_URL}/api/v1/subscriptions/plans`,

  // Admin & Health
  adminStatistics: `${BASE_URL}/api/v1/admin/statistics`,
  health: `${BASE_URL}/api/v1/health`,
};

export const POST_APIS = {
  // Auth
  login: `${BASE_URL}/api/v1/auth/login`,
  googleLogin: `${BASE_URL}/api/v1/auth/google`,
  register: `${BASE_URL}/api/v1/auth/register`,
  childLogin: `${BASE_URL}/api/v1/auth/child-login`,
  logout: `${BASE_URL}/api/v1/auth/logout`,
  refreshToken: `${BASE_URL}/api/v1/auth/refresh`,

  // Parent
  addChild: `${BASE_URL}/api/v1/parents/me/children`,

  // Exams
  generateExam: `${BASE_URL}/api/v1/exams/generate`,
  submitExam: (id: string) => `${BASE_URL}/api/v1/exams/${id}/submit`,

  // Runbooks
  createRunbook: `${BASE_URL}/api/v1/runbooks`,

  // Gamification
  awardXp: `${BASE_URL}/api/v1/gamification/award-xp`,

  // Communication
  createConversation: `${BASE_URL}/api/v1/conversations`,
  sendMessage: (id: string) => `${BASE_URL}/api/v1/conversations/${id}/messages`,
  createDossier: `${BASE_URL}/api/v1/dossiers`,
  schedulePTM: `${BASE_URL}/api/v1/ptm/schedule`,

  // Subscriptions
  upgradeSubscription: `${BASE_URL}/api/v1/subscriptions/upgrade`,

  // Admin
  adminLogin: `${BASE_URL}/api/v1/admin/login`,
  adminResetPassword: `${BASE_URL}/api/v1/admin/reset-password`,
  resetQuota: (id: string | number) => `${BASE_URL}/api/v1/admin/children/${id}/reset-quota`,
};

export const PUT_APIS = {
  updateChild: (id: string | number) => `${BASE_URL}/api/v1/parents/me/children/${id}`,
  updateRunbook: (id: string) => `${BASE_URL}/api/v1/runbooks/${id}`,
  markMessageRead: (id: string) => `${BASE_URL}/api/v1/messages/${id}/read`,
};

export const DELETE_APIS = {
  deleteChild: (id: string | number) => `${BASE_URL}/api/v1/parents/me/children/${id}`,
  deleteRunbook: (id: string) => `${BASE_URL}/api/v1/runbooks/${id}`,
  deleteDossier: (id: string) => `${BASE_URL}/api/v1/dossiers/${encodeURIComponent(id)}`,
};
