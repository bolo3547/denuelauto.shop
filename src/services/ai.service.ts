/**
 * Denuel AI Service
 * Core AI functionality with OpenAI integration, rate limiting, and tenant isolation
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types
export type AiDepartment = 'ADMIN' | 'SALES' | 'AGENT' | 'ACCOUNTANT' | 'HR' | 'DESIGN' | 'ZR' | 'GENERAL';

export interface AiRequest {
  tenantId: string;
  userId: string;
  department: AiDepartment;
  templateId?: string;
  prompt: string;
  variables?: Record<string, string>;
  maxTokens?: number;
}

export interface AiResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  remaining?: {
    requests: number;
    percentage: number;
  };
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  percentage: number;
  canPurchaseCredits: boolean;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Safe variable interpolation - prevents injection attacks
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string>,
  allowedVariables: string[]
): string {
  let result = template;
  
  for (const key of allowedVariables) {
    const placeholder = `{${key}}`;
    const value = variables[key] || '';
    // Sanitize value - remove any potential injection attempts
    const sanitizedValue = String(value)
      .replace(/[<>]/g, '') // Remove HTML-like tags
      .substring(0, 5000); // Limit length per variable
    result = result.split(placeholder).join(sanitizedValue);
  }
  
  return result;
}

/**
 * Check if tenant can make AI request
 */
export async function checkAiUsage(tenantId: string): Promise<UsageCheckResult> {
  // Get tenant's subscription plan
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscription: true,
      aiSettings: true
    }
  });

  if (!tenant) {
    return {
      allowed: false,
      reason: 'Tenant not found',
      current: 0,
      limit: 0,
      percentage: 0,
      canPurchaseCredits: false
    };
  }

  // Get plan AI config
  const planKey = tenant.subscription?.planId || 'STARTER';
  const planConfig = await prisma.planAiConfig.findUnique({
    where: { planKey }
  });

  if (!planConfig || !planConfig.aiEnabled) {
    return {
      allowed: false,
      reason: 'AI is not available on your current plan. Please upgrade to Growth or higher.',
      current: 0,
      limit: 0,
      percentage: 0,
      canPurchaseCredits: planKey !== 'STARTER'
    };
  }

  // Get or create current month's usage
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  let usage = await prisma.tenantAiUsage.findFirst({
    where: {
      tenantId,
      month: monthStart
    }
  });

  if (!usage) {
    usage = await prisma.tenantAiUsage.create({
      data: {
        tenantId,
        month: monthStart,
        requestCount: 0,
        tokenCount: 0
      }
    });
  }

  // Calculate total available (plan limit + purchased credits)
  const baseLimit = planConfig.monthlyRequestLimit;
  const bonusCredits = tenant.aiSettings?.bonusCredits || 0;
  const totalLimit = baseLimit === -1 ? -1 : baseLimit + bonusCredits;
  
  // Unlimited check
  if (totalLimit === -1) {
    return {
      allowed: true,
      current: usage.requestCount,
      limit: -1,
      percentage: 0,
      canPurchaseCredits: false
    };
  }

  const percentage = Math.round((usage.requestCount / totalLimit) * 100);
  const allowed = usage.requestCount < totalLimit;

  return {
    allowed,
    reason: allowed ? undefined : 'Monthly AI request limit reached. Purchase additional credits or wait for next month.',
    current: usage.requestCount,
    limit: totalLimit,
    percentage,
    canPurchaseCredits: true
  };
}

/**
 * Get available templates for department
 */
export async function getTemplatesForDepartment(
  tenantId: string,
  department: AiDepartment
): Promise<any[]> {
  const templates = await prisma.promptTemplate.findMany({
    where: {
      OR: [
        { tenantId: null, isGlobal: true }, // Global templates
        { tenantId } // Tenant-specific templates
      ],
      department,
      isEnabled: true
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  return templates;
}

/**
 * Get a specific template
 */
export async function getTemplate(templateId: string, tenantId: string) {
  const template = await prisma.promptTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        { tenantId: null, isGlobal: true },
        { tenantId }
      ],
      isEnabled: true
    }
  });

  return template;
}

/**
 * Execute AI request
 */
