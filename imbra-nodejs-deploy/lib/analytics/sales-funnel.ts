/**
 * Sales Funnel Analytics Service
 * Track and analyze lead conversion from inquiry to sale
 */

export type FunnelStage = 
  | 'visitor'
  | 'lead'
  | 'inquiry'
  | 'viewing'
  | 'negotiation'
  | 'deposit'
  | 'sale'
  | 'delivery';

export type LeadSource = 
  | 'website'
  | 'google_ads'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'phone'
  | 'walk_in'
  | 'referral'
  | 'marketplace'
  | 'agent'
  | 'other';

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'unqualified'
  | 'hot'
  | 'warm'
  | 'cold'
  | 'won'
  | 'lost';

export interface Lead {
  id: string;
  tenantId: string;
  
  // Contact info
  name: string;
  email?: string;
  phone: string;
  
  // Source tracking
  source: LeadSource;
  sourceDetails?: string;
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  referralCode?: string;
  
  // Current state
  status: LeadStatus;
  currentStage: FunnelStage;
  score: number; // 0-100
  
  // Interest
  interestedInVehicleIds: string[];
  budget?: { min: number; max: number; currency: string };
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp' | 'sms';
  
  // Assignment
  assignedAgentId?: string;
  
  // Timing
  createdAt: Date;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  convertedAt?: Date;
  
  // Notes
  notes?: string[];
  tags?: string[];
}

export interface FunnelEvent {
  id: string;
  leadId: string;
  tenantId: string;
  
  // Event details
  fromStage: FunnelStage;
  toStage: FunnelStage;
  eventType: 'stage_change' | 'status_change' | 'activity' | 'note';
  
  // Context
  vehicleId?: string;
  agentId?: string;
  description?: string;
  
  // Timing
  createdAt: Date;
  duration?: number; // Time spent in previous stage (minutes)
}

export interface FunnelMetrics {
  period: { start: Date; end: Date };
  tenantId: string;
  
  // Volume metrics
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  
  // Conversion rates
  overallConversionRate: number;
  stageConversionRates: Record<FunnelStage, number>;
  
  // Source performance
  leadsBySource: Record<LeadSource, number>;
  conversionBySource: Record<LeadSource, number>;
  
  // Timing metrics
  averageTimeToConversion: number; // days
  averageTimePerStage: Record<FunnelStage, number>; // days
  
  // Value metrics
  totalRevenue: number;
  averageDealValue: number;
  
  // Agent performance
  leadsByAgent: Record<string, number>;
  conversionByAgent: Record<string, number>;
}

export interface FunnelStageData {
  stage: FunnelStage;
  count: number;
  value: number;
  conversionRate: number;
  averageTime: number; // days
  dropoffRate: number;
}

/**
 * Funnel stage configuration
 */
export const FUNNEL_STAGES: Record<FunnelStage, {
  label: string;
  description: string;
  order: number;
  color: string;
}> = {
  visitor: {
    label: 'Website Visitor',
    description: 'User visited the website',
    order: 1,
    color: '#94a3b8',
  },
  lead: {
    label: 'Lead Captured',
    description: 'Contact information collected',
    order: 2,
    color: '#60a5fa',
  },
  inquiry: {
    label: 'Inquiry Made',
    description: 'Customer inquired about specific vehicle',
    order: 3,
    color: '#818cf8',
  },
  viewing: {
    label: 'Viewing Scheduled',
    description: 'Test drive or viewing scheduled',
    order: 4,
    color: '#a78bfa',
  },
  negotiation: {
    label: 'Negotiation',
    description: 'Price negotiation in progress',
    order: 5,
    color: '#f59e0b',
  },
  deposit: {
    label: 'Deposit Paid',
    description: 'Customer paid deposit',
    order: 6,
    color: '#10b981',
  },
  sale: {
    label: 'Sale Complete',
    description: 'Full payment received',
    order: 7,
    color: '#22c55e',
  },
  delivery: {
    label: 'Delivered',
    description: 'Vehicle delivered to customer',
    order: 8,
    color: '#06b6d4',
  },
};

