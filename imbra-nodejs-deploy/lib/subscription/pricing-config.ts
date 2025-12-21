// =============================================================================
// DENUEL AUTO - PRICING TIERS & PORTAL MATRIX CONFIGURATION
// =============================================================================

export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';

export type Portal = 
  | 'admin'
  | 'sales'
  | 'agent'
  | 'accountant'
  | 'hr'
  | 'graphic_design'
  | 'zr_operations';

export type AIFeature =
  | 'admin_ai'
  | 'sales_ai'
  | 'agent_ai'
  | 'accountant_ai'
  | 'hr_ai'
  | 'graphic_design_ai'
  | 'zr_operations_ai';

export interface PlanLimits {
  maxCars: number;
  maxStaff: number;
  maxBranches: number;
  maxStorage: number; // in GB
  apiAccess: boolean;
  customRoles: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  customWorkflows: boolean;
}

export interface PlanFeatures {
  portals: Portal[];
  aiFeatures: AIFeature[];
  reports: ('basic' | 'advanced' | 'custom')[];
  integrations: string[];
  support: 'email' | 'chat' | 'priority' | 'dedicated';
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number; // in ZMW
  yearlyPrice: number; // in ZMW (discounted)
  currency: string;
  limits: PlanLimits;
  features: PlanFeatures;
  highlighted?: boolean;
  badge?: string;
}

// =============================================================================
// PRICING PLANS CONFIGURATION
// =============================================================================

export const PRICING_PLANS: Record<PlanTier, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships just getting started',
    monthlyPrice: 499,
    yearlyPrice: 4990, // ~2 months free
    currency: 'ZMW',
    limits: {
      maxCars: 20,
      maxStaff: 2,
      maxBranches: 1,
      maxStorage: 5,
      apiAccess: false,
      customRoles: false,
      prioritySupport: false,
      whiteLabel: false,
      customWorkflows: false,
    },
    features: {
      portals: ['admin', 'sales', 'agent'],
      aiFeatures: [], // No AI in starter
      reports: ['basic'],
      integrations: ['whatsapp_basic'],
      support: 'email',
    },
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'For growing dealerships ready to scale',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    currency: 'ZMW',
    highlighted: true,
    badge: 'Most Popular',
    limits: {
      maxCars: 100,
      maxStaff: 5,
      maxBranches: 2,
      maxStorage: 20,
      apiAccess: false,
      customRoles: false,
      prioritySupport: false,
      whiteLabel: false,
      customWorkflows: false,
    },
    features: {
      portals: ['admin', 'sales', 'agent', 'accountant'],
      aiFeatures: ['sales_ai', 'agent_ai'],
      reports: ['basic', 'advanced'],
      integrations: ['whatsapp_business', 'sms', 'installment_calculator'],
      support: 'chat',
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Full-featured solution for professional dealerships',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    currency: 'ZMW',
    limits: {
      maxCars: 500,
      maxStaff: -1, // Unlimited
      maxBranches: 5,
      maxStorage: 100,
      apiAccess: true,
      customRoles: false,
      prioritySupport: true,
      whiteLabel: false,
      customWorkflows: false,
    },
    features: {
      portals: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      aiFeatures: ['admin_ai', 'sales_ai', 'agent_ai', 'accountant_ai', 'hr_ai', 'graphic_design_ai', 'zr_operations_ai'],
      reports: ['basic', 'advanced', 'custom'],
      integrations: ['whatsapp_business', 'sms', 'installment_calculator', 'seo_manager', 'customer_accounts', 'compare_cars', 'analytics'],
      support: 'priority',
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large dealership networks',
    monthlyPrice: 3999,
    yearlyPrice: 39990,
    currency: 'ZMW',
    badge: 'Custom Pricing',
    limits: {
      maxCars: -1, // Unlimited
      maxStaff: -1,
      maxBranches: -1,
      maxStorage: -1, // Unlimited
      apiAccess: true,
      customRoles: true,
      prioritySupport: true,
      whiteLabel: true,
      customWorkflows: true,
    },
    features: {
      portals: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      aiFeatures: ['admin_ai', 'sales_ai', 'agent_ai', 'accountant_ai', 'hr_ai', 'graphic_design_ai', 'zr_operations_ai'],
      reports: ['basic', 'advanced', 'custom'],
      integrations: ['whatsapp_business', 'sms', 'installment_calculator', 'seo_manager', 'customer_accounts', 'compare_cars', 'analytics', 'api_full', 'custom_integrations'],
      support: 'dedicated',
    },
  },
};

// =============================================================================
// PORTAL CONFIGURATION
// =============================================================================

export interface PortalConfig {
  id: Portal;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  requiredPlan: PlanTier;
  roles: string[]; // User roles that can access this portal
}

