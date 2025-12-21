'use client';

import { useState, useCallback } from 'react';
import { makeApiUrl } from '@/lib/config/api';
import { DepartmentPortal } from '../subscription/pricing-tiers';
import { 
  getAIConfigForDepartment, 
  getPromptById,
  DepartmentAIConfig,
} from '../subscription/ai-capabilities';
import { useAIAccess } from '../subscription/subscription-context';

// =============================================================================
// TYPES
// =============================================================================

export type AIContextValue =
  | string
  | number
  | boolean
  | null
  | AIContextValue[]
  | { [key: string]: AIContextValue };

export type AIContext = Record<string, AIContextValue>;

export interface AIRequest {
  promptId: string;
  context: AIContext;
  selectedText?: string;
}

export interface AIResponse {
  id: string;
  promptId: string;
  content: string;
  format: 'text' | 'json' | 'markdown' | 'list';
  tokensUsed: number;
  processingTime: number;
  timestamp: string;
}

export interface AIState {
  loading: boolean;
  error: string | null;
  response: AIResponse | null;
  history: AIResponse[];
}

export interface UseAIAssistantReturn {
  // State
  loading: boolean;
  error: string | null;
  response: AIResponse | null;
  history: AIResponse[];
  
  // Config
  config: DepartmentAIConfig;
  isEnabled: boolean;
  upgradeRequired: string | null;
  
  // Actions
  executePrompt: (request: AIRequest) => Promise<AIResponse | null>;
  executeQuickAction: (actionId: string, context?: AIContext) => Promise<AIResponse | null>;
  rewrite: (text: string, context?: AIContext) => Promise<string | null>;
  summarize: (data: AIContextValue, context?: AIContext) => Promise<string | null>;
  suggest: (context: AIContext) => Promise<string | null>;
  clearHistory: () => void;
  clearError: () => void;
}

// =============================================================================
// AI SERVICE HOOK
// =============================================================================

