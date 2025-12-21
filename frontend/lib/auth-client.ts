// Client-side authentication utility functions for all user types
'use client';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'dealer_owner' | 'dealer_admin' | 'agent' | 'buyer';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  type: 'hq_admin' | 'tenant_user' | 'buyer';
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  avatar?: string;
  permissions?: string[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

const AUTH_STORAGE_KEY = 'denuel_auth_session';

// Save auth session to localStorage
export function saveAuthSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

// Get auth session from localStorage
export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const session: AuthSession = JSON.parse(stored);
    
    // Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearAuthSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

// Clear auth session
export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  const session = getAuthSession();
  return session?.user || null;
}

// Get auth token
export function getAuthToken(): string | null {
  const session = getAuthSession();
  return session?.token || null;
}

// Get redirect path based on user role
export function getRedirectPath(user: AuthUser): string {
  switch (user.type) {
    case 'hq_admin':
      return '/super-admin';
    case 'tenant_user':
      if (user.tenantSlug) {
        if (user.role === 'dealer_owner' || user.role === 'dealer_admin') {
          return `/t/${user.tenantSlug}/admin`;
        } else if (user.role === 'agent') {
          return `/t/${user.tenantSlug}/agent`;
        }
        return `/t/${user.tenantSlug}`;
      }
      return '/dashboard';
    case 'buyer':
      if (user.tenantSlug) {
        return `/t/${user.tenantSlug}/account`;
      }
      return '/account';
    default:
      return '/';
  }
}

// Check if user has permission
export function hasPermission(permission: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Super admins have all permissions
  if (user.type === 'hq_admin' && user.role === 'SUPER_ADMIN') {
    return true;
  }
  
  return user.permissions?.includes(permission) || false;
}

// Check if user is super admin
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.type === 'hq_admin' && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');
}

// Check if user is tenant admin
export function isTenantAdmin(): boolean {
  const user = getCurrentUser();
  return user?.type === 'tenant_user' && (user.role === 'dealer_owner' || user.role === 'dealer_admin');
}

// Check if user is agent
export function isAgent(): boolean {
  const user = getCurrentUser();
  return user?.type === 'tenant_user' && user.role === 'agent';
}

// Check if user is buyer
export function isBuyer(): boolean {
  const user = getCurrentUser();
  return user?.type === 'buyer';
}

// API request with auth header
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Logout user
export function logout(): void {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