export const PORTAL_CONFIG: Record<Portal, PortalConfig> = {
  admin: {
    id: 'admin',
    name: 'Admin Portal',
    description: 'Manage your dealership settings, users, and overall operations',
    icon: 'Shield',
    route: '/admin',
    color: '#2563eb',
    requiredPlan: 'starter',
    roles: ['dealer_owner', 'dealer_manager'],
  },
  sales: {
    id: 'sales',
    name: 'Sales Portal',
    description: 'Manage leads, inquiries, quotes, and customer relationships',
    icon: 'TrendingUp',
    route: '/sales',
    color: '#16a34a',
    requiredPlan: 'starter',
    roles: ['dealer_owner', 'dealer_manager', 'sales_rep'],
  },
  agent: {
    id: 'agent',
    name: 'Agent Portal',
    description: 'Track referrals, commissions, and agent performance',
    icon: 'Users',
    route: '/agent',
    color: '#9333ea',
    requiredPlan: 'starter',
    roles: ['dealer_owner', 'dealer_manager', 'agent'],
  },
  accountant: {
    id: 'accountant',
    name: 'Accountant Portal',
    description: 'Manage finances, payments, installments, and reports',
    icon: 'Calculator',
    route: '/accountant',
    color: '#0891b2',
    requiredPlan: 'growth',
    roles: ['dealer_owner', 'accountant'],
  },
  hr: {
    id: 'hr',
    name: 'HR Portal',
    description: 'Manage staff, attendance, leave, and performance',
    icon: 'UserCog',
    route: '/hr',
    color: '#dc2626',
    requiredPlan: 'pro',
    roles: ['dealer_owner', 'hr_manager'],
  },
  graphic_design: {
    id: 'graphic_design',
    name: 'Design Portal',
    description: 'Create banners, promotions, and marketing materials',
    icon: 'Palette',
    route: '/design',
    color: '#ea580c',
    requiredPlan: 'pro',
    roles: ['dealer_owner', 'graphic_designer'],
  },
  zr_operations: {
    id: 'zr_operations',
    name: 'Operations Portal',
    description: 'Manage stock status, logistics, and handovers',
    icon: 'Truck',
    route: '/operations',
    color: '#4f46e5',
    requiredPlan: 'pro',
    roles: ['dealer_owner', 'operations_manager', 'zr_staff'],
  },
};

// =============================================================================
// AI FEATURE CONFIGURATION
// =============================================================================

export interface AICapability {
  id: string;
  name: string;
  description: string;
  promptTemplate?: string;
}

export interface AIFeatureConfig {
  id: AIFeature;
  name: string;
  description: string;
  portal: Portal;
  requiredPlan: PlanTier;
  capabilities: AICapability[];
}

