import { NextRequest, NextResponse } from 'next/server';

// Role-based dashboard routing
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  'GENERAL_MANAGER': '/dashboard/general-manager',
  'SALES_MANAGER': '/dashboard/sales',
  'SERVICE_MANAGER': '/dashboard/service',
  'FINANCE_MANAGER': '/dashboard/finance-manager',
  'MARKETING_MANAGER': '/dashboard/marketing-manager',
  'HR_MANAGER': '/dashboard/hr-manager',
  'IT_MANAGER': '/dashboard/it-manager',
  'SALES_REP': '/dashboard/sales-rep',
  'TECHNICIAN': '/dashboard/service',
  'CUSTOMER_SERVICE': '/dashboard/customer-support',
  'RECEPTIONIST': '/dashboard/reception',
  'LOT_ATTENDANT': '/dashboard/lot-attendant',
  'SECURITY': '/dashboard/security',
  'OTHER': '/dashboard/general-manager'
};

/**
 * Decode JWT payload without verification (Edge Runtime compatible).
 * Full verification happens on the backend; this is for routing only.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply middleware to dashboard routes
  if (pathname === '/dashboard') {
    // Get user role from JWT token in cookie or Authorization header
    let userRole = 'GENERAL_MANAGER'; // fallback default
    
    const token = request.cookies.get('token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && typeof payload.role === 'string') {
        userRole = payload.role;
      }
    }

    const dashboardPath = ROLE_DASHBOARD_MAP[userRole] || '/dashboard/general-manager';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }
  
  // Protect API routes - require authorization header in all environments
  if (pathname.startsWith('/api/staff') || pathname.startsWith('/api/departments')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/staff/:path*', '/api/departments/:path*']
};