/**
 * API Configuration for Split Deployment
 * 
 * Frontend (static export) → Imbra
 * Backend API (Node server) → VPS
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_BASE_URL: API base URL accessible from browser (e.g., https://api.denuelauto.com)
 * - API_BASE_URL: Internal API URL for server-side calls (optional, falls back to NEXT_PUBLIC_API_BASE_URL)
 */

const publicBase = normalize(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL);
const serverBase = normalize(process.env.API_BASE_URL || process.env.API_INTERNAL_URL || process.env.API_URL);
const devFallback = 'http://localhost:4000';

function normalize(value?: string | null): string {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
}

interface ResolveOptions {
  allowBrowserFallback?: boolean;
  allowDevFallback?: boolean;
}

export function getApiBaseUrl(options: ResolveOptions = {}): string {
  const { allowBrowserFallback = false, allowDevFallback = true } = options;
  const envBase = normalize(publicBase || serverBase);
  if (envBase) return envBase;

  // In static export mode, we cannot rely on same-origin
  // Must have NEXT_PUBLIC_API_BASE_URL configured
  if (allowBrowserFallback && typeof window !== 'undefined') {
    // Only use window.location.origin in dev mode, not in production static export
    if (process.env.NODE_ENV === 'development') {
      return normalize(window.location.origin);
    }
  }

  if (allowDevFallback && process.env.NODE_ENV === 'development') {
    return devFallback;
  }

  return '';
}

interface BuildOptions {
  allowRelative?: boolean;
}

/**
 * Build a full API URL from a path
 * @param path - API path (e.g., '/api/auth/login' or 'api/auth/login')
 * @param options - Build options
 * @returns Full API URL
 */
export function makeApiUrl(path: string, options: BuildOptions = {}): string {
  const { allowRelative = false } = options;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl({ allowBrowserFallback: allowRelative, allowDevFallback: true });

  // If no base URL and we're in development, allow relative paths
  if (!base) {
    if (allowRelative || process.env.NODE_ENV === 'development') {
      return normalizedPath;
    }
    // In production without a base URL, log a warning but still return relative path
    // This allows graceful degradation
    if (typeof window !== 'undefined') {
      console.warn('[API Config] NEXT_PUBLIC_API_BASE_URL is not set. API calls may fail in static export mode.');
    }
    return normalizedPath;
  }

  const baseForJoin = base.endsWith('/') ? base : `${base}/`;

  try {
    return new URL(normalizedPath, baseForJoin).toString();
  } catch {
    const trimmedBase = base.replace(/\/+$/, '');
    return `${trimmedBase}${normalizedPath}`;
  }
}

/**
 * Check if API is configured for external deployment
 */
export function isApiConfigured(): boolean {
  return Boolean(publicBase || serverBase);
}

/**
 * Get the configured API base URL (for display/debugging)
 */
export function getConfiguredApiUrl(): string {
  return publicBase || serverBase || '(not configured)';
}

/**
 * Wrapper around fetch that automatically prepends the API base URL
 * and handles credentials for cross-origin requests
 */
export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = makeApiUrl(path);
  
  // For cross-origin requests, we need to include credentials
  const isExternalApi = Boolean(publicBase || serverBase);
  const defaultInit: RequestInit = isExternalApi
    ? { credentials: 'include', mode: 'cors' }
    : {};
  
  return fetch(url, { ...defaultInit, ...init });
}

