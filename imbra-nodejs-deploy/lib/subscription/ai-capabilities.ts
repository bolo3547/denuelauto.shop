// =============================================================================
// DENUEL AUTO - AI CAPABILITIES PER DEPARTMENT
// Department-specific AI assistance configuration
// =============================================================================

import { DepartmentPortal, AICapability } from './pricing-tiers';

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  capability: AICapability;
  contextRequired: string[];
  outputFormat: 'text' | 'json' | 'markdown' | 'list';
}

export interface DepartmentAIConfig {
  department: DepartmentPortal;
  name: string;
  description: string;
  capabilities: AICapability[];
  prompts: AIPromptTemplate[];
  contextSources: string[];
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  promptId: string;
  requiresSelection?: boolean;
}

// =============================================================================
// ADMIN AI CONFIGURATION
// =============================================================================

export const ADMIN_AI_CONFIG: DepartmentAIConfig = {
  department: 'admin',
  name: 'Admin AI Assistant',
  description: 'Strategic insights and business performance analysis',
  capabilities: ['summarize', 'analyze', 'suggest', 'detect', 'generate'],
  contextSources: ['sales_data', 'inventory', 'staff_performance', 'financials', 'leads'],
  quickActions: [
    { id: 'summarize_performance', label: 'Summarize Performance', icon: 'FaChartLine', promptId: 'admin_performance_summary' },
    { id: 'suggest_upgrades', label: 'Suggest Plan Upgrades', icon: 'FaArrowUp', promptId: 'admin_upgrade_suggestions' },
    { id: 'inactive_stock', label: 'Find Inactive Stock', icon: 'FaCar', promptId: 'admin_inactive_stock' },
    { id: 'top_performers', label: 'Top Performers', icon: 'FaTrophy', promptId: 'admin_top_performers' },
  ],
  prompts: [
    {
      id: 'admin_performance_summary',
      name: 'Business Performance Summary',
      description: 'Generate a comprehensive business performance summary',
      capability: 'summarize',
      contextRequired: ['sales_data', 'leads', 'inventory'],
      outputFormat: 'markdown',
      prompt: `Analyze the business performance data and provide a summary:
- Total sales this period vs last period
- Lead conversion rate
- Inventory turnover
- Top performing categories
- Areas needing attention
Keep it concise and actionable.`,
    },
    {
      id: 'admin_upgrade_suggestions',
      name: 'Plan Upgrade Suggestions',
      description: 'Analyze usage and suggest appropriate plan upgrades',
      capability: 'suggest',
      contextRequired: ['usage_metrics', 'current_plan'],
      outputFormat: 'json',
      prompt: `Based on the tenant's current usage patterns:
- Current plan: {current_plan}
- Cars listed: {car_count}/{max_cars}
- Staff accounts: {staff_count}/{max_staff}
- Features used: {features_used}
Suggest if an upgrade is beneficial and explain why.`,
    },
    {
      id: 'admin_inactive_stock',
      name: 'Identify Inactive Stock',
      description: 'Find vehicles with no activity for extended periods',
      capability: 'detect',
      contextRequired: ['inventory', 'views_data', 'inquiry_data'],
      outputFormat: 'list',
      prompt: `Identify vehicles that have been listed for more than 30 days with:
- Less than 10 views
- No inquiries
- No price changes
Suggest actions to improve visibility.`,
    },
    {
      id: 'admin_top_performers',
      name: 'Detect High-Performing Agents',
      description: 'Identify top performing sales agents',
      capability: 'detect',
      contextRequired: ['sales_data', 'agent_data'],
      outputFormat: 'list',
      prompt: `Analyze agent performance and identify:
- Top 3 agents by sales volume
- Top 3 agents by conversion rate
- Agents showing improvement
- Agents needing support`,
    },
    {
      id: 'admin_report_summary',
      name: 'Generate Report Summary',
      description: 'Create executive summary of reports',
      capability: 'generate',
      contextRequired: ['report_data'],
      outputFormat: 'markdown',
      prompt: `Generate an executive summary of the provided report data suitable for stakeholders.`,
    },
  ],
};

// =============================================================================
// SALES AI CONFIGURATION
// =============================================================================

