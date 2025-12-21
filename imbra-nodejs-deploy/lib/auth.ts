// Authentication middleware for API routes
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  isAdmin?: boolean;
}

export interface AgentAuthResult {
  success: boolean;
  agentId?: string;
  tenantId?: string;
  error?: string;
}

export interface TenantAuthResult {
  success: boolean;
  userId?: string;
  tenantId?: string;
  role?: string;
  error?: string;
}

/**
 * Verify JWT token and return user info
 */
export async function verifyJWT(token: string): Promise<AuthenticatedUser | null> {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Fetch user from database for latest info
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        tenant: true,
      },
    });
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? undefined,
      isAdmin: user.role === 'SUPER_ADMIN',
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify agent token for agent portal
 */
export async function verifyAgentToken(request: NextRequest): Promise<AgentAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, error: 'Missing authorization token' };
    }
    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verify agent exists and is active
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agentId || payload.id,
        isActive: true,
      },
    });
    
    if (!agent) {
      return { success: false, error: 'Agent not found or inactive' };
    }
    
    return {
      success: true,
      agentId: agent.id,
      tenantId: agent.tenantId,
    };
  } catch (error) {
    console.error('Agent token verification failed:', error);
    return { success: false, error: 'Invalid token' };
  }
}

/**
 * Verify tenant access for API endpoints
 */
export async function verifyTenantAccess(request: NextRequest): Promise<TenantAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, error: 'Missing authorization token' };
    }
    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        tenant: true,
      },
    });
    
    if (!user || !user.tenant) {
      return { success: false, error: 'User or tenant not found' };
    }
    
    return {
      success: true,
      userId: user.id,
      tenantId: user.tenantId ?? undefined,
      role: user.role,
    };
  } catch (error) {
    console.error('Tenant access verification failed:', error);
    return { success: false, error: 'Invalid token' };
  }
}

export async function verifyAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      // For development, allow access with mock user
      return {
        id: 'dev-user-1',
        email: 'dev@dealership.com',
        role: 'HR_MANAGER',
        tenantId: 'tenant-1'
      };
    }
    
    return await verifyJWT(token);
  } catch (error) {
    return null;
  }
}

export async function verifyAuthApi(req: NextApiRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

    if (!token) {
      // For development, allow access with mock user
      return {
        id: 'dev-user-1',
        email: 'dev@dealership.com',
        role: 'HR_MANAGER',
        tenantId: 'tenant-1',
      };
    }

    return await verifyJWT(token);
  } catch (error) {
    return null;
  }
}

export function requireAuth(roles?: string[]) {
  return async (req: NextRequest, handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (roles && !roles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return handler(req, user);
  };
}

export function requireTenantAccess() {
  return async (req: NextRequest, handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant access' }, { status: 403 });
    }
    
    return handler(req, user);
  };
}

export function requireTenantAccessApi() {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse, user: AuthenticatedUser) => Promise<void>
  ) => {
    const user = await verifyAuthApi(req);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!user.tenantId) {
      res.status(403).json({ error: 'No tenant access' });
      return;
    }

    await handler(req, res, user);
  };
}