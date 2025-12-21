// =============================================================================
// DENUEL AUTO - SUBSCRIPTION SERVICE
// Core service for managing tenant subscriptions and access control
// =============================================================================

import {
  PlanTier,
  DepartmentPortal,
  PRICING_TIERS,
  PORTAL_CONFIG,
  isPortalAvailable,
  isAIAvailableForDepartment,
  getAvailablePortals,
  TierLimits,
} from './pricing-tiers';

// =============================================================================
// TYPES
// =============================================================================

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planType: PlanTier;
  status: 'active' | 'suspended' | 'cancelled' | 'trial' | 'past_due';
  monthlyPrice: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  trialEndsAt?: string;
  features: Record<string, boolean | string | number>;
  portalOverrides?: DepartmentPortal[]; // Super admin can override
  aiOverrides?: DepartmentPortal[]; // Super admin can override
  customLimits?: Partial<TierLimits>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  carsListed: number;
  staffAccounts: number;
  branches: number;
  storageUsedGB: number;
  aiRequestsThisMonth: number;
  lastUpdated: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: PlanTier;
  featureId?: string;
}

export interface PortalAccessInfo {
  portal: DepartmentPortal;
  available: boolean;
  aiEnabled: boolean;
  requiredTier: PlanTier;
  upgradeMessage?: string;
}

// =============================================================================
// SUBSCRIPTION SERVICE CLASS
// =============================================================================

export class SubscriptionService {
  private subscription: TenantSubscription;
  private usage: SubscriptionUsage;

  constructor(subscription: TenantSubscription, usage: SubscriptionUsage) {
    this.subscription = subscription;
    this.usage = usage;
  }

  // ---------------------------------------------------------------------------
  // Plan Information
  // ---------------------------------------------------------------------------

  get currentPlan(): PlanTier {
    return this.subscription.planType;
  }

  get planConfig() {
    return PRICING_TIERS[this.currentPlan];
  }

  get isActive(): boolean {
    return ['active', 'trial'].includes(this.subscription.status);
  }

  get isTrial(): boolean {
    return this.subscription.status === 'trial';
  }

  get isPastDue(): boolean {
    return this.subscription.status === 'past_due';
  }

  // ---------------------------------------------------------------------------
  // Portal Access
  // ---------------------------------------------------------------------------

  canAccessPortal(portal: DepartmentPortal): AccessCheckResult {
    // Check if subscription is active
    if (!this.isActive && !this.isPastDue) {
      return {
        allowed: false,
        reason: 'Subscription is not active',
      };
    }

    // Check super admin overrides first
    if (this.subscription.portalOverrides?.includes(portal)) {
      return { allowed: true };
    }

    // Check plan-based access
    if (isPortalAvailable(portal, this.currentPlan)) {
      return { allowed: true };
    }

    // Portal not available - find required tier
    const requiredTier = PORTAL_CONFIG[portal].requiredTier;
    return {
      allowed: false,
      reason: `Upgrade to ${PRICING_TIERS[requiredTier].name} to access ${PORTAL_CONFIG[portal].name}`,
      upgradeRequired: requiredTier,
      featureId: portal,
    };
  }

  getPortalAccessInfo(portal: DepartmentPortal): PortalAccessInfo {
    const accessResult = this.canAccessPortal(portal);
    const aiResult = this.canUseAI(portal);

    return {
      portal,
      available: accessResult.allowed,
      aiEnabled: aiResult.allowed,
      requiredTier: PORTAL_CONFIG[portal].requiredTier,
      upgradeMessage: accessResult.reason,
    };
  }

  getAllPortalsAccess(): PortalAccessInfo[] {
    const allPortals = Object.keys(PORTAL_CONFIG) as DepartmentPortal[];
    return allPortals.map(portal => this.getPortalAccessInfo(portal));
  }

  getAvailablePortals(): DepartmentPortal[] {
    const planPortals = getAvailablePortals(this.currentPlan);
    const overrides = this.subscription.portalOverrides || [];
    return [...new Set([...planPortals, ...overrides])];
  }

