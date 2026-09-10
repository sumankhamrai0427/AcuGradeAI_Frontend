// Global TypeScript interfaces and types for the SahajPath application.

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
    username?: string;
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

export interface AppNotification {
  id: string;
  userId: number;
  senderId?: number | null;
  type: string; // 'EXAM_ASSIGNED' | 'EXAM_SUBMITTED' | 'SYSTEM'
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface ScheduledExam {
  id: string;
  parentId: number;
  studentId: number;
  studentName?: string;
  studentAvatar?: string;
  title: string;
  subject: string;
  chapterTopic?: string | null;
  board: string;
  classGrade: string;
  difficulty: 'simple' | 'medium' | 'hard';
  questionCount: number;
  timeLimitMinutes: number;
  scheduledAt?: string | null;
  dueDate?: string | null;
  parentInstructions?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  examId?: string | null;
  submissionId?: string | null;
  score?: number | null;
  totalMarks?: number | null;
  accuracy?: number | null;
  createdAt: string;
}

export interface ScheduleExamPayload {
  studentId: number;
  subject: string;
  chapterTopic?: string;
  difficulty?: 'simple' | 'medium' | 'hard';
  questionCount?: number;
  timeLimitMinutes?: number;
  scheduledAt?: string;
  dueDate?: string;
  parentInstructions?: string;
  title?: string;
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

