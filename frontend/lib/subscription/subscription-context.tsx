'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SubscriptionService,
  TenantSubscription,
  SubscriptionUsage,
  createSubscriptionService,
  getMockSubscription,
  getMockUsage,
  AccessCheckResult,
  PortalAccessInfo,
} from './subscription-service';
import { PlanTier, DepartmentPortal, PRICING_TIERS, TierLimits } from './pricing-tiers';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface SubscriptionContextType {
  // State
  subscription: TenantSubscription | null;
  usage: SubscriptionUsage | null;
  service: SubscriptionService | null;
  loading: boolean;
  error: string | null;

  // Plan info
  currentPlan: PlanTier | null;
  planConfig: typeof PRICING_TIERS[PlanTier] | null;
  isActive: boolean;
  isTrial: boolean;

  // Portal access
  canAccessPortal: (portal: DepartmentPortal) => AccessCheckResult;
  getPortalAccessInfo: (portal: DepartmentPortal) => PortalAccessInfo | null;
  getAllPortalsAccess: () => PortalAccessInfo[];
  availablePortals: DepartmentPortal[];
  lockedPortals: DepartmentPortal[];

  // AI access
  canUseAI: (department: DepartmentPortal) => AccessCheckResult;
  aiEnabledDepartments: DepartmentPortal[];

  // Limits
  canAddCar: () => AccessCheckResult;
  canAddStaff: () => AccessCheckResult;
  canAddBranch: () => AccessCheckResult;
  hasFeature: (feature: keyof TierLimits) => boolean;
  usageSummary: ReturnType<SubscriptionService['getUsageSummary']> | null;

  // Upgrade
  shouldRecommendUpgrade: () => { recommend: boolean; reasons: string[] };
  
  // Actions
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface SubscriptionProviderProps {
  children: ReactNode;
  tenantId: string;
  initialSubscription?: TenantSubscription;
  initialUsage?: SubscriptionUsage;
}

export function SubscriptionProvider({
  children,
  tenantId,
  initialSubscription,
  initialUsage,
}: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<TenantSubscription | null>(initialSubscription || null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(initialUsage || null);
  const [loading, setLoading] = useState(!initialSubscription);
  const [error, setError] = useState<string | null>(null);

  // Create service instance
  const service = subscription && usage
    ? createSubscriptionService(subscription, usage)
    : null;

  // Fetch subscription data
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/tenants/${tenantId}/subscription`);
      // const data = await response.json();
      // setSubscription(data.subscription);
      // setUsage(data.usage);

      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubscription(getMockSubscription('growth'));
      setUsage(getMockUsage());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSubscription) {
      fetchSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  // Context value
  const value: SubscriptionContextType = {
    // State
    subscription,
    usage,
    service,
    loading,
    error,

    // Plan info
    currentPlan: service?.currentPlan || null,
    planConfig: service?.planConfig || null,
    isActive: service?.isActive ?? false,
    isTrial: service?.isTrial ?? false,

    // Portal access
    canAccessPortal: (portal) => 
      service?.canAccessPortal(portal) || { allowed: false, reason: 'Loading...' },
    getPortalAccessInfo: (portal) => 
      service?.getPortalAccessInfo(portal) || null,
    getAllPortalsAccess: () => 
      service?.getAllPortalsAccess() || [],
    availablePortals: service?.getAvailablePortals() || [],
    lockedPortals: service?.getLockedPortals() || [],

    // AI access
    canUseAI: (department) => 
      service?.canUseAI(department) || { allowed: false, reason: 'Loading...' },
    aiEnabledDepartments: service?.getAIEnabledDepartments() || [],

    // Limits
    canAddCar: () => service?.canAddCar() || { allowed: false, reason: 'Loading...' },
    canAddStaff: () => service?.canAddStaff() || { allowed: false, reason: 'Loading...' },
    canAddBranch: () => service?.canAddBranch() || { allowed: false, reason: 'Loading...' },
    hasFeature: (feature) => service?.hasFeature(feature) ?? false,
    usageSummary: service?.getUsageSummary() || null,

    // Upgrade
    shouldRecommendUpgrade: () => 
      service?.shouldRecommendUpgrade() || { recommend: false, reasons: [] },

    // Actions
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function usePortalAccess(portal: DepartmentPortal) {
  const { canAccessPortal, canUseAI, loading } = useSubscription();
  
  return {
    loading,
    ...canAccessPortal(portal),
    ai: canUseAI(portal),
  };
}

export function useFeatureAccess(feature: keyof TierLimits) {
  const { hasFeature, loading, currentPlan } = useSubscription();
  
  return {
    loading,
    allowed: hasFeature(feature),
    currentPlan,
  };
}

export function useLimitCheck(limitType: 'car' | 'staff' | 'branch') {
  const { canAddCar, canAddStaff, canAddBranch, loading, usageSummary } = useSubscription();
  
  const checkFn = {
    car: canAddCar,
    staff: canAddStaff,
    branch: canAddBranch,
  }[limitType];

  const usageKey = {
    car: 'cars',
    staff: 'staff',
    branch: 'branches',
  }[limitType] as 'cars' | 'staff' | 'branches';

  return {
    loading,
    ...checkFn(),
    usage: usageSummary?.[usageKey] || null,
  };
}

export function useAIAccess(department: DepartmentPortal) {
  const { canUseAI, loading } = useSubscription();
  
  return {
    loading,
    ...canUseAI(department),
  };
}
