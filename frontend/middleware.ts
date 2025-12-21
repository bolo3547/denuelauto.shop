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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply middleware to dashboard routes
  if (pathname === '/dashboard') {
    // TODO: Get user role from JWT token or session
    // For now, redirect to HR manager dashboard as example
    const userRole = 'HR_MANAGER'; // This should come from auth
    const dashboardPath = ROLE_DASHBOARD_MAP[userRole] || '/dashboard/general-manager';
    
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }
  
  // Protect API routes
  if (pathname.startsWith('/api/staff') || pathname.startsWith('/api/departments')) {
    // TODO: Add proper JWT verification here
    const authHeader = request.headers.get('authorization');
    if (!authHeader && !process.env.NODE_ENV?.includes('dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/staff/:path*', '/api/departments/:path*']
};