export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_V1 = `${BASE_URL}/api/v1`;

export const GET_APIS = {
  // Auth
  roles: `${API_V1}/auth/roles`,
  verifySession: `${API_V1}/auth/verify`,
  menuPermissions: `${API_V1}/auth/menu-permissions`,
  checkUsername: (username: string) => `${API_V1}/auth/check-username?username=${encodeURIComponent(username)}`,

  // Master Data
  boardClassDropdown: `${API_V1}/master/board_class_dropdown`,

  // Parent
  parentDashboard: `${API_V1}/parents/dashboard`,
  parentMe: `${API_V1}/parents/me`,
  parentChildren: `${API_V1}/parents/me/children`,
  childOverview: (id: string | number) => `${API_V1}/parents/me/children/${id}/overview`,
  childLearningPath: (id: string | number) => `${API_V1}/parents/me/children/${id}/learning-path`,
  scheduledExams: `${API_V1}/parents/scheduled-exams`,

  // Student
  studentDashboard: `${API_V1}/students/dashboard`,
  studentMe: `${API_V1}/students/me`,
  studentLearningPath: `${API_V1}/students/me/learning-path`,
  assignedExams: `${API_V1}/students/assigned-exams`,

  // Notifications
  notifications: `${API_V1}/notifications`,

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

  // Blogs
  blogs: `${API_V1}/blogs`,
  blogById: (id: string | number) => `${API_V1}/blogs/${id}`,
  blogCategories: `${API_V1}/blogs/categories`,
  blogAuthors: `${API_V1}/blogs/authors`,

  // Admin & Health
  adminStatistics: `${API_V1}/admin/statistics`,
  adminDashboard: `${API_V1}/admin/dashboard`,
  adminUsers: (params?: string) => `${API_V1}/admin/users${params ? `?${params}` : ''}`,
  adminAuditLogs: (params?: string) => `${API_V1}/admin/audit-logs${params ? `?${params}` : ''}`,
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
  scheduleExam: `${API_V1}/parents/schedule-exam`,

  // Notifications
  markAllNotificationsRead: `${API_V1}/notifications/read-all`,

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

  // Blogs
  createBlog: `${API_V1}/blogs`,
  uploadBlogImage: `${API_V1}/files/upload-image`,
  createBlogCategory: `${API_V1}/blogs/categories`,
  createBlogAuthor: `${API_V1}/blogs/authors`,

  // Admin
  adminLogin: `${API_V1}/admin/login`,
  adminResetPassword: `${API_V1}/admin/reset-password`,
};

export const PUT_APIS = {
  updateChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  updateRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  updateBlog: (id: string | number) => `${API_V1}/blogs/${id}`,
  updateBlogCategory: (id: string | number) => `${API_V1}/blogs/categories/${id}`,
  markMessageRead: (id: string) => `${API_V1}/messages/${id}/read`,
  markNotificationRead: (id: string) => `${API_V1}/notifications/${id}/read`,
};

export const DELETE_APIS = {
  deleteChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  deleteScheduledExam: (id: string) => `${API_V1}/parents/scheduled-exams/${id}`,
  deleteRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  deleteBlog: (id: string | number) => `${API_V1}/blogs/${id}`,
  deleteBlogCategory: (id: string | number) => `${API_V1}/blogs/categories/${id}`,
  deleteDossier: (id: string) => `${API_V1}/dossiers/${encodeURIComponent(id)}`,
};