export const AI_FEATURE_CONFIG: Record<AIFeature, AIFeatureConfig> = {
  admin_ai: {
    id: 'admin_ai',
    name: 'Admin AI Assistant',
    description: 'AI-powered insights for business management',
    portal: 'admin',
    requiredPlan: 'pro',
    capabilities: [
      { id: 'summarize_performance', name: 'Summarize Performance', description: 'Get a summary of business performance' },
      { id: 'suggest_upgrades', name: 'Suggest Upgrades', description: 'Get recommendations for plan upgrades' },
      { id: 'identify_inactive_stock', name: 'Identify Inactive Stock', description: 'Find vehicles that haven\'t sold' },
      { id: 'detect_top_agents', name: 'Top Performers', description: 'Identify high-performing agents' },
      { id: 'generate_report_summary', name: 'Report Summary', description: 'Generate executive summaries' },
    ],
  },
  sales_ai: {
    id: 'sales_ai',
    name: 'Sales AI Assistant',
    description: 'AI-powered sales and lead management',
    portal: 'sales',
    requiredPlan: 'growth',
    capabilities: [
      { id: 'rewrite_reply', name: 'Rewrite Reply', description: 'Professionally rewrite inquiry responses' },
      { id: 'suggest_followup', name: 'Suggest Follow-up', description: 'Get follow-up message suggestions' },
      { id: 'detect_hot_leads', name: 'Detect Hot Leads', description: 'Identify high-potential leads' },
      { id: 'recommend_cars', name: 'Recommend Cars', description: 'Suggest vehicles based on customer preferences' },
      { id: 'generate_quote_text', name: 'Generate Quote', description: 'Create professional quotation text' },
    ],
  },
  agent_ai: {
    id: 'agent_ai',
    name: 'Agent AI Assistant',
    description: 'AI-powered agent productivity tools',
    portal: 'agent',
    requiredPlan: 'growth',
    capabilities: [
      { id: 'prioritize_leads', name: 'Prioritize Leads', description: 'Rank leads by conversion potential' },
      { id: 'visit_summary', name: 'Visit Summary', description: 'Generate visit summaries from notes' },
      { id: 'suggest_response', name: 'Suggest Response', description: 'Customer response suggestions' },
      { id: 'auto_notes', name: 'Auto Notes', description: 'Convert voice/text to structured notes' },
    ],
  },
  accountant_ai: {
    id: 'accountant_ai',
    name: 'Accountant AI Assistant',
    description: 'AI-powered financial management',
    portal: 'accountant',
    requiredPlan: 'pro',
    capabilities: [
      { id: 'summarize_payments', name: 'Payment Summary', description: 'Summarize payment status and trends' },
      { id: 'flag_overdue', name: 'Flag Overdue', description: 'Identify overdue installments' },
      { id: 'explain_reports', name: 'Explain Reports', description: 'Get plain-English report explanations' },
      { id: 'detect_inconsistencies', name: 'Detect Issues', description: 'Find financial inconsistencies' },
      { id: 'monthly_summary', name: 'Monthly Summary', description: 'Prepare monthly financial summaries' },
    ],
  },
  hr_ai: {
    id: 'hr_ai',
    name: 'HR AI Assistant',
    description: 'AI-powered HR management',
    portal: 'hr',
    requiredPlan: 'pro',
    capabilities: [
      { id: 'staff_performance', name: 'Performance Summary', description: 'Staff performance summaries' },
      { id: 'leave_analysis', name: 'Leave Analysis', description: 'Analyze leave request patterns' },
      { id: 'role_recommendations', name: 'Role Recommendations', description: 'Suggest optimal role assignments' },
      { id: 'policy_explanation', name: 'Policy Explanation', description: 'Explain HR policies clearly' },
    ],
  },
  graphic_design_ai: {
    id: 'graphic_design_ai',
    name: 'Design AI Assistant',
    description: 'AI-powered creative assistance',
    portal: 'graphic_design',
    requiredPlan: 'pro',
    capabilities: [
      { id: 'generate_banner_text', name: 'Banner Text', description: 'Auto-generate promotional banner text' },
      { id: 'promo_captions', name: 'Promo Captions', description: 'Suggest engaging promo captions' },
      { id: 'seo_titles', name: 'SEO Titles', description: 'Optimize car titles for SEO' },
      { id: 'image_order', name: 'Image Order', description: 'Recommend optimal image ordering' },
      { id: 'watermark_text', name: 'Watermark Text', description: 'Generate branded watermark text' },
    ],
  },
  zr_operations_ai: {
    id: 'zr_operations_ai',
    name: 'Operations AI Assistant',
    description: 'AI-powered operations management',
    portal: 'zr_operations',
    requiredPlan: 'pro',
    capabilities: [
      { id: 'stock_status_update', name: 'Status Suggestions', description: 'Suggest stock status updates' },
      { id: 'detect_delays', name: 'Detect Delays', description: 'Identify potential delivery delays' },
      { id: 'handover_checklist', name: 'Handover Checklist', description: 'Generate handover checklists' },
      { id: 'operations_summary', name: 'Ops Summary', description: 'Daily operations summaries' },
    ],
  },
};

// =============================================================================
// USER ROLES CONFIGURATION
// =============================================================================

export interface UserRole {
  id: string;
  name: string;
  description: string;
  defaultPortals: Portal[];
  permissions: string[];
}