export const SALES_AI_CONFIG: DepartmentAIConfig = {
  department: 'sales',
  name: 'Sales AI Assistant',
  description: 'Lead conversion and customer communication optimization',
  capabilities: ['rewrite', 'suggest', 'detect', 'recommend', 'generate'],
  contextSources: ['leads', 'inventory', 'customer_history', 'inquiries'],
  quickActions: [
    { id: 'rewrite_reply', label: 'Rewrite Reply', icon: 'FaPen', promptId: 'sales_rewrite_reply', requiresSelection: true },
    { id: 'suggest_followup', label: 'Suggest Follow-up', icon: 'FaReply', promptId: 'sales_followup' },
    { id: 'detect_hot_leads', label: 'Find Hot Leads', icon: 'FaFire', promptId: 'sales_hot_leads' },
    { id: 'recommend_cars', label: 'Recommend Cars', icon: 'FaCar', promptId: 'sales_recommend_cars' },
  ],
  prompts: [
    {
      id: 'sales_rewrite_reply',
      name: 'Rewrite Customer Reply',
      description: 'Rewrite response to be more professional and persuasive',
      capability: 'rewrite',
      contextRequired: ['original_text', 'customer_context'],
      outputFormat: 'text',
      prompt: `Rewrite this customer response to be more professional, friendly, and persuasive:
Original: {original_text}
Customer context: {customer_context}
Maintain the core message but improve tone and clarity.`,
    },
    {
      id: 'sales_followup',
      name: 'Suggest Follow-up Message',
      description: 'Generate follow-up message for leads',
      capability: 'suggest',
      contextRequired: ['lead_data', 'last_interaction'],
      outputFormat: 'text',
      prompt: `Generate a follow-up message for this lead:
- Lead name: {lead_name}
- Interested in: {interested_cars}
- Last contact: {last_contact}
- Previous interactions: {interaction_summary}
Make it personal and include a clear call-to-action.`,
    },
    {
      id: 'sales_hot_leads',
      name: 'Detect Hot Leads',
      description: 'Identify leads most likely to convert',
      capability: 'detect',
      contextRequired: ['leads', 'engagement_data'],
      outputFormat: 'list',
      prompt: `Analyze lead data and identify hot leads based on:
- Multiple inquiries
- Recent activity (last 48 hours)
- High-value vehicle interest
- Return visitors
Rank by conversion likelihood.`,
    },
    {
      id: 'sales_recommend_cars',
      name: 'Recommend Cars to Customer',
      description: 'Suggest vehicles based on customer preferences',
      capability: 'recommend',
      contextRequired: ['customer_preferences', 'inventory', 'budget'],
      outputFormat: 'list',
      prompt: `Recommend vehicles for this customer:
- Budget: {budget_range}
- Preferred makes: {preferred_makes}
- Body type: {body_type}
- Key requirements: {requirements}
Match with available inventory and explain why each is suitable.`,
    },
    {
      id: 'sales_quotation_text',
      name: 'Generate Quotation Text',
      description: 'Create professional quotation description',
      capability: 'generate',
      contextRequired: ['vehicle_data', 'customer_data', 'pricing'],
      outputFormat: 'text',
      prompt: `Generate professional quotation text for:
Vehicle: {vehicle_details}
Customer: {customer_name}
Price: {price}
Include highlights, value proposition, and next steps.`,
    },
  ],
};

// =============================================================================
// AGENT AI CONFIGURATION
// =============================================================================

export const AGENT_AI_CONFIG: DepartmentAIConfig = {
  department: 'agent',
  name: 'Agent AI Assistant',
  description: 'Field sales support and lead management',
  capabilities: ['prioritize', 'summarize', 'suggest', 'generate'],
  contextSources: ['assigned_leads', 'visits', 'commissions', 'targets'],
  quickActions: [
    { id: 'prioritize_leads', label: 'Prioritize Leads', icon: 'FaStar', promptId: 'agent_prioritize' },
    { id: 'summarize_visit', label: 'Summarize Visit', icon: 'FaClipboard', promptId: 'agent_visit_summary' },
    { id: 'suggest_response', label: 'Suggest Response', icon: 'FaComment', promptId: 'agent_response' },
    { id: 'auto_notes', label: 'Auto Notes', icon: 'FaMicrophone', promptId: 'agent_auto_notes' },
  ],
  prompts: [
    {
      id: 'agent_prioritize',
      name: 'Lead Prioritization',
      description: 'Rank leads by likelihood to close',
      capability: 'prioritize',
      contextRequired: ['assigned_leads', 'lead_scores'],
      outputFormat: 'list',
      prompt: `Prioritize these leads for today's follow-ups:
{leads_list}
Consider: engagement level, budget fit, timeline, and previous interactions.`,
    },
    {
      id: 'agent_visit_summary',
      name: 'Visit Summary Generation',
      description: 'Generate summary from visit notes',
      capability: 'summarize',
      contextRequired: ['visit_notes', 'customer_data'],
      outputFormat: 'markdown',
      prompt: `Generate a professional visit summary:
Raw notes: {visit_notes}
Customer: {customer_name}
Include: key discussion points, customer interests, objections, next steps.`,
    },
    {
      id: 'agent_response',
      name: 'Customer Response Suggestion',
      description: 'Suggest appropriate responses to customer queries',
      capability: 'suggest',
      contextRequired: ['customer_query', 'vehicle_context'],
      outputFormat: 'text',
      prompt: `Suggest a response to this customer query:
Query: {customer_query}
Context: {vehicle_context}
Keep it helpful, accurate, and encourage further engagement.`,
    },
    {
      id: 'agent_auto_notes',
      name: 'Auto Notes from Input',
      description: 'Convert voice/text input into structured notes',
      capability: 'generate',
      contextRequired: ['raw_input'],
      outputFormat: 'markdown',
      prompt: `Convert this raw input into structured CRM notes:
Input: {raw_input}
Format with: Date, Customer, Discussion Points, Action Items, Follow-up Date.`,
    },
  ],
};

// =============================================================================
// ACCOUNTANT AI CONFIGURATION
// =============================================================================

export const ACCOUNTANT_AI_CONFIG: DepartmentAIConfig = {
  department: 'accountant',
  name: 'Accountant AI Assistant',
  description: 'Financial analysis and payment tracking',
  capabilities: ['summarize', 'detect', 'analyze', 'generate'],
  contextSources: ['payments', 'invoices', 'installments', 'commissions'],
  quickActions: [
    { id: 'summarize_payments', label: 'Summarize Payments', icon: 'FaMoneyBill', promptId: 'acc_payment_summary' },
    { id: 'flag_overdue', label: 'Flag Overdue', icon: 'FaExclamation', promptId: 'acc_overdue' },
    { id: 'explain_report', label: 'Explain Report', icon: 'FaQuestion', promptId: 'acc_explain', requiresSelection: true },
    { id: 'monthly_summary', label: 'Monthly Summary', icon: 'FaCalendar', promptId: 'acc_monthly' },
  ],
  prompts: [
    {
      id: 'acc_payment_summary',
      name: 'Payment Summary',
      description: 'Summarize payment status and cash flow',
      capability: 'summarize',
      contextRequired: ['payments', 'period'],
      outputFormat: 'markdown',
      prompt: `Summarize payment data for {period}:
- Total received
- Pending payments
- Payment methods breakdown
- Comparison to previous period`,
    },
    {
      id: 'acc_overdue',
      name: 'Flag Overdue Installments',
      description: 'Identify overdue payments requiring attention',
      capability: 'detect',
      contextRequired: ['installments'],
      outputFormat: 'list',
      prompt: `Identify overdue installments:
- Days overdue
- Customer contact info
- Total outstanding amount
- Payment history
Prioritize by amount and days overdue.`,
    },
    {
      id: 'acc_explain',
      name: 'Explain Financial Report',
      description: 'Explain report data in simple terms',
      capability: 'analyze',
      contextRequired: ['report_data'],
      outputFormat: 'markdown',
      prompt: `Explain this financial report in simple terms:
{report_data}
Highlight key insights, trends, and any concerns.`,
    },
    {
      id: 'acc_inconsistencies',
      name: 'Detect Inconsistencies',
      description: 'Find discrepancies in financial data',
      capability: 'detect',
      contextRequired: ['transactions', 'expected_totals'],
      outputFormat: 'list',
      prompt: `Analyze transactions for inconsistencies:
- Mismatched amounts
- Duplicate entries
- Missing payments
- Unusual patterns`,
    },
    {
      id: 'acc_monthly',
      name: 'Prepare Monthly Summary',
      description: 'Generate monthly financial summary',
      capability: 'generate',
      contextRequired: ['monthly_data'],
      outputFormat: 'markdown',
      prompt: `Prepare a monthly financial summary including:
- Revenue breakdown
- Expenses overview
- Profit margins
- Key metrics comparison
- Recommendations`,
    },
  ],
};

// =============================================================================
// HR AI CONFIGURATION
// =============================================================================