/**
 * Lead scoring criteria
 */
export interface LeadScoringCriteria {
  // Source scores
  sourceScores: Record<LeadSource, number>;
  
  // Engagement scores
  emailProvidedScore: number;
  phoneProvidedScore: number;
  budgetProvidedScore: number;
  specificVehicleInterestScore: number;
  
  // Activity scores
  inquiryMadeScore: number;
  viewingScheduledScore: number;
  returnVisitScore: number;
  
  // Timing penalties
  daysInactiveMultiplier: number;
  maxDaysBeforePenalty: number;
}

export const DEFAULT_SCORING_CRITERIA: LeadScoringCriteria = {
  sourceScores: {
    website: 10,
    google_ads: 15,
    facebook: 12,
    instagram: 12,
    whatsapp: 20,
    phone: 25,
    walk_in: 30,
    referral: 25,
    marketplace: 15,
    agent: 20,
    other: 5,
  },
  emailProvidedScore: 10,
  phoneProvidedScore: 15,
  budgetProvidedScore: 15,
  specificVehicleInterestScore: 20,
  inquiryMadeScore: 20,
  viewingScheduledScore: 30,
  returnVisitScore: 10,
  daysInactiveMultiplier: 0.95, // 5% reduction per day
  maxDaysBeforePenalty: 3,
};

/**
 * Calculate lead score
 */
export function calculateLeadScore(
  lead: Lead,
  criteria: LeadScoringCriteria = DEFAULT_SCORING_CRITERIA
): number {
  let score = 0;
  
  // Source score
  score += criteria.sourceScores[lead.source] || 0;
  
  // Contact info scores
  if (lead.email) score += criteria.emailProvidedScore;
  if (lead.phone) score += criteria.phoneProvidedScore;
  if (lead.budget) score += criteria.budgetProvidedScore;
  
  // Interest scores
  if (lead.interestedInVehicleIds.length > 0) {
    score += criteria.specificVehicleInterestScore;
  }
  
  // Stage-based scores
  const stageOrder = FUNNEL_STAGES[lead.currentStage].order;
  if (stageOrder >= FUNNEL_STAGES.inquiry.order) {
    score += criteria.inquiryMadeScore;
  }
  if (stageOrder >= FUNNEL_STAGES.viewing.order) {
    score += criteria.viewingScheduledScore;
  }
  
  // Inactivity penalty
  if (lead.lastContactedAt) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceContact > criteria.maxDaysBeforePenalty) {
      const penaltyDays = daysSinceContact - criteria.maxDaysBeforePenalty;
      const multiplier = Math.pow(criteria.daysInactiveMultiplier, penaltyDays);
      score *= multiplier;
    }
  }
  
  // Cap at 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Determine lead status based on score and activity
 */
export function determineLeadStatus(
  lead: Lead,
  score: number
): LeadStatus {
  // Already won or lost
  if (lead.status === 'won' || lead.status === 'lost') {
    return lead.status;
  }
  
  // Check conversion
  if (lead.currentStage === 'sale' || lead.currentStage === 'delivery') {
    return 'won';
  }
  
  // Score-based status
  if (score >= 70) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 30) return 'cold';
  
  // Check if qualified
  if (lead.budget && lead.interestedInVehicleIds.length > 0) {
    return 'qualified';
  }
  
  // Check if contacted
  if (lead.lastContactedAt) {
    return 'contacted';
  }
  
  return 'new';
}

/**
 * Calculate conversion rate between stages
 */
export function calculateStageConversionRate(
  fromStage: FunnelStage,
  toStage: FunnelStage,
  events: FunnelEvent[]
): number {
  const enteredFrom = events.filter(e => e.toStage === fromStage).length;
  const progressedTo = events.filter(
    e => e.fromStage === fromStage && e.toStage === toStage
  ).length;
  
  if (enteredFrom === 0) return 0;
  return Math.round((progressedTo / enteredFrom) * 100 * 10) / 10;
}

/**
 * Build funnel visualization data
 */
