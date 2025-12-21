/**
 * AI Execution API Routes
 * 
 * Backend endpoints for executing AI prompts with tenant context.
 * Integrates with audit logging and subscription limits.
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// =============================================================================
// TYPES
// =============================================================================

type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';
type OutputFormat = 'text' | 'json' | 'markdown' | 'list';
type AIProvider = 'openai' | 'anthropic' | 'mock';

interface AIExecutionRequest {
  department: string;
  promptId?: string;
  actionId?: string;
  context: Record<string, any>;
  customPrompt?: string;
  promptTemplate?: string;
  selectedText?: string;
  outputFormat?: OutputFormat;
  maxTokens?: number;
}

interface AIExecutionResponse {
  success: boolean;
  data?: {
    id: string;
    content: string;
    tokensUsed: number;
    processingTime: number;
  };
  error?: string;
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantId =
    (req.headers['x-tenant-id'] as string) ||
    (req as any).tenantId ||
    (req.body?.tenantId as string | undefined);
  
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
 * Check AI access based on subscription
 */
const requireAIAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
    const department = String((req.body as any)?.department || '');

    const subscription = await prisma.billingSubscription
      .findFirst({
        where: { tenantId, status: 'active' },
        orderBy: { updatedAt: 'desc' },
      })
      .catch(() => null);

    const planType = resolvePlanTier(subscription?.planKey);

    // AI availability by plan and department
    const aiByPlan: Record<PlanTier, string[]> = {
      starter: [],
      growth: ['sales', 'agent'],
      pro: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations'],
      enterprise: ['admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'],
    };

    const allowedDepartments = aiByPlan[planType] || [];

    if (!allowedDepartments.includes(department)) {
      return res.status(403).json({
        success: false,
        error: 'AI not available for this department on your current plan',
        upgradeRequired: true,
        currentPlan: planType,
        requiredPlan: getRequiredPlanForAI(department),
      });
    }

    // Check monthly limit
    const limits: Record<PlanTier, number> = {
      starter: 0,
      growth: 500,
      pro: 2000,
      enterprise: -1, // Unlimited
    };

    const monthlyLimit = limits[planType];
    
    if (monthlyLimit !== -1) {
      const usageThisMonth = await getUsageForCurrentMonth(tenantId, 'ai.requests').catch(() => 0);

      if (usageThisMonth >= monthlyLimit) {
        return res.status(429).json({
          success: false,
          error: 'Monthly AI request limit reached',
          upgradeRequired: true,
          currentPlan: planType,
          usage: usageThisMonth,
          limit: monthlyLimit,
        });
      }
    }

    next();
  } catch (error) {
    console.error('[AI API] Error checking AI access:', error);
    next(error);
  }
};

// =============================================================================
// AI EXECUTION ROUTES
// =============================================================================

/**
 * POST /api/ai/execute
 * Execute an AI prompt
 */
router.post('/execute', requireTenant, requireAIAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id || 'unknown';
    const {
      department,
      promptId,
      actionId,
      context,
      customPrompt,
      promptTemplate,
      selectedText,
      outputFormat,
      maxTokens,
    } = req.body as AIExecutionRequest;

    const startTime = Date.now();

    // Build the prompt based on department and context
    const systemPrompt = buildSystemPrompt(department);
    const effectiveContext = {
      ...(context || {}),
      ...(selectedText ? { selected_text: selectedText } : {}),
    };

    const baseUserPrompt =
      customPrompt ||
      (promptTemplate ? renderPromptTemplate(promptTemplate, effectiveContext) : buildUserPrompt(promptId, actionId, effectiveContext));

    const userPrompt = applyOutputFormatInstructions(baseUserPrompt, outputFormat);

    // Execute AI call (OpenAI/Anthropic/mock based on env)
    const aiResult = await executeAICall(systemPrompt, userPrompt, {
      outputFormat,
      maxTokens,
    });

    const processingTime = Date.now() - startTime;

    // Log to audit (in production)
    await logAIExecution({
      tenantId,
      userId,
      department,
      promptId,
      actionId,
      context,
      result: aiResult.content,
      tokensUsed: aiResult.tokensUsed,
      processingTime,
      success: true,
    });

    await recordUsageForCurrentMonth(tenantId, 'ai.requests', 1).catch(() => null);

    res.json({
      success: true,
      data: {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: aiResult.content,
        tokensUsed: aiResult.tokensUsed,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error('[AI API] Error executing AI prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute AI prompt',
    });
  }
});

/**
 * POST /api/ai/rewrite
 * Quick action: Rewrite text
 */