  getLockedPortals(): DepartmentPortal[] {
    const available = this.getAvailablePortals();
    const allPortals = Object.keys(PORTAL_CONFIG) as DepartmentPortal[];
    return allPortals.filter(p => !available.includes(p));
  }

  // ---------------------------------------------------------------------------
  // AI Access
  // ---------------------------------------------------------------------------

  canUseAI(department: DepartmentPortal): AccessCheckResult {
    if (!this.isActive) {
      return {
        allowed: false,
        reason: 'Subscription is not active',
      };
    }

    // Check super admin overrides
    if (this.subscription.aiOverrides?.includes(department)) {
      return { allowed: true };
    }

    // Check plan-based AI access
    if (isAIAvailableForDepartment(department, this.currentPlan)) {
      return { allowed: true };
    }

    // Find which tier enables AI for this department
    const tiers: PlanTier[] = ['growth', 'pro', 'enterprise'];
    const requiredTier = tiers.find(tier => 
      isAIAvailableForDepartment(department, tier)
    );

    return {
      allowed: false,
      reason: requiredTier 
        ? `Upgrade to ${PRICING_TIERS[requiredTier].name} to unlock AI for ${PORTAL_CONFIG[department].name}`
        : 'AI is not available for this department',
      upgradeRequired: requiredTier,
      featureId: `ai_${department}`,
    };
  }

  getAIEnabledDepartments(): DepartmentPortal[] {
    const planAI = this.planConfig.aiDepartments;
    const overrides = this.subscription.aiOverrides || [];
    return [...new Set([...planAI, ...overrides])];
  }

  // ---------------------------------------------------------------------------
  // Limit Checks
  // ---------------------------------------------------------------------------