export function buildFunnelData(
  leads: Lead[],
  events: FunnelEvent[]
): FunnelStageData[] {
  const stages = Object.entries(FUNNEL_STAGES)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([stage]) => stage as FunnelStage);
  
  const stageData: FunnelStageData[] = [];
  
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const nextStage = stages[i + 1];
    
    // Count leads at or past this stage
    const leadsAtStage = leads.filter(l => {
      const currentOrder = FUNNEL_STAGES[l.currentStage].order;
      return currentOrder >= FUNNEL_STAGES[stage].order;
    });
    
    // Calculate value (sum of deals for converted leads)
    const value = leadsAtStage.reduce((sum, l) => {
      if (l.status === 'won' && l.budget) {
        return sum + l.budget.max;
      }
      return sum;
    }, 0);
    
    // Calculate conversion rate to next stage
    let conversionRate = 0;
    if (nextStage && leadsAtStage.length > 0) {
      const progressedLeads = leads.filter(l => {
        const currentOrder = FUNNEL_STAGES[l.currentStage].order;
        return currentOrder >= FUNNEL_STAGES[nextStage].order;
      });
      conversionRate = Math.round((progressedLeads.length / leadsAtStage.length) * 100);
    }
    
    // Calculate average time in stage
    const stageEvents = events.filter(e => e.fromStage === stage && e.duration);
    const averageTime = stageEvents.length > 0
      ? stageEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / stageEvents.length / 60 / 24
      : 0;
    
    // Calculate dropoff rate
    const dropoffRate = nextStage ? 100 - conversionRate : 0;
    
    stageData.push({
      stage,
      count: leadsAtStage.length,
      value,
      conversionRate,
      averageTime: Math.round(averageTime * 10) / 10,
      dropoffRate,
    });
  }
  
  return stageData;
}

/**
 * Calculate overall metrics
 */