export const HR_AI_CONFIG: DepartmentAIConfig = {
  department: 'hr',
  name: 'HR AI Assistant',
  description: 'Staff management and performance insights',
  capabilities: ['summarize', 'analyze', 'recommend', 'generate'],
  contextSources: ['staff', 'attendance', 'leave_requests', 'performance'],
  quickActions: [
    { id: 'performance_summary', label: 'Performance Summary', icon: 'FaChartBar', promptId: 'hr_performance' },
    { id: 'analyze_leave', label: 'Analyze Leave', icon: 'FaCalendarAlt', promptId: 'hr_leave' },
    { id: 'role_recommend', label: 'Role Recommendations', icon: 'FaUserCog', promptId: 'hr_roles' },
    { id: 'policy_explain', label: 'Explain Policy', icon: 'FaBook', promptId: 'hr_policy', requiresSelection: true },
  ],
  prompts: [
    {
      id: 'hr_performance',
      name: 'Staff Performance Summary',
      description: 'Summarize team performance metrics',
      capability: 'summarize',
      contextRequired: ['performance_data', 'targets'],
      outputFormat: 'markdown',
      prompt: `Summarize staff performance:
- Overall team performance vs targets
- Individual highlights
- Areas for improvement
- Training recommendations`,
    },
    {
      id: 'hr_leave',
      name: 'Leave Request Analysis',
      description: 'Analyze leave patterns and requests',
      capability: 'analyze',
      contextRequired: ['leave_requests', 'team_coverage'],
      outputFormat: 'markdown',
      prompt: `Analyze leave request:
Request: {request_details}
Team coverage: {coverage_data}
Historical patterns: {patterns}
Provide recommendation with reasoning.`,
    },
    {
      id: 'hr_roles',
      name: 'Role Recommendations',
      description: 'Suggest role assignments based on skills',
      capability: 'recommend',
      contextRequired: ['staff_skills', 'open_positions'],
      outputFormat: 'list',
      prompt: `Recommend role assignments:
Available positions: {positions}
Staff skills matrix: {skills}
Match skills to roles and explain fit.`,
    },
    {
      id: 'hr_policy',
      name: 'Policy Explanation',
      description: 'Explain HR policies in simple terms',
      capability: 'generate',
      contextRequired: ['policy_text'],
      outputFormat: 'text',
      prompt: `Explain this HR policy in simple, employee-friendly terms:
{policy_text}
Include: key points, examples, and common questions.`,
    },
  ],
};

// =============================================================================
// GRAPHIC DESIGN AI CONFIGURATION
// =============================================================================

export const DESIGN_AI_CONFIG: DepartmentAIConfig = {
  department: 'graphic_design',
  name: 'Design AI Assistant',
  description: 'Marketing content and visual asset optimization',
  capabilities: ['generate', 'suggest', 'recommend', 'analyze'],
  contextSources: ['promotions', 'inventory', 'brand_guidelines', 'campaigns'],
  quickActions: [
    { id: 'banner_text', label: 'Generate Banner Text', icon: 'FaImage', promptId: 'design_banner' },
    { id: 'promo_captions', label: 'Promo Captions', icon: 'FaBullhorn', promptId: 'design_captions' },
    { id: 'seo_titles', label: 'Optimize Titles', icon: 'FaSearch', promptId: 'design_seo' },
    { id: 'image_order', label: 'Image Order', icon: 'FaSortAmountDown', promptId: 'design_image_order' },
  ],
  prompts: [
    {
      id: 'design_banner',
      name: 'Auto-generate Banner Text',
      description: 'Create compelling banner headlines',
      capability: 'generate',
      contextRequired: ['promotion_details', 'target_audience'],
      outputFormat: 'list',
      prompt: `Generate 5 banner headline options for:
Promotion: {promotion_details}
Target: {target_audience}
Keep under 10 words, make it catchy and action-oriented.`,
    },
    {
      id: 'design_captions',
      name: 'Suggest Promo Captions',
      description: 'Create social media captions for promotions',
      capability: 'suggest',
      contextRequired: ['vehicle_data', 'platform'],
      outputFormat: 'list',
      prompt: `Suggest social media captions for:
Vehicle: {vehicle_data}
Platform: {platform}
Include: emojis, hashtags, call-to-action. Vary tone.`,
    },
    {
      id: 'design_seo',
      name: 'Optimize Car Titles for SEO',
      description: 'Create SEO-friendly vehicle titles',
      capability: 'generate',
      contextRequired: ['vehicle_data', 'keywords'],
      outputFormat: 'text',
      prompt: `Optimize this vehicle listing title for SEO:
Vehicle: {vehicle_data}
Target keywords: {keywords}
Create a title that's both searchable and attractive.`,
    },
    {
      id: 'design_image_order',
      name: 'Recommend Image Order',
      description: 'Suggest optimal image arrangement',
      capability: 'recommend',
      contextRequired: ['image_descriptions'],
      outputFormat: 'list',
      prompt: `Recommend optimal image order for this vehicle listing:
Images: {image_descriptions}
Prioritize: exterior hero, interior, features, details.`,
    },
    {
      id: 'design_watermark',
      name: 'Generate Watermark Text',
      description: 'Create branded watermark text',
      capability: 'generate',
      contextRequired: ['brand_name', 'style'],
      outputFormat: 'text',
      prompt: `Generate watermark text options for:
Brand: {brand_name}
Style: {style}
Include contact info if space allows.`,
    },
  ],
};