export function useAIAssistant(
  department: DepartmentPortal,
  tenantId: string
): UseAIAssistantReturn {
  const [state, setState] = useState<AIState>({
    loading: false,
    error: null,
    response: null,
    history: [],
  });

  const aiAccess = useAIAccess(department);
  const config = getAIConfigForDepartment(department);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [tenantId]);

  // Execute AI prompt
  const executePrompt = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    if (!aiAccess.allowed) {
      setState(prev => ({
        ...prev,
        error: aiAccess.reason || 'AI is not enabled for this department',
      }));
      return null;
    }

    const prompt = getPromptById(department, request.promptId);
    if (!prompt) {
      setState(prev => ({
        ...prev,
        error: `Prompt ${request.promptId} not found`,
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const startTime = Date.now();

      // Call AI API
      const response = await fetch(makeApiUrl('/api/ai/execute'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          department,
          promptId: request.promptId,
          promptTemplate: prompt.prompt,
          context: request.context,
          selectedText: request.selectedText,
          outputFormat: prompt.outputFormat,
        }),
      });

      if (!response.ok) {
        let errorMessage = `AI request failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData?.error ||
            errorData?.message ||
            errorData?.data?.error ||
            errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const payload = await response.json();
      const data = payload?.data || payload;
      const processingTime = Date.now() - startTime;

      const aiResponse: AIResponse = {
        id: data?.id || `ai-${Date.now()}`,
        promptId: request.promptId,
        content: data?.content || '',
        format: prompt.outputFormat,
        tokensUsed: data?.tokensUsed || 0,
        processingTime: data?.processingTime || processingTime,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        loading: false,
        response: aiResponse,
        history: [aiResponse, ...prev.history].slice(0, 50), // Keep last 50
      }));

      return aiResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [department, aiAccess, getAuthHeaders]);

  // Execute quick action
  const executeQuickAction = useCallback(async (
    actionId: string,
    context: AIContext = {}
  ): Promise<AIResponse | null> => {
    const action = config.quickActions.find(a => a.id === actionId);
    if (!action) {
      setState(prev => ({
        ...prev,
        error: `Quick action ${actionId} not found`,
      }));
      return null;
    }

    return executePrompt({
      promptId: action.promptId,
      context,
    });
  }, [config.quickActions, executePrompt]);

  // Convenience: Rewrite text
  const rewrite = useCallback(async (
    text: string,
    context: AIContext = {}
  ): Promise<string | null> => {
    // Find a rewrite prompt for this department
    const rewritePrompt = config.prompts.find(p => p.capability === 'rewrite');
    if (!rewritePrompt) {
      setState(prev => ({
        ...prev,
        error: 'No rewrite capability available for this department',
      }));
      return null;
    }

    const response = await executePrompt({
      promptId: rewritePrompt.id,
      context: { ...context, original_text: text },
      selectedText: text,
    });

    return response?.content || null;
  }, [config.prompts, executePrompt]);

  // Convenience: Summarize data
  const summarize = useCallback(async (
    data: AIContextValue,
    context: AIContext = {}
  ): Promise<string | null> => {
    const summarizePrompt = config.prompts.find(p => p.capability === 'summarize');
    if (!summarizePrompt) {
      setState(prev => ({
        ...prev,
        error: 'No summarize capability available for this department',
      }));
      return null;
    }

    const response = await executePrompt({
      promptId: summarizePrompt.id,
      context: { ...context, data },
    });

    return response?.content || null;
  }, [config.prompts, executePrompt]);

  // Convenience: Get suggestions
  const suggest = useCallback(async (
    context: AIContext
  ): Promise<string | null> => {
    const suggestPrompt = config.prompts.find(p => p.capability === 'suggest');
    if (!suggestPrompt) {
      setState(prev => ({
        ...prev,
        error: 'No suggest capability available for this department',
      }));
      return null;
    }

    const response = await executePrompt({
      promptId: suggestPrompt.id,
      context,
    });

    return response?.content || null;
  }, [config.prompts, executePrompt]);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    response: state.response,
    history: state.history,

    // Config
    config,
    isEnabled: aiAccess.allowed,
    upgradeRequired: aiAccess.allowed ? null : (aiAccess.reason || null),

    // Actions
    executePrompt,
    executeQuickAction,
    rewrite,
    summarize,
    suggest,
    clearHistory,
    clearError,
  };
}

// =============================================================================
// SPECIALIZED HOOKS PER DEPARTMENT
// =============================================================================

export function useAdminAI(tenantId: string) {
  const ai = useAIAssistant('admin', tenantId);

  return {
    ...ai,
    summarizePerformance: () => ai.executeQuickAction('summarize_performance'),
    suggestUpgrades: (usageMetrics: AIContextValue) => 
      ai.executeQuickAction('suggest_upgrades', { usage_metrics: usageMetrics }),
    findInactiveStock: (inventory: AIContextValue) => 
      ai.executeQuickAction('inactive_stock', { inventory }),
    getTopPerformers: (salesData: AIContextValue) => 
      ai.executeQuickAction('top_performers', { sales_data: salesData }),
  };
}

export function useSalesAI(tenantId: string) {
  const ai = useAIAssistant('sales', tenantId);

  return {
    ...ai,
    rewriteReply: (text: string, customerContext?: AIContextValue) =>
      ai.rewrite(text, { customer_context: customerContext ?? null }),
    suggestFollowup: (leadData: AIContextValue) =>
      ai.executeQuickAction('suggest_followup', { lead_data: leadData }),
    findHotLeads: (leads: AIContextValue) =>
      ai.executeQuickAction('detect_hot_leads', { leads }),
    recommendCars: (customerPrefs: AIContextValue, inventory: AIContextValue) =>
      ai.executeQuickAction('recommend_cars', { 
        customer_preferences: customerPrefs, 
        inventory 
      }),
  };
}

export function useAgentAI(tenantId: string) {
  const ai = useAIAssistant('agent', tenantId);

  return {
    ...ai,
    prioritizeLeads: (leads: AIContextValue) =>
      ai.executeQuickAction('prioritize_leads', { leads_list: leads }),
    summarizeVisit: (visitNotes: string, customerName: string) =>
      ai.executeQuickAction('summarize_visit', { 
        visit_notes: visitNotes, 
        customer_name: customerName 
      }),
    suggestResponse: (query: string, vehicleContext?: AIContextValue) =>
      ai.executeQuickAction('suggest_response', { 
        customer_query: query, 
        vehicle_context: vehicleContext ?? null 
      }),
    generateAutoNotes: (rawInput: string) =>
      ai.executeQuickAction('auto_notes', { raw_input: rawInput }),
  };
}

export function useAccountantAI(tenantId: string) {
  const ai = useAIAssistant('accountant', tenantId);

  return {
    ...ai,
    summarizePayments: (period: string, payments: AIContextValue) =>
      ai.executeQuickAction('summarize_payments', { period, payments }),
    flagOverdue: (installments: AIContextValue) =>
      ai.executeQuickAction('flag_overdue', { installments }),
    explainReport: (reportData: AIContextValue) =>
      ai.executeQuickAction('explain_report', { report_data: reportData }),
    generateMonthlySummary: (monthlyData: AIContextValue) =>
      ai.executeQuickAction('monthly_summary', { monthly_data: monthlyData }),
  };
}

export function useHRAI(tenantId: string) {
  const ai = useAIAssistant('hr', tenantId);

  return {
    ...ai,
    getPerformanceSummary: (performanceData: AIContextValue) =>
      ai.executeQuickAction('performance_summary', { performance_data: performanceData }),
    analyzeLeaveRequest: (request: AIContextValue, teamCoverage: AIContextValue) =>
      ai.executeQuickAction('analyze_leave', { 
        request_details: request, 
        coverage_data: teamCoverage 
      }),
    recommendRoles: (staffSkills: AIContextValue, openPositions: AIContextValue) =>
      ai.executeQuickAction('role_recommend', { 
        staff_skills: staffSkills, 
        open_positions: openPositions 
      }),
    explainPolicy: (policyText: string) =>
      ai.executeQuickAction('policy_explain', { policy_text: policyText }),
  };
}

export function useDesignAI(tenantId: string) {
  const ai = useAIAssistant('graphic_design', tenantId);

  return {
    ...ai,
    generateBannerText: (promotionDetails: AIContextValue, targetAudience: string) =>
      ai.executeQuickAction('banner_text', { 
        promotion_details: promotionDetails, 
        target_audience: targetAudience 
      }),
    suggestCaptions: (vehicleData: AIContextValue, platform: string) =>
      ai.executeQuickAction('promo_captions', { 
        vehicle_data: vehicleData, 
        platform 
      }),
    optimizeSEOTitle: (vehicleData: AIContextValue, keywords: string[]) =>
      ai.executeQuickAction('seo_titles', { 
        vehicle_data: vehicleData, 
        keywords 
      }),
    recommendImageOrder: (imageDescriptions: string[]) =>
      ai.executeQuickAction('image_order', { image_descriptions: imageDescriptions }),
  };
}

export function useOperationsAI(tenantId: string) {
  const ai = useAIAssistant('zr_operations', tenantId);

  return {
    ...ai,
    suggestStatusUpdate: (stockItem: AIContextValue, currentStatus: string, timeline: AIContextValue) =>
      ai.executeQuickAction('status_updates', { 
        stock_item: stockItem, 
        current_status: currentStatus, 
        timeline 
      }),
    detectDelays: (shipments: AIContextValue) =>
      ai.executeQuickAction('detect_delays', { shipments }),
    generateHandoverChecklist: (vehicleData: AIContextValue, customerData: AIContextValue) =>
      ai.executeQuickAction('handover_checklist', { 
        vehicle_data: vehicleData, 
        customer_data: customerData 
      }),
    getOperationsSummary: (dailyData: AIContextValue) =>
      ai.executeQuickAction('ops_summary', { daily_data: dailyData }),
  };
}
