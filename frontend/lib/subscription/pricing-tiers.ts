// =============================================================================
// DENUEL AUTO - PRICING TIERS & PORTAL MATRIX
// Enterprise subscription system with department-based access control
// =============================================================================

export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';

export type DepartmentPortal = 
  | 'admin'
  | 'sales'
  | 'agent'
  | 'accountant'
  | 'hr'
  | 'graphic_design'
  | 'zr_operations'
  | 'custom';

export type AICapability =
  | 'rewrite'
  | 'summarize'
  | 'suggest'
  | 'analyze'
  | 'generate'
  | 'prioritize'
  | 'detect'
  | 'recommend';

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

export interface PricingTier {
  id: PlanTier;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  limits: TierLimits;
  portals: DepartmentPortal[];
  aiEnabled: boolean;
  aiDepartments: DepartmentPortal[];
  badge?: string;
  isPopular?: boolean;
}

export interface TierLimits {
  maxCars: number;
  maxStaff: number;
  maxBranches: number;
  maxStorageGB: number;
  aiRequestsPerMonth: number;
  apiAccess: boolean;
  whatsappIntegration: boolean;
  seoManager: boolean;
  customerAccounts: boolean;
  compareFeature: boolean;
  advancedAnalytics: boolean;
  customRoles: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
}

export const PRICING_TIERS: Record<PlanTier, PricingTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 499,
    currency: 'ZMW',
    billingCycle: 'monthly',
    description: 'Perfect for small dealerships just getting started',
    features: [
      'Up to 20 car listings',
      '2 staff accounts',
      'Basic inventory management',
      'Lead capture forms',
      'Email notifications',
      'Basic reports',
      'Mobile responsive site',
    ],
    limits: {
      maxCars: 20,
      maxStaff: 2,
      maxBranches: 1,
      maxStorageGB: 5,
      aiRequestsPerMonth: 0,
      apiAccess: false,
      whatsappIntegration: false,
      seoManager: false,
      customerAccounts: false,
      compareFeature: false,
      advancedAnalytics: false,
      customRoles: false,
      prioritySupport: false,
      customDomain: false,
    },
    portals: ['admin', 'sales', 'agent'],
    aiEnabled: false,
    aiDepartments: [],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 999,
    currency: 'ZMW',
    billingCycle: 'monthly',
    description: 'For growing dealerships ready to scale',
    badge: 'Popular',
    isPopular: true,
    features: [
      'Up to 100 car listings',
      '5 staff accounts',
      'Accounting portal',
      'AI for Sales & Agent',
      'Installment calculator',
      'WhatsApp integration',
      'Lead scoring',
      'Payment tracking',
      'Export documentation',
    ],
    limits: {
      maxCars: 100,
      maxStaff: 5,
      maxBranches: 2,
      maxStorageGB: 20,
      aiRequestsPerMonth: 500,
      apiAccess: false,
      whatsappIntegration: true,
      seoManager: false,
      customerAccounts: false,
      compareFeature: true,
      advancedAnalytics: false,
      customRoles: false,
      prioritySupport: false,
      customDomain: false,
    },
    portals: ['admin', 'sales', 'agent', 'accountant'],
    aiEnabled: true,
    aiDepartments: ['sales', 'agent'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1999,
    currency: 'ZMW',
    billingCycle: 'monthly',
    description: 'Complete solution for professional dealerships',
    features: [
      'Up to 500 car listings',
      'Unlimited staff accounts',
      'All department portals',
      'AI for ALL departments',
      'SEO Manager',
      'Customer accounts',
      'Compare cars feature',
      'Advanced analytics',
      'HR management',
      'Graphic design tools',
      'Operations tracking',
      'Multi-branch support',
    ],
    limits: {
      maxCars: 500,
      maxStaff: -1, // Unlimited
      maxBranches: 5,
      maxStorageGB: 100,
      aiRequestsPerMonth: 2000,
      apiAccess: false,
      whatsappIntegration: true,
      seoManager: true,
      customerAccounts: true,
      compareFeature: true,
      advancedAnalytics: true,
      customRoles: false,
      prioritySupport: false,
      customDomain: true,
    },
    portals: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
    aiEnabled: true,
    aiDepartments: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 3999,
    currency: 'ZMW',
    billingCycle: 'monthly',
    description: 'Custom solutions for large dealership networks',
    badge: 'Custom',
    features: [
      'Unlimited car listings',
      'Unlimited staff accounts',
      'All portals + custom roles',
      'Custom AI workflows',
      'Full API access',
      'Priority support',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'Training & onboarding',
      'Custom reporting',
    ],
    limits: {
      maxCars: -1, // Unlimited
      maxStaff: -1, // Unlimited
      maxBranches: -1, // Unlimited
      maxStorageGB: -1, // Unlimited
      aiRequestsPerMonth: -1, // Unlimited
      apiAccess: true,
      whatsappIntegration: true,
      seoManager: true,
      customerAccounts: true,
      compareFeature: true,
      advancedAnalytics: true,
      customRoles: true,
      prioritySupport: true,
      customDomain: true,
    },
    portals: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
    aiEnabled: true,
    aiDepartments: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
  },
};

// =============================================================================
// PORTAL CONFIGURATION
// =============================================================================

export interface PortalConfig {
  id: DepartmentPortal;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  requiredTier: PlanTier;
  permissions: string[];
}

