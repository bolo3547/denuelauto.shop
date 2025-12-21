import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const AUTH_COOKIE_NAME = 'denuel_auth_token';

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  dealer_owner: 100,
  dealer_manager: 80,
  sales: 60,
  agent: 40,
  viewer: 20,
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenant?: { id: string; slug: string; name: string };
    }
  }
}

/**
 * Base auth middleware - verifies JWT and attaches user to request
 */
export const authMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[AUTH_COOKIE_NAME];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId || payload.id },
      select: { id: true, email: true, role: true, tenantId: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.role,
      tenantId: user.tenantId || ''
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Tenant isolation middleware - ensures user can only access their own tenant's data
 * Extracts tenant from URL params (:tenantId or :slug) or body
 */
export const tenantIsolation: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Extract tenant identifier from various sources
  const tenantId = req.params.tenantId || req.body?.tenantId || req.query.tenantId;
  const slug = req.params.slug || req.query.slug;

  let requestedTenantId = tenantId;

  // If slug provided, resolve to tenantId
  if (slug && !tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slug as string },
      select: { id: true, slug: true, name: true }
    });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    requestedTenantId = tenant.id;
    req.tenant = tenant;
  }

  // If no tenant specified, use user's tenant
  if (!requestedTenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: { id: true, slug: true, name: true }
    });
    req.tenant = tenant!;
    return next();
  }

  // Enforce tenant isolation
  if (requestedTenantId !== req.user.tenantId) {
    console.warn(`[SECURITY] Tenant isolation violation: User ${req.user.id} (tenant ${req.user.tenantId}) attempted to access tenant ${requestedTenantId}`);
    return res.status(403).json({ error: 'Access denied: tenant isolation violation' });
  }

  // Attach tenant info if not already
  if (!req.tenant) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: requestedTenantId },
      select: { id: true, slug: true, name: true }
    });
    req.tenant = tenant!;
  }

  next();
};

/**
 * RBAC middleware factory - requires specific roles
 * @param allowedRoles Array of role names that can access the resource
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`[SECURITY] Role check failed: User ${req.user.id} with role ${req.user.role} denied access. Required: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * RBAC middleware - requires minimum role level
 * @param minRole Minimum role required (inclusive)
 */
export function requireMinRole(minRole: string): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      console.warn(`[SECURITY] Role level check failed: User ${req.user.id} (level ${userLevel}) denied. Required level: ${requiredLevel}`);
      return res.status(403).json({
        error: `Access denied. Minimum role required: ${minRole}`
      });
    }

    next();
  };
}

/**
 * Resource ownership middleware - ensures user owns the resource or has manager+ role
 * @param getOwnerId Function to extract owner ID from request
 */
export function requireOwnership(getOwnerId: (req: Request) => Promise<string | null>): RequestHandler {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Managers and above can access any resource in their tenant
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    if (userLevel >= ROLE_HIERARCHY.dealer_manager) {
      return next();
    }

    // Check ownership
    const ownerId = await getOwnerId(req);
    if (ownerId && ownerId !== req.user.id) {
      console.warn(`[SECURITY] Ownership check failed: User ${req.user.id} tried to access resource owned by ${ownerId}`);
      return res.status(403).json({ error: 'Access denied: not the resource owner' });
    }

    next();
  };
}

/**
 * Rate limiting per tenant to prevent abuse
 */
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

export function tenantRateLimit(maxRequests: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Let auth middleware handle
    }

    const key = `${req.user.tenantId}:${req.user.id}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((record.resetAt - now) / 1000) 
      });
    }

    record.count++;
    next();
  };
}

/**
 * Audit logging middleware - logs all API access
 */
export const auditLog: RequestHandler = async (req, res, next) => {
  const start = Date.now();

  // Log after response
  res.on('finish', async () => {
    if (!req.user) return;

    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      tenantId: req.user.tenantId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    };

    // Console log for now - in production, write to database or log service
    if (res.statusCode >= 400) {
      console.warn('[AUDIT]', JSON.stringify(log));
    } else {
      console.log('[AUDIT]', JSON.stringify(log));
    }

    // Optionally write to database
    // try {
    //   await prisma.auditLog.create({ data: { ...log, tenantId: req.user.tenantId } });
    // } catch (e) { /* ignore */ }
  });

  next();
};

/**
 * Combined auth + tenant isolation middleware
 */
export const authenticatedTenant: RequestHandler[] = [authMiddleware, tenantIsolation];

/**
 * Admin-only routes (dealer_owner or dealer_manager)
 */
export const adminOnly: RequestHandler[] = [
  authMiddleware, 
  tenantIsolation, 
  requireMinRole('dealer_manager')
];

/**
 * Owner-only routes (dealer_owner only)
 */
export const ownerOnly: RequestHandler[] = [
  authMiddleware,
  tenantIsolation,
  requireRole('dealer_owner')
];