  canAddCar(): AccessCheckResult {
    const limit = this.getEffectiveLimit('maxCars');
    if (limit === -1 || this.usage.carsListed < limit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} cars. Upgrade to add more.`,
      upgradeRequired: this.getNextTierWithHigherLimit('maxCars'),
      featureId: 'maxCars',
    };
  }

  canAddStaff(): AccessCheckResult {
    const limit = this.getEffectiveLimit('maxStaff');
    if (limit === -1 || this.usage.staffAccounts < limit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} staff accounts. Upgrade to add more.`,
      upgradeRequired: this.getNextTierWithHigherLimit('maxStaff'),
      featureId: 'maxStaff',
    };
  }

  canAddBranch(): AccessCheckResult {
    const limit = this.getEffectiveLimit('maxBranches');
    if (limit === -1 || this.usage.branches < limit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} branches. Upgrade to add more.`,
      upgradeRequired: this.getNextTierWithHigherLimit('maxBranches'),
      featureId: 'maxBranches',
    };
  }

  hasFeature(feature: keyof TierLimits): boolean {
    // Check custom limits override first
    if (this.subscription.customLimits?.[feature] !== undefined) {
      const value = this.subscription.customLimits[feature];
      return typeof value === 'boolean' ? value : true;
    }
    
    const featureValue = this.planConfig.limits[feature];
    return typeof featureValue === 'boolean' ? featureValue : true;
  }

  getEffectiveLimit(limitKey: keyof TierLimits): number {
    // Check custom limits override first
    if (this.subscription.customLimits?.[limitKey] !== undefined) {
      return this.subscription.customLimits[limitKey] as number;
    }
    return this.planConfig.limits[limitKey] as number;
  }

  private getNextTierWithHigherLimit(limitKey: keyof TierLimits): PlanTier | undefined {
    const currentLimit = this.getEffectiveLimit(limitKey);
    const tierOrder: PlanTier[] = ['starter', 'growth', 'pro', 'enterprise'];
    const currentIndex = tierOrder.indexOf(this.currentPlan);

    for (let i = currentIndex + 1; i < tierOrder.length; i++) {
      const tier = tierOrder[i];
      const tierLimit = PRICING_TIERS[tier].limits[limitKey] as number;
      if (tierLimit === -1 || tierLimit > currentLimit) {
        return tier;
      }
    }
    return undefined;
  }

  // ---------------------------------------------------------------------------
  // Usage Stats
  // ---------------------------------------------------------------------------

  getUsagePercentages(): Record<string, number> {
    const limits = this.planConfig.limits;
    
    return {
      cars: limits.maxCars === -1 ? 0 : (this.usage.carsListed / limits.maxCars) * 100,
      staff: limits.maxStaff === -1 ? 0 : (this.usage.staffAccounts / limits.maxStaff) * 100,
      branches: limits.maxBranches === -1 ? 0 : (this.usage.branches / limits.maxBranches) * 100,
      storage: limits.maxStorageGB === -1 ? 0 : (this.usage.storageUsedGB / limits.maxStorageGB) * 100,
    };
  }

  getUsageSummary() {
    const limits = this.planConfig.limits;
    
    return {
      cars: {
        used: this.usage.carsListed,
        limit: limits.maxCars,
        percentage: limits.maxCars === -1 ? 0 : (this.usage.carsListed / limits.maxCars) * 100,
        unlimited: limits.maxCars === -1,
      },
      staff: {
        used: this.usage.staffAccounts,
        limit: limits.maxStaff,
        percentage: limits.maxStaff === -1 ? 0 : (this.usage.staffAccounts / limits.maxStaff) * 100,
        unlimited: limits.maxStaff === -1,
      },
      branches: {
        used: this.usage.branches,
        limit: limits.maxBranches,
        percentage: limits.maxBranches === -1 ? 0 : (this.usage.branches / limits.maxBranches) * 100,
        unlimited: limits.maxBranches === -1,
      },
      storage: {
        used: this.usage.storageUsedGB,
        limit: limits.maxStorageGB,
        percentage: limits.maxStorageGB === -1 ? 0 : (this.usage.storageUsedGB / limits.maxStorageGB) * 100,
        unlimited: limits.maxStorageGB === -1,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Upgrade Recommendations
  // ---------------------------------------------------------------------------

  shouldRecommendUpgrade(): { recommend: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const percentages = this.getUsagePercentages();

    // Check if approaching limits
    if (percentages.cars > 80) {
      reasons.push(`You're using ${Math.round(percentages.cars)}% of your car listing limit`);
    }
    if (percentages.staff > 80) {
      reasons.push(`You're using ${Math.round(percentages.staff)}% of your staff account limit`);
    }

    // Check if missing valuable features
    if (!this.hasFeature('whatsappIntegration') && this.currentPlan === 'starter') {
      reasons.push('Unlock WhatsApp integration for better customer engagement');
    }
    if (!this.hasFeature('advancedAnalytics') && ['starter', 'growth'].includes(this.currentPlan)) {
      reasons.push('Get advanced analytics to make data-driven decisions');
    }
    if (!this.planConfig.aiEnabled) {
      reasons.push('Unlock AI assistance to boost productivity');
    }

    return {
      recommend: reasons.length > 0,
      reasons,
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createSubscriptionService(
  subscription: TenantSubscription,
  usage: SubscriptionUsage
): SubscriptionService {
  return new SubscriptionService(subscription, usage);
}

// =============================================================================
// MOCK DATA FOR DEVELOPMENT
// =============================================================================

export function getMockSubscription(tier: PlanTier = 'growth'): TenantSubscription {
  const limits = PRICING_TIERS[tier].limits;
  return {
    id: 'sub-mock-123',
    tenantId: 'tenant-mock-456',
    planType: tier,
    status: 'active',
    monthlyPrice: PRICING_TIERS[tier].price,
    currency: 'ZMW',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: {
      maxCars: limits.maxCars,
      maxStaff: limits.maxStaff,
      maxBranches: limits.maxBranches,
      storageGB: limits.maxStorageGB,
      aiRequestsPerMonth: limits.aiRequestsPerMonth,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockUsage(): SubscriptionUsage {
  return {
    carsListed: 45,
    staffAccounts: 3,
    branches: 1,
    storageUsedGB: 8.5,
    aiRequestsThisMonth: 127,
    lastUpdated: new Date().toISOString(),
  };
}
