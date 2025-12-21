/**
 * Subscription API Routes
 * 
 * Backend endpoints for subscription management, plan upgrades,
 * usage tracking, and AI audit logging.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// =============================================================================
// TYPES
// =============================================================================

interface SubscriptionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Ensure tenant is authenticated and has subscription access
 */
const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string || (req as any).tenantId;
  
  if (!tenantId) {
    return res.status(401).json({
      success: false,
      error: 'Tenant authentication required',
    });
  }
  
  (req as any).tenantId = tenantId;
  next();
};

/**
 * Require admin role for sensitive operations
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role;
  
  if (!['dealer_owner', 'dealer_manager', 'super_admin'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  
  next();
};

// =============================================================================
// SUBSCRIPTION ROUTES
// =============================================================================

/**
 * GET /api/subscription
 * Get current tenant subscription details
 */
router.get('/', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const prisma = (req as any).prisma as PrismaClient;

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          planType: 'starter',
          status: 'active',
          limits: {
            maxCars: 50,
            maxStaff: 3,
            maxBranches: 1,
            aiRequestsPerMonth: 0,
          },
        },
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('[Subscription API] Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription',
    });
  }
});

/**
 * GET /api/subscription/usage
 * Get current usage statistics
 */
router.get('/usage', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const prisma = (req as any).prisma as PrismaClient;

    // Count resources
    const [carsCount, staffCount, branchesCount] = await Promise.all([
      prisma.car.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId } }),
      prisma.branch.count({ where: { tenantId } }).catch(() => 0), // Branch may not exist
    ]);

    // Get AI usage this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Note: AIAuditLog table would need to be created
    const aiRequestsThisMonth = 0; // Placeholder

    res.json({
      success: true,
      data: {
        cars: carsCount,
        staff: staffCount,
        branches: branchesCount,
        aiRequestsThisMonth,
      },
    });
  } catch (error) {
    console.error('[Subscription API] Error fetching usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage',
    });
  }
});

/**
 * GET /api/subscription/portals
 * Get available portals for tenant's subscription
 */
router.get('/portals', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const prisma = (req as any).prisma as PrismaClient;

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { tenantId },
    });

    const planType = subscription?.planType || 'starter';

    // Portal availability by plan
    const portalsByPlan: Record<string, string[]> = {
      starter: ['admin'],
      growth: ['admin', 'sales', 'agent'],
      pro: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      enterprise: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
    };

    const aiByPlan: Record<string, string[]> = {
      starter: [],
      growth: ['admin', 'sales'],
      pro: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      enterprise: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
    };

    res.json({
      success: true,
      data: {
        activePortals: portalsByPlan[planType] || portalsByPlan.starter,
        aiEnabledPortals: aiByPlan[planType] || [],
        planType,
      },
    });
  } catch (error) {
    console.error('[Subscription API] Error fetching portals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portals',
    });
  }
});

/**
 * POST /api/subscription/upgrade
 * Request plan upgrade (creates checkout session)
 */
router.post('/upgrade', requireTenant, requireAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { targetPlan } = req.body;

    const validPlans = ['starter', 'growth', 'pro', 'enterprise'];
    if (!validPlans.includes(targetPlan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target plan',
      });
    }

    // In production, this would create a payment checkout session
    // For now, return a mock checkout URL
    const checkoutUrl = `/checkout?plan=${targetPlan}&tenant=${tenantId}`;

    res.json({
      success: true,
      data: {
        checkoutUrl,
        targetPlan,
      },
    });
  } catch (error) {
    console.error('[Subscription API] Error creating upgrade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create upgrade session',
    });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancel subscription (at period end)
 */
router.post('/cancel', requireTenant, requireAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const prisma = (req as any).prisma as PrismaClient;

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { tenantId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    // In production, this would call the payment provider to cancel
    // For now, just mark as pending cancellation
    await prisma.tenantSubscription.update({
      where: { id: subscription.id },
      data: {
        // cancelAtPeriodEnd: true, // Add this field to schema
      },
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period',
    });
  } catch (error) {
    console.error('[Subscription API] Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
    });
  }
});

// =============================================================================
// AI AUDIT ROUTES
// =============================================================================

