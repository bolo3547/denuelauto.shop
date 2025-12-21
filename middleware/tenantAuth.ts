import { NextApiRequest, NextApiResponse } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../prismaClient';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
  };
  tenant?: {
    id: string;
    slug: string;
    name: string;
  };
}

export type TenantRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const ROLE_MAPPING: Record<string, TenantRole> = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'ADMIN',
  OWNER: 'ADMIN',
  DEALER_OWNER: 'ADMIN',
  MANAGER: 'MANAGER',
  DEALER_MANAGER: 'MANAGER',
  DEALER_ADMIN: 'MANAGER',
  OPERATIONS: 'MANAGER',
  SALES: 'AGENT',
  AGENT: 'AGENT',
  ADVISOR: 'AGENT',
  SUPPORT: 'VIEWER',
  VIEWER: 'VIEWER',
  READONLY: 'VIEWER',
};

interface TokenPayload extends JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
  tenantId?: string;
}

function normalizeRole(role?: string | null): TenantRole | null {
  if (!role) {
    return null;
  }
  const normalized = role.replace(/[^a-z0-9_]/gi, '').toUpperCase();
  return ROLE_MAPPING[normalized] ?? null;
}

function getRequestIp(req: NextApiRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress || 'unknown';
}

async function recordAuditLog(
  req: AuthenticatedRequest,
  tenantId: string,
  allowedRoles: TenantRole[]
) {
  if (!req.user) {
    return;
  }

  try {
    await prisma.auditlog.create({
      data: {
        actorType: 'TENANT_USER',
        actorId: req.user.id,
        tenantId,
        action: `API_${req.method || 'UNKNOWN'}`,
        entity: 'API_REQUEST',
        entityId: req.url?.split('?')[0] || 'unknown',
        ip: getRequestIp(req),
        ua: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
        metaJson: {
          method: req.method,
          path: req.url,
          role: req.user.role,
          requiredRoles: allowedRoles,
        },
      },
    });
  } catch (error) {
    console.warn('Failed to create audit log entry', error);
  }
}

/**
 * Middleware to require specific tenant roles for API access
 * Usage: requireTenantRole(['ADMIN', 'MANAGER'])(handler)
 */
export function requireTenantRole(allowedRoles: TenantRole[]) {
  return function (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return async function (req: AuthenticatedRequest, res: NextApiResponse) {
      try {
        // Extract tenant slug from URL
        const { slug } = req.query;
        if (!slug || typeof slug !== 'string') {
          return res.status(400).json({ error: 'Tenant slug is required' });
        }

        // Verify tenant exists
        const tenant = await prisma.tenant.findUnique({
          where: { slug }
        });

        if (!tenant) {
          return res.status(404).json({ error: 'Tenant not found' });
        }

        // Extract JWT token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.substring(7);
        let decoded: TokenPayload;

        try {
          decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        } catch (jwtError) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
          return res.status(401).json({ error: 'Invalid token payload' });
        }

        const userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            tenantId: true,
          }
        });

        if (!userRecord) {
          return res.status(401).json({ error: 'User not found' });
        }

        const effectiveTenantId = userRecord.tenantId || decoded.tenantId;

        // Verify user belongs to the requested tenant
        if (!effectiveTenantId || effectiveTenantId !== tenant.id) {
          return res.status(403).json({ error: 'Access denied: User not authorized for this tenant' });
        }

        const userRole =
          normalizeRole(userRecord.role) ||
          normalizeRole(decoded.role) ||
          null;

        if (!userRole) {
          return res.status(403).json({ error: 'Access denied: user role missing or unsupported' });
        }

        // Check if user has required role
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            error: `Access denied: Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${userRole}`
          });
        }

        // Attach user and tenant info to request
        req.user = {
          id: userRecord.id,
          email: userRecord.email || decoded.email || '',
          role: userRole,
          tenantId: tenant.id,
          tenantSlug: tenant.slug
        };

        req.tenant = {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name
        };

        // Log the access for audit purposes
        console.log(
          `API Access: ${req.user.email} (${userRole}) accessed ${req.method} ${req.url} for tenant ${tenant.slug}`
        );

        await recordAuditLog(req, tenant.id, allowedRoles);

        return handler(req, res);
      } catch (error) {
        console.error('Authorization middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}

/**
 * Utility to log agent activity
 */
export async function logAgentActivity(
  tenantId: string,
  agentId: string,
  action: string,
  description: string,
  leadId?: string,
  metadata?: any
) {
  try {
    await prisma.agentActivityLog.create({
      data: {
        tenantId,
        agentId,
        leadId,
        action,
        description,
        metadata
      }
    });
  } catch (error) {
    console.error('Failed to log agent activity:', error);
    // Don't throw - logging shouldn't break the main flow
  }
}

/**
 * Utility to create tenant notifications
 */
export async function createTenantNotification(
  tenantId: string,
  type: string,
  title: string,
  message: string,
  metadata?: any
) {
  try {
    await prisma.hqNotification.create({
      data: {
        tenantId,
        type,
        title,
        message,
        metadata,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Failed to create tenant notification:', error);
  }
}

/**
 * Auto-assign lead to available agent based on rules
 */
export async function autoAssignLead(leadId: string, tenantId: string): Promise<string | null> {
  try {
    // Get tenant settings for assignment rules
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });

    const assignmentRules = tenant?.settings?.autoAssignRules || { method: 'ROUND_ROBIN' };

    // Get available agents for this tenant
    const agents = await prisma.agent.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        portalAccess: true
      },
      include: {
        _count: {
          select: { assignedLeads: true }
        }
      },
      orderBy: assignmentRules.method === 'ROUND_ROBIN' 
        ? { assignedLeads: { _count: 'asc' } }
        : { createdAt: 'asc' }
    });

    if (agents.length === 0) {
      console.log('No available agents found for auto-assignment');
      return null;
    }

    // TODO: Implement skills-based matching
    // For now, use simple round-robin
    const selectedAgent = agents[0];

    // Assign the lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        agentId: selectedAgent.id,
        assignedAt: new Date(),
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });

    // Log the assignment
    await logAgentActivity(
      tenantId,
      selectedAgent.id,
      'LEAD_AUTO_ASSIGNED',
      `Lead automatically assigned via ${assignmentRules.method}`,
      leadId,
      { assignmentMethod: assignmentRules.method, agentLoadCount: selectedAgent._count.assignedLeads }
    );

    return selectedAgent.id;
  } catch (error) {
    console.error('Auto-assignment failed:', error);
    return null;
  }
}