export const PORTAL_CONFIG: Record<DepartmentPortal, PortalConfig> = {
  admin: {
    id: 'admin',
    name: 'Admin Portal',
    description: 'Business overview, settings, and management',
    icon: 'FaCrown',
    route: '/admin',
    color: '#7c3aed',
    requiredTier: 'starter',
    permissions: ['manage_settings', 'view_reports', 'manage_users', 'manage_inventory', 'manage_billing'],
  },
  sales: {
    id: 'sales',
    name: 'Sales Portal',
    description: 'Lead management, quotes, and customer relations',
    icon: 'FaHandshake',
    route: '/sales',
    color: '#2563eb',
    requiredTier: 'starter',
    permissions: ['manage_leads', 'create_quotes', 'view_inventory', 'contact_customers'],
  },
  agent: {
    id: 'agent',
    name: 'Agent Portal',
    description: 'Field sales, referrals, and commissions',
    icon: 'FaUserTie',
    route: '/agent',
    color: '#059669',
    requiredTier: 'starter',
    permissions: ['view_leads', 'submit_referrals', 'view_commissions', 'track_sales'],
  },
  accountant: {
    id: 'accountant',
    name: 'Accountant Portal',
    description: 'Payments, invoices, and financial reports',
    icon: 'FaCalculator',
    route: '/accountant',
    color: '#d97706',
    requiredTier: 'growth',
    permissions: ['manage_payments', 'view_invoices', 'generate_reports', 'track_installments'],
  },
  hr: {
    id: 'hr',
    name: 'HR Portal',
    description: 'Staff management, attendance, and performance',
    icon: 'FaUsers',
    route: '/hr',
    color: '#dc2626',
    requiredTier: 'pro',
    permissions: ['manage_staff', 'track_attendance', 'manage_leave', 'performance_reviews'],
  },
  graphic_design: {
    id: 'graphic_design',
    name: 'Design Portal',
    description: 'Banners, promotions, and marketing assets',
    icon: 'FaPaintBrush',
    route: '/design',
    color: '#ec4899',
    requiredTier: 'pro',
    permissions: ['create_banners', 'manage_promotions', 'edit_images', 'manage_watermarks'],
  },
  zr_operations: {
    id: 'zr_operations',
    name: 'Operations Portal',
    description: 'Stock tracking, logistics, and handovers',
    icon: 'FaTruck',
    route: '/operations',
    color: '#0891b2',
    requiredTier: 'pro',
    permissions: ['track_stock', 'manage_logistics', 'process_handovers', 'update_status'],
  },
  custom: {
    id: 'custom',
    name: 'Custom Portal',
    description: 'Custom department with configurable permissions',
    icon: 'FaCog',
    route: '/custom',
    color: '#6b7280',
    requiredTier: 'enterprise',
    permissions: ['configurable'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTierByPrice(price: number): PlanTier | null {
  for (const [key, tier] of Object.entries(PRICING_TIERS)) {
    if (tier.price === price) return key as PlanTier;
  }
  return null;
}

export function getNextTier(currentTier: PlanTier): PlanTier | null {
  const tierOrder: PlanTier[] = ['starter', 'growth', 'pro', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) return null;
  return tierOrder[currentIndex + 1];
}

export function isPortalAvailable(portal: DepartmentPortal, tier: PlanTier): boolean {
  const tierConfig = PRICING_TIERS[tier];
  return tierConfig.portals.includes(portal);
}

export function isAIAvailableForDepartment(department: DepartmentPortal, tier: PlanTier): boolean {
  const tierConfig = PRICING_TIERS[tier];
  return tierConfig.aiEnabled && tierConfig.aiDepartments.includes(department);
}

export function getRequiredTierForPortal(portal: DepartmentPortal): PlanTier {
  return PORTAL_CONFIG[portal].requiredTier;
}

export function getAvailablePortals(tier: PlanTier): DepartmentPortal[] {
  return PRICING_TIERS[tier].portals;
}

export function getLockedPortals(tier: PlanTier): DepartmentPortal[] {
  const allPortals = Object.keys(PORTAL_CONFIG) as DepartmentPortal[];
  const availablePortals = getAvailablePortals(tier);
  return allPortals.filter(p => !availablePortals.includes(p));
}

export function checkLimit(tier: PlanTier, limitKey: keyof TierLimits, currentValue: number): boolean {
  const limit = PRICING_TIERS[tier].limits[limitKey];
  if (typeof limit === 'boolean') return limit;
  if (limit === -1) return true; // Unlimited
  return currentValue < limit;
}

export function getUpgradeReason(tier: PlanTier, portal: DepartmentPortal): string | null {
  if (isPortalAvailable(portal, tier)) return null;
  const requiredTier = getRequiredTierForPortal(portal);
  return `Upgrade to ${PRICING_TIERS[requiredTier].name} to unlock ${PORTAL_CONFIG[portal].name}`;
}

// Get portal configuration
export function getPortalConfig(portal: DepartmentPortal): PortalConfig {
  return PORTAL_CONFIG[portal];
}

// Get numeric level of tier for comparison
export function getTierLevel(tier: PlanTier): number {
  const levels: Record<PlanTier, number> = {
    starter: 0,
    growth: 1,
    pro: 2,
    enterprise: 3,
  };
  return levels[tier];
}

// Format tier price with period
export function formatTierPrice(tier: PlanTier): string {
  const config = PRICING_TIERS[tier];
  return `${config.currency} ${config.price.toLocaleString()}`;
}

// Get billing period text
export function getTierPeriod(tier: PlanTier): string {
  return PRICING_TIERS[tier].billingCycle === 'monthly' ? '/month' : '/year';
}