/**
 * POST /api/subscription/ai/audit
 * Log AI interaction
 */
router.post('/ai/audit', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        error: 'Entries must be an array',
      });
    }

    // In production, this would persist to database
    // For now, just acknowledge receipt
    console.log(`[AI Audit] Received ${entries.length} entries for tenant ${tenantId}`);

    res.json({
      success: true,
      logged: entries.length,
    });
  } catch (error) {
    console.error('[Subscription API] Error logging AI audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log AI audit',
    });
  }
});

/**
 * GET /api/subscription/ai/stats
 * Get AI usage statistics
 */
router.get('/ai/stats', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { period = 'month' } = req.query;

    // In production, this would query the AI audit log table
    // For now, return mock data
    const stats = {
      tenantId,
      period,
      totalRequests: 156,
      totalTokens: 45230,
      byDepartment: {
        admin: { requests: 45, tokens: 12340 },
        sales: { requests: 78, tokens: 22100 },
        agent: { requests: 33, tokens: 10790 },
      },
      averageProcessingTime: 1.2,
      errorRate: 0.02,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Subscription API] Error fetching AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI stats',
    });
  }
});

// =============================================================================
// CHECK ACCESS ROUTES
// =============================================================================

/**
 * GET /api/subscription/check/portal/:portal
 * Check if tenant has access to specific portal
 */
router.get('/check/portal/:portal', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { portal } = req.params;
    const prisma = (req as any).prisma as PrismaClient;

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { tenantId },
    });

    const planType = subscription?.planType || 'starter';

    const portalsByPlan: Record<string, string[]> = {
      starter: ['admin'],
      growth: ['admin', 'sales', 'agent'],
      pro: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      enterprise: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
    };

    const hasAccess = portalsByPlan[planType]?.includes(portal) || false;

    res.json({
      success: true,
      data: {
        portal,
        hasAccess,
        currentPlan: planType,
        requiredPlan: getRequiredPlanForPortal(portal),
      },
    });
  } catch (error) {
    console.error('[Subscription API] Error checking portal access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check portal access',
    });
  }
});

/**
 * GET /api/subscription/check/limit/:resource
 * Check if tenant is within resource limits
 */
router.get('/check/limit/:resource', requireTenant, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { resource } = req.params;
    const prisma = (req as any).prisma as PrismaClient;

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { tenantId },
    });

    const planType = subscription?.planType || 'starter';

    const limits: Record<string, Record<string, number>> = {
      starter: { cars: 50, staff: 3, branches: 1, aiRequests: 0 },
      growth: { cars: 200, staff: 10, branches: 3, aiRequests: 500 },
      pro: { cars: -1, staff: 50, branches: 10, aiRequests: 2000 },
      enterprise: { cars: -1, staff: -1, branches: -1, aiRequests: -1 },
    };

    const planLimits = limits[planType] || limits.starter;
    const maxValue = planLimits[resource] ?? -1;

    // Get current count
    let currentCount = 0;
    switch (resource) {
      case 'cars':
        currentCount = await prisma.car.count({ where: { tenantId } });
        break;
      case 'staff':
        currentCount = await prisma.user.count({ where: { tenantId } });
        break;
      case 'branches':
        currentCount = await prisma.branch.count({ where: { tenantId } }).catch(() => 0);
        break;
    }

    const isWithinLimit = maxValue === -1 || currentCount < maxValue;

    res.json({
      success: true,
      data: {
        resource,
        current: currentCount,
        max: maxValue,
        isWithinLimit,
        remaining: maxValue === -1 ? 'unlimited' : Math.max(0, maxValue - currentCount),
      },
    });
  } catch (error) {
    console.error('[Subscription API] Error checking limit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check limit',
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getRequiredPlanForPortal(portal: string): string {
  const requirements: Record<string, string> = {
    admin: 'starter',
    sales: 'growth',
    agent: 'growth',
    accountant: 'pro',
    hr: 'pro',
    graphic_design: 'pro',
    zr_operations: 'pro',
    custom: 'enterprise',
  };
  return requirements[portal] || 'enterprise';
}

// =============================================================================
// EXPORT
// =============================================================================

export default router;