// =============================================================================
// OPERATIONS (ZR) AI CONFIGURATION
// =============================================================================

export const OPERATIONS_AI_CONFIG: DepartmentAIConfig = {
  department: 'zr_operations',
  name: 'Operations AI Assistant',
  description: 'Stock management and logistics optimization',
  capabilities: ['suggest', 'detect', 'generate', 'summarize'],
  contextSources: ['stock_status', 'logistics', 'handovers', 'timeline'],
  quickActions: [
    { id: 'status_updates', label: 'Suggest Status', icon: 'FaSync', promptId: 'ops_status' },
    { id: 'detect_delays', label: 'Detect Delays', icon: 'FaClock', promptId: 'ops_delays' },
    { id: 'handover_checklist', label: 'Handover Checklist', icon: 'FaClipboardCheck', promptId: 'ops_handover' },
    { id: 'ops_summary', label: 'Operations Summary', icon: 'FaChartPie', promptId: 'ops_summary' },
  ],
  prompts: [
    {
      id: 'ops_status',
      name: 'Suggest Stock Status Updates',
      description: 'Recommend status changes based on timeline',
      capability: 'suggest',
      contextRequired: ['stock_item', 'current_status', 'timeline'],
      outputFormat: 'text',
      prompt: `Suggest status update for:
Item: {stock_item}
Current: {current_status}
Timeline: {timeline}
Recommend next status and timing.`,
    },
    {
      id: 'ops_delays',
      name: 'Detect Delays',
      description: 'Identify items behind schedule',
      capability: 'detect',
      contextRequired: ['shipments', 'expected_dates'],
      outputFormat: 'list',
      prompt: `Identify delayed items:
- Days behind schedule
- Reason if known
- Impact assessment
- Recommended action`,
    },
    {
      id: 'ops_handover',
      name: 'Generate Handover Checklist',
      description: 'Create vehicle handover checklist',
      capability: 'generate',
      contextRequired: ['vehicle_data', 'customer_data'],
      outputFormat: 'markdown',
      prompt: `Generate handover checklist for:
Vehicle: {vehicle_data}
Customer: {customer_data}
Include: documents, accessories, walkthrough items, signatures.`,
    },
    {
      id: 'ops_summary',
      name: 'Operations Summary',
      description: 'Summarize daily operations status',
      capability: 'summarize',
      contextRequired: ['daily_data'],
      outputFormat: 'markdown',
      prompt: `Summarize today's operations:
- Arrivals
- Dispatches
- Pending items
- Blockers
- Tomorrow's priorities`,
    },
  ],
};

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const DEPARTMENT_AI_CONFIGS: Record<DepartmentPortal, DepartmentAIConfig> = {
  admin: ADMIN_AI_CONFIG,
  sales: SALES_AI_CONFIG,
  agent: AGENT_AI_CONFIG,
  accountant: ACCOUNTANT_AI_CONFIG,
  hr: HR_AI_CONFIG,
  graphic_design: DESIGN_AI_CONFIG,
  zr_operations: OPERATIONS_AI_CONFIG,
  custom: {
    department: 'custom',
    name: 'Custom AI Assistant',
    description: 'Configurable AI for custom departments',
    capabilities: ['summarize', 'suggest', 'generate'],
    contextSources: [],
    quickActions: [],
    prompts: [],
  },
};

export function getAIConfigForDepartment(department: DepartmentPortal): DepartmentAIConfig {
  return DEPARTMENT_AI_CONFIGS[department];
}

export function getQuickActionsForDepartment(department: DepartmentPortal): QuickAction[] {
  return DEPARTMENT_AI_CONFIGS[department].quickActions;
}

export function getPromptById(department: DepartmentPortal, promptId: string): AIPromptTemplate | undefined {
  return DEPARTMENT_AI_CONFIGS[department].prompts.find(p => p.id === promptId);
}
