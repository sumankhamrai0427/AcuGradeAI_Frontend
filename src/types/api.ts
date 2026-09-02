// src/types/index.ts
// Global TypeScript interfaces and types for the AcuGrade application.

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

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