export const USER_ROLES: Record<string, UserRole> = {
  dealer_owner: {
    id: 'dealer_owner',
    name: 'Owner',
    description: 'Full access to all features',
    defaultPortals: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
    permissions: ['*'],
  },
  dealer_manager: {
    id: 'dealer_manager',
    name: 'Manager',
    description: 'Manage day-to-day operations',
    defaultPortals: ['admin', 'sales', 'agent'],
    permissions: ['cars.*', 'leads.*', 'quotes.*', 'agents.view', 'reports.view'],
  },
  sales_rep: {
    id: 'sales_rep',
    name: 'Sales Representative',
    description: 'Handle sales and customer inquiries',
    defaultPortals: ['sales'],
    permissions: ['leads.*', 'quotes.*', 'cars.view', 'customers.view'],
  },
  agent: {
    id: 'agent',
    name: 'Agent',
    description: 'Referral agent',
    defaultPortals: ['agent'],
    permissions: ['agent.dashboard', 'agent.leads', 'agent.commissions'],
  },
  accountant: {
    id: 'accountant',
    name: 'Accountant',
    description: 'Manage finances and payments',
    defaultPortals: ['accountant'],
    permissions: ['payments.*', 'reports.financial', 'installments.*'],
  },
  hr_manager: {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Manage staff and HR operations',
    defaultPortals: ['hr'],
    permissions: ['staff.*', 'leave.*', 'attendance.*', 'reports.hr'],
  },
  graphic_designer: {
    id: 'graphic_designer',
    name: 'Graphic Designer',
    description: 'Create marketing materials',
    defaultPortals: ['graphic_design'],
    permissions: ['banners.*', 'promotions.*', 'media.*'],
  },
  operations_manager: {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Manage stock and logistics',
    defaultPortals: ['zr_operations'],
    permissions: ['stock.*', 'logistics.*', 'handovers.*'],
  },
  zr_staff: {
    id: 'zr_staff',
    name: 'ZR Staff',
    description: 'Operations team member',
    defaultPortals: ['zr_operations'],
    permissions: ['stock.view', 'stock.update_status', 'handovers.view'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getPlanByTier(tier: PlanTier): PricingPlan {
  return PRICING_PLANS[tier];
}

export function getPortalConfig(portal: Portal): PortalConfig {
  return PORTAL_CONFIG[portal];
}

export function getAIFeatureConfig(feature: AIFeature): AIFeatureConfig {
  return AI_FEATURE_CONFIG[feature];
}

export function isPortalAvailable(portal: Portal, currentPlan: PlanTier): boolean {
  const plan = PRICING_PLANS[currentPlan];
  return plan.features.portals.includes(portal);
}

export function isAIFeatureAvailable(feature: AIFeature, currentPlan: PlanTier): boolean {
  const plan = PRICING_PLANS[currentPlan];
  return plan.features.aiFeatures.includes(feature);
}

export function getRequiredPlanForPortal(portal: Portal): PlanTier {
  return PORTAL_CONFIG[portal].requiredPlan;
}

export function getRequiredPlanForAI(feature: AIFeature): PlanTier {
  return AI_FEATURE_CONFIG[feature].requiredPlan;
}

export function getAvailablePortals(currentPlan: PlanTier): Portal[] {
  return PRICING_PLANS[currentPlan].features.portals;
}

export function getLockedPortals(currentPlan: PlanTier): Portal[] {
  const available = getAvailablePortals(currentPlan);
  return (Object.keys(PORTAL_CONFIG) as Portal[]).filter(p => !available.includes(p));
}

export function getUpgradePath(currentPlan: PlanTier): PlanTier | null {
  const tiers: PlanTier[] = ['starter', 'growth', 'pro', 'enterprise'];
  const currentIndex = tiers.indexOf(currentPlan);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

export function canUserAccessPortal(userRole: string, portal: Portal, currentPlan: PlanTier): boolean {
  // First check if portal is available in plan
  if (!isPortalAvailable(portal, currentPlan)) {
    return false;
  }
  
  // Then check if user role has access
  const portalConfig = PORTAL_CONFIG[portal];
  return portalConfig.roles.includes(userRole);
}

export function getPlanComparison(): { feature: string; starter: string | boolean; growth: string | boolean; pro: string | boolean; enterprise: string | boolean }[] {
  return [
    { feature: 'Maximum Cars', starter: '20', growth: '100', pro: '500', enterprise: 'Unlimited' },
    { feature: 'Staff Accounts', starter: '2', growth: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Branches', starter: '1', growth: '2', pro: '5', enterprise: 'Unlimited' },
    { feature: 'Storage', starter: '5 GB', growth: '20 GB', pro: '100 GB', enterprise: 'Unlimited' },
    { feature: 'Admin Portal', starter: true, growth: true, pro: true, enterprise: true },
    { feature: 'Sales Portal', starter: true, growth: true, pro: true, enterprise: true },
    { feature: 'Agent Portal', starter: true, growth: true, pro: true, enterprise: true },
    { feature: 'Accountant Portal', starter: false, growth: true, pro: true, enterprise: true },
    { feature: 'HR Portal', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'Design Portal', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'Operations Portal', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'Sales AI', starter: false, growth: true, pro: true, enterprise: true },
    { feature: 'Agent AI', starter: false, growth: true, pro: true, enterprise: true },
    { feature: 'All Department AI', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'WhatsApp Integration', starter: 'Basic', growth: 'Business', pro: 'Business', enterprise: 'Business' },
    { feature: 'API Access', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'Custom Roles', starter: false, growth: false, pro: false, enterprise: true },
    { feature: 'White Label', starter: false, growth: false, pro: false, enterprise: true },
    { feature: 'Priority Support', starter: false, growth: false, pro: true, enterprise: true },
    { feature: 'Dedicated Support', starter: false, growth: false, pro: false, enterprise: true },
  ];
}