export function calculateFunnelMetrics(
  leads: Lead[],
  events: FunnelEvent[],
  period: { start: Date; end: Date }
): FunnelMetrics {
  const periodLeads = leads.filter(l => 
    new Date(l.createdAt) >= period.start && 
    new Date(l.createdAt) <= period.end
  );
  
  const newLeads = periodLeads.length;
  const convertedLeads = periodLeads.filter(l => l.status === 'won').length;
  const lostLeads = periodLeads.filter(l => l.status === 'lost').length;
  
  // Conversion rates by stage
  const stageConversionRates = {} as Record<FunnelStage, number>;
  const stages = Object.keys(FUNNEL_STAGES) as FunnelStage[];
  
  for (let i = 0; i < stages.length - 1; i++) {
    stageConversionRates[stages[i]] = calculateStageConversionRate(
      stages[i],
      stages[i + 1],
      events
    );
  }
  stageConversionRates[stages[stages.length - 1]] = 100; // Last stage
  
  // Leads by source
  const leadsBySource = {} as Record<LeadSource, number>;
  const conversionBySource = {} as Record<LeadSource, number>;
  
  for (const lead of periodLeads) {
    leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
    if (lead.status === 'won') {
      conversionBySource[lead.source] = (conversionBySource[lead.source] || 0) + 1;
    }
  }
  
  // Calculate average time to conversion
  const convertedWithTime = periodLeads.filter(l => l.status === 'won' && l.convertedAt);
  const totalConversionDays = convertedWithTime.reduce((sum, l) => {
    const days = (new Date(l.convertedAt!).getTime() - new Date(l.createdAt).getTime()) 
      / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  const averageTimeToConversion = convertedWithTime.length > 0
    ? totalConversionDays / convertedWithTime.length
    : 0;
  
  // Average time per stage
  const averageTimePerStage = {} as Record<FunnelStage, number>;
  for (const stage of stages) {
    const stageEvents = events.filter(e => e.fromStage === stage && e.duration);
    averageTimePerStage[stage] = stageEvents.length > 0
      ? stageEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / stageEvents.length / 60 / 24
      : 0;
  }
  
  // Revenue metrics
  const totalRevenue = periodLeads
    .filter(l => l.status === 'won' && l.budget)
    .reduce((sum, l) => sum + (l.budget?.max || 0), 0);
  const averageDealValue = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;
  
  // Agent performance
  const leadsByAgent = {} as Record<string, number>;
  const conversionByAgent = {} as Record<string, number>;
  
  for (const lead of periodLeads) {
    if (lead.assignedAgentId) {
      leadsByAgent[lead.assignedAgentId] = (leadsByAgent[lead.assignedAgentId] || 0) + 1;
      if (lead.status === 'won') {
        conversionByAgent[lead.assignedAgentId] = (conversionByAgent[lead.assignedAgentId] || 0) + 1;
      }
    }
  }
  
  return {
    period,
    tenantId: leads[0]?.tenantId || '',
    totalLeads: leads.length,
    newLeads,
    convertedLeads,
    lostLeads,
    overallConversionRate: newLeads > 0 ? Math.round((convertedLeads / newLeads) * 100 * 10) / 10 : 0,
    stageConversionRates,
    leadsBySource,
    conversionBySource,
    averageTimeToConversion: Math.round(averageTimeToConversion * 10) / 10,
    averageTimePerStage,
    totalRevenue,
    averageDealValue: Math.round(averageDealValue),
    leadsByAgent,
    conversionByAgent,
  };
}

/**
 * Get leads requiring follow-up
 */
export function getLeadsNeedingFollowUp(leads: Lead[]): Lead[] {
  const now = new Date();
  
  return leads.filter(lead => {
    // Skip won or lost leads
    if (lead.status === 'won' || lead.status === 'lost') return false;
    
    // Check if follow-up is due
    if (lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) <= now) {
      return true;
    }
    
    // Check for inactivity (no contact in 3 days for hot leads, 7 days for others)
    if (lead.lastContactedAt) {
      const daysSinceContact = Math.floor(
        (now.getTime() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (lead.status === 'hot' && daysSinceContact >= 3) return true;
      if (lead.status === 'warm' && daysSinceContact >= 5) return true;
      if (daysSinceContact >= 7) return true;
    }
    
    // New leads without any contact
    if (!lead.lastContactedAt && lead.status === 'new') {
      const daysSinceCreation = Math.floor(
        (now.getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation >= 1;
    }
    
    return false;
  });
}

/**
 * Get source ROI data
 */
export function calculateSourceROI(
  leads: Lead[],
  adSpend: Record<LeadSource, number>
): {
  source: LeadSource;
  leads: number;
  conversions: number;
  revenue: number;
  spend: number;
  roi: number;
  costPerLead: number;
  costPerConversion: number;
}[] {
  const sources = Object.keys(adSpend) as LeadSource[];
  
  return sources.map(source => {
    const sourceLeads = leads.filter(l => l.source === source);
    const conversions = sourceLeads.filter(l => l.status === 'won');
    const revenue = conversions.reduce((sum, l) => sum + (l.budget?.max || 0), 0);
    const spend = adSpend[source] || 0;
    
    return {
      source,
      leads: sourceLeads.length,
      conversions: conversions.length,
      revenue,
      spend,
      roi: spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0,
      costPerLead: sourceLeads.length > 0 ? Math.round(spend / sourceLeads.length) : 0,
      costPerConversion: conversions.length > 0 ? Math.round(spend / conversions.length) : 0,
    };
  });
}

/**
 * Format metrics for display
 */
export function formatMetric(
  value: number,
  type: 'number' | 'currency' | 'percent' | 'days'
): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    
    case 'percent':
      return `${value}%`;
    
    case 'days':
      if (value < 1) return `${Math.round(value * 24)}h`;
      return `${Math.round(value * 10) / 10}d`;
    
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

export default {
  FUNNEL_STAGES,
  DEFAULT_SCORING_CRITERIA,
  calculateLeadScore,
  determineLeadStatus,
  calculateStageConversionRate,
  buildFunnelData,
  calculateFunnelMetrics,
  getLeadsNeedingFollowUp,
  calculateSourceROI,
  formatMetric,
};