router.post('/rewrite', requireTenant, requireAIAccess, async (req: Request, res: Response) => {
  try {
    const { text, tone = 'professional', department } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const startTime = Date.now();

    const result = await executeAICall(
      `You are a professional copywriter for a car dealership. Rewrite the following text to be ${tone}.`,
      text
    );

    const processingTime = Date.now() - startTime;
    await recordUsageForCurrentMonth((req as any).tenantId, 'ai.requests', 1).catch(() => null);

    res.json({
      success: true,
      data: {
        id: `ai_rewrite_${Date.now()}`,
        original: text,
        rewritten: result.content,
        tokensUsed: result.tokensUsed,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error('[AI API] Error rewriting text:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to rewrite text',
    });
  }
});

/**
 * POST /api/ai/summarize
 * Quick action: Summarize content
 */
router.post('/summarize', requireTenant, requireAIAccess, async (req: Request, res: Response) => {
  try {
    const { content, maxLength = 200, department } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const startTime = Date.now();

    const result = await executeAICall(
      `You are an assistant for a car dealership. Summarize the following content in ${maxLength} characters or less. Be concise and highlight key points.`,
      content
    );

    const processingTime = Date.now() - startTime;
    await recordUsageForCurrentMonth((req as any).tenantId, 'ai.requests', 1).catch(() => null);

    res.json({
      success: true,
      data: {
        id: `ai_summary_${Date.now()}`,
        summary: result.content,
        tokensUsed: result.tokensUsed,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error('[AI API] Error summarizing content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize content',
    });
  }
});

/**
 * POST /api/ai/suggest
 * Quick action: Get AI suggestions
 */
router.post('/suggest', requireTenant, requireAIAccess, async (req: Request, res: Response) => {
  try {
    const { context, type = 'general', department } = req.body;

    const startTime = Date.now();

    const promptByType: Record<string, string> = {
      general: 'Provide helpful suggestions based on this context.',
      reply: 'Suggest a professional reply to this customer inquiry.',
      action: 'Suggest the next best action to take.',
      improvement: 'Suggest ways to improve this.',
    };

    const result = await executeAICall(
      `You are an AI assistant for a car dealership ${department} department. ${promptByType[type] || promptByType.general}`,
      applyOutputFormatInstructions(JSON.stringify(context), 'list')
    );

    const processingTime = Date.now() - startTime;
    await recordUsageForCurrentMonth((req as any).tenantId, 'ai.requests', 1).catch(() => null);

    res.json({
      success: true,
      data: {
        id: `ai_suggest_${Date.now()}`,
        suggestions: result.content,
        tokensUsed: result.tokensUsed,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error('[AI API] Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get suggestions',
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getRequiredPlanForAI(department: string): string {
  const requirements: Record<string, string> = {
    admin: 'pro',
    sales: 'growth',
    agent: 'growth',
    accountant: 'pro',
    hr: 'pro',
    graphic_design: 'pro',
    zr_operations: 'pro',
    custom: 'enterprise',
  };
  return requirements[department] || 'enterprise';
}

function buildSystemPrompt(department: string): string {
  const prompts: Record<string, string> = {
    admin: 'You are an AI assistant for car dealership administrators. Help with performance analysis, inventory management, and business decisions.',
    sales: 'You are an AI assistant for car dealership sales teams. Help with customer communication, lead qualification, and sales strategies.',
    agent: 'You are an AI assistant for car dealership field agents. Help with lead prioritization, visit planning, and customer follow-ups.',
    accountant: 'You are an AI assistant for car dealership accounting. Help with payment tracking, financial summaries, and overdue detection.',
    hr: 'You are an AI assistant for car dealership HR. Help with employee performance, leave management, and team coordination.',
    graphic_design: 'You are an AI assistant for car dealership marketing. Help with promotional content, SEO optimization, and banner text.',
    zr_operations: 'You are an AI assistant for ZR Operations (Zimbabwe Registry). Help with vehicle documentation and compliance.',
    custom: 'You are a versatile AI assistant for car dealership operations. Adapt to the specific needs provided.',
  };
  return prompts[department] || prompts.custom;
}

function buildUserPrompt(promptId?: string, actionId?: string, context?: Record<string, any>): string {
  if (context?.custom_query) {
    return context.custom_query;
  }

  // Build prompt from context
  const parts: string[] = [];

  if (context?.selected_text) {
    parts.push(`Selected text: "${context.selected_text}"`);
  }

  if (context?.page) {
    parts.push(`Current page: ${context.page}`);
  }

  if (context?.data) {
    parts.push(`Data: ${JSON.stringify(context.data)}`);
  }

  return parts.join('\n') || 'Please provide assistance.';
}

async function executeAICall(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    outputFormat?: OutputFormat;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{ content: string; tokensUsed: number }> {
  const provider = resolveAIProvider();
  const outputFormat = options?.outputFormat;

  const temperature = options?.temperature ?? (outputFormat === 'json' ? 0 : 0.4);
  const maxTokens = options?.maxTokens ?? 800;

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

    const model = process.env.OPENAI_MODEL || 'gpt-4o';

    const body: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    };

    if (outputFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const resp = await axios.post('https://api.openai.com/v1/chat/completions', body, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 45_000,
    });

    const content = resp.data?.choices?.[0]?.message?.content ?? '';
    const tokensUsed = resp.data?.usage?.total_tokens ?? 0;

    return { content, tokensUsed };
  }

  if (provider === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    const body: any = {
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    };

    const resp = await axios.post('https://api.anthropic.com/v1/messages', body, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 45_000,
    });

    const parts = Array.isArray(resp.data?.content) ? resp.data.content : [];
    const content = parts.map((p: any) => (p?.type === 'text' ? p.text : '')).join('') || '';
    const tokensUsed = (resp.data?.usage?.input_tokens ?? 0) + (resp.data?.usage?.output_tokens ?? 0);

    return { content, tokensUsed };
  }

  // Mock provider (dev fallback)
  const content =
    outputFormat === 'json'
      ? JSON.stringify({ ok: true, message: 'Mock AI response (set OPENAI_API_KEY or ANTHROPIC_API_KEY for real output).' })
      : 'Mock AI response (set OPENAI_API_KEY or ANTHROPIC_API_KEY for real output).';

  const tokensUsed = Math.floor(content.length / 4) + Math.floor(userPrompt.length / 4);
  return { content, tokensUsed };
}

async function logAIExecution(params: {
  tenantId: string;
  userId: string;
  department: string;
  promptId?: string;
  actionId?: string;
  context?: Record<string, any>;
  result: string;
  tokensUsed: number;
  processingTime: number;
  success: boolean;
}): Promise<void> {
  // In production, this would write to the audit log table
  console.log(`[AI Audit] Tenant ${params.tenantId}: ${params.department} - ${params.tokensUsed} tokens`);
}

function resolveAIProvider(): AIProvider {
  const raw = String(process.env.AI_PROVIDER || '').toLowerCase().trim();
  if (raw === 'openai' || raw === 'anthropic' || raw === 'mock') return raw;
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'mock';
}

function resolvePlanTier(planKey?: string): PlanTier {
  const normalized = String(planKey || '').toLowerCase();
  if (normalized.includes('enterprise')) return 'enterprise';
  if (normalized.includes('pro')) return 'pro';
  if (normalized.includes('growth')) return 'growth';
  if (normalized.includes('starter') || normalized.includes('free') || normalized.includes('trial')) return 'starter';

  const envPlan = String(process.env.AI_DEFAULT_PLAN || '').toLowerCase();
  if (envPlan === 'starter' || envPlan === 'growth' || envPlan === 'pro' || envPlan === 'enterprise') {
    return envPlan as PlanTier;
  }

  return process.env.NODE_ENV === 'production' ? 'starter' : 'pro';
}

function getMonthWindow(now: Date): { windowStart: Date; windowEnd: Date } {
  const windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const windowEnd = new Date(windowStart.getFullYear(), windowStart.getMonth() + 1, 1);
  return { windowStart, windowEnd };
}

async function getUsageForCurrentMonth(tenantId: string, meterKey: string): Promise<number> {
  const { windowStart, windowEnd } = getMonthWindow(new Date());
  const meter = await prisma.usageMeter.findFirst({
    where: { tenantId, meterKey, windowStart, windowEnd },
  });
  return meter?.qty || 0;
}

async function recordUsageForCurrentMonth(tenantId: string, meterKey: string, qty: number): Promise<void> {
  const { windowStart, windowEnd } = getMonthWindow(new Date());
  const existing = await prisma.usageMeter.findFirst({
    where: { tenantId, meterKey, windowStart, windowEnd },
  });

  if (existing) {
    await prisma.usageMeter.update({
      where: { id: existing.id },
      data: { qty: { increment: qty } },
    });
    return;
  }

  await prisma.usageMeter.create({
    data: { tenantId, meterKey, qty, windowStart, windowEnd } as any,
  });
}

function renderPromptTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/{([a-zA-Z0-9_]+)}/g, (_match, key) => {
    const value = context?.[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  });
}

function applyOutputFormatInstructions(prompt: string, outputFormat?: OutputFormat): string {
  if (!outputFormat) return prompt;

  const suffixByFormat: Record<OutputFormat, string> = {
    text: 'Respond in plain text.',
    markdown: 'Respond in Markdown.',
    list: 'Respond as a concise list (one item per line).',
    json: 'Respond with valid JSON only (no Markdown, no code fences).',
  };

  return `${prompt}\n\n${suffixByFormat[outputFormat]}`;
}

// =============================================================================
// EXPORT
// =============================================================================

export default router;
