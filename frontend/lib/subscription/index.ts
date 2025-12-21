// =============================================================================
// DENUEL AUTO - SUBSCRIPTION MODULE EXPORTS
// =============================================================================

// Pricing & Configuration
export {
  PRICING_TIERS,
  PORTAL_CONFIG,
  type PlanTier,
  type DepartmentPortal,
  type AICapability,
  type PricingTier,
  type TierLimits,
  type PortalConfig,
  getTierByPrice,
  getNextTier,
  isPortalAvailable,
  isAIAvailableForDepartment,
  getRequiredTierForPortal,
  getAvailablePortals,
  getLockedPortals,
  checkLimit,
  getUpgradeReason,
} from './pricing-tiers';

// AI Capabilities
export {
  DEPARTMENT_AI_CONFIGS,
  ADMIN_AI_CONFIG,
  SALES_AI_CONFIG,
  AGENT_AI_CONFIG,
  ACCOUNTANT_AI_CONFIG,
  HR_AI_CONFIG,
  DESIGN_AI_CONFIG,
  OPERATIONS_AI_CONFIG,
  type DepartmentAIConfig,
  type AIPromptTemplate,
  type QuickAction,
  getAIConfigForDepartment,
  getQuickActionsForDepartment,
  getPromptById,
} from './ai-capabilities';

// Subscription Service
export {
  SubscriptionService,
  createSubscriptionService,
  getMockSubscription,
  getMockUsage,
  type TenantSubscription,
  type SubscriptionUsage,
  type AccessCheckResult,
  type PortalAccessInfo,
} from './subscription-service';

// React Context & Hooks
export {
  SubscriptionProvider,
  useSubscription,
  usePortalAccess,
  useFeatureAccess,
  useLimitCheck,
  useAIAccess,
} from './subscription-context';

// Audit Logger
export {
  AIAuditLogger,
  getAuditLogger,
  useAuditLogger,
  type AIAuditEntry,
  type AIUsageStats,
  type AuditLoggerConfig,
} from './audit-logger';