export async function executeAiRequest(request: AiRequest): Promise<AiResponse> {
  try {
    // Check usage limits
    const usageCheck = await checkAiUsage(request.tenantId);
    if (!usageCheck.allowed) {
      return {
        success: false,
        error: usageCheck.reason,
        remaining: {
          requests: Math.max(0, usageCheck.limit - usageCheck.current),
          percentage: usageCheck.percentage
        }
      };
    }

    // Get template if specified
    let systemPrompt = 'You are a helpful AI assistant for a car dealership.';
    let userPrompt = request.prompt;
    let allowedVariables: string[] = [];

    if (request.templateId) {
      const template = await getTemplate(request.templateId, request.tenantId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }
      systemPrompt = template.systemPrompt;
      userPrompt = template.userPromptTemplate;
      allowedVariables = (template.variablesJson as string[]) || [];
    }

    // Interpolate variables if provided
    if (request.variables && allowedVariables.length > 0) {
      userPrompt = interpolateTemplate(userPrompt, request.variables, allowedVariables);
    }

    // Get plan config for token limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: request.tenantId },
      include: { subscription: true }
    });
    const planKey = tenant?.subscription?.planId || 'GROWTH';
    const planConfig = await prisma.planAiConfig.findUnique({
      where: { planKey }
    });

    const maxTokens = request.maxTokens || planConfig?.maxOutputTokens || 1000;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    // Record the interaction
    await prisma.aiInteraction.create({
      data: {
        tenantId: request.tenantId,
        userId: request.userId,
        templateId: request.templateId,
        department: request.department,
        promptText: userPrompt.substring(0, 2000), // Truncate for storage
        responseText: content.substring(0, 5000),
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        model: 'gpt-4o-mini',
        success: true
      }
    });

    // Update usage counter
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    await prisma.tenantAiUsage.upsert({
      where: {
        tenantId_month: {
          tenantId: request.tenantId,
          month: monthStart
        }
      },
      update: {
        requestCount: { increment: 1 },
        tokenCount: { increment: (usage?.total_tokens || 0) }
      },
      create: {
        tenantId: request.tenantId,
        month: monthStart,
        requestCount: 1,
        tokenCount: usage?.total_tokens || 0
      }
    });

    // Get updated remaining
    const updatedUsage = await checkAiUsage(request.tenantId);

    return {
      success: true,
      content,
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0
      },
      remaining: {
        requests: Math.max(0, updatedUsage.limit - updatedUsage.current),
        percentage: updatedUsage.percentage
      }
    };

  } catch (error: any) {
    console.error('AI request error:', error);

    // Log failed interaction
    await prisma.aiInteraction.create({
      data: {
        tenantId: request.tenantId,
        userId: request.userId,
        templateId: request.templateId,
        department: request.department,
        promptText: request.prompt.substring(0, 2000),
        responseText: null,
        promptTokens: 0,
        completionTokens: 0,
        model: 'gpt-4o-mini',
        success: false,
        errorMessage: error.message
      }
    });

    return {
      success: false,
      error: 'Failed to process AI request. Please try again.'
    };
  }
}

/**
 * Get AI usage stats for tenant
 */
export async function getAiUsageStats(tenantId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usage, recentInteractions, usageCheck] = await Promise.all([
    prisma.tenantAiUsage.findFirst({
      where: { tenantId, month: monthStart }
    }),
    prisma.aiInteraction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        department: true,
        createdAt: true,
        success: true,
        promptTokens: true,
        completionTokens: true
      }
    }),
    checkAiUsage(tenantId)
  ]);

  return {
    currentMonth: {
      requests: usage?.requestCount || 0,
      tokens: usage?.tokenCount || 0
    },
    limit: usageCheck.limit,
    percentage: usageCheck.percentage,
    remaining: usageCheck.limit === -1 ? -1 : usageCheck.limit - usageCheck.current,
    recentInteractions
  };
}

/**
 * Purchase additional AI credits
 */
export async function purchaseAiCredits(
  tenantId: string,
  creditPackage: 'SMALL' | 'LARGE',
  paymentReference: string
): Promise<{ success: boolean; creditsAdded: number; error?: string }> {
  const packages = {
    SMALL: { credits: 200, priceZmw: 150 },
    LARGE: { credits: 1000, priceZmw: 600 }
  };

  const pkg = packages[creditPackage];
  if (!pkg) {
    return { success: false, creditsAdded: 0, error: 'Invalid package' };
  }

  try {
    // Record purchase
    await prisma.aiCreditPurchase.create({
      data: {
        tenantId,
        credits: pkg.credits,
        amountPaid: pkg.priceZmw,
        currency: 'ZMW',
        paymentReference
      }
    });

    // Add credits to tenant
    await prisma.tenantAiSettings.upsert({
      where: { tenantId },
      update: {
        bonusCredits: { increment: pkg.credits }
      },
      create: {
        tenantId,
        bonusCredits: pkg.credits
      }
    });

    return { success: true, creditsAdded: pkg.credits };
  } catch (error: any) {
    console.error('Credit purchase error:', error);
    return { success: false, creditsAdded: 0, error: 'Failed to process purchase' };
  }
}

export default {
  executeAiRequest,
  checkAiUsage,
  getTemplatesForDepartment,
  getTemplate,
  getAiUsageStats,
  purchaseAiCredits,
  interpolateTemplate
};
