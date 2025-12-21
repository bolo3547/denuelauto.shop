'use client';

/**
 * useAi Hook
 * Hook for managing AI state and interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { makeApiUrl } from '@/lib/config/api';

interface AiUsage {
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}

interface AiTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  category: string;
  icon: string;
  variablesJson: string[];
}

interface UseAiOptions {
  department?: string;
  autoFetchUsage?: boolean;
  autoFetchTemplates?: boolean;
}

interface UseAiReturn {
  // State
  usage: AiUsage | null;
  templates: AiTemplate[];
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;
  
  // Actions
  fetchUsage: () => Promise<void>;
  fetchTemplates: (dept?: string) => Promise<void>;
  generate: (params: GenerateParams) => Promise<GenerateResult>;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  
  // Computed
  canUseAi: boolean;
  isLimitReached: boolean;
  isLimitWarning: boolean;
}

interface GenerateParams {
  templateId?: string;
  prompt?: string;
  variables?: Record<string, string>;
  department?: string;
}

interface GenerateResult {
  success: boolean;
  content?: string;
  error?: string;
}

export function useAi(options: UseAiOptions = {}): UseAiReturn {
  const { 
    department = 'GENERAL', 
    autoFetchUsage = true, 
    autoFetchTemplates = false 
  } = options;

  // State
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [templates, setTemplates] = useState<AiTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch usage
  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(makeApiUrl('/api/ai/usage'));
      const data = await res.json();
      if (data.success) {
        setUsage({
          current: data.currentMonth?.requests || 0,
          limit: data.limit,
          percentage: data.percentage,
          remaining: data.remaining
        });
      }
    } catch (err) {
      console.error('Failed to fetch AI usage:', err);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async (dept?: string) => {
    try {
      const res = await fetch(makeApiUrl(`/api/ai/templates?department=${dept || department}`));
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch AI templates:', err);
    }
  }, [department]);

  // Generate AI content
  const generate = useCallback(async (params: GenerateParams): Promise<GenerateResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(makeApiUrl('/api/ai/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: params.department || department,
          templateId: params.templateId,
          prompt: params.prompt,
          variables: params.variables
        })
      });

      const data = await res.json();

      if (data.success) {
        // Update usage after successful generation
        if (data.remaining) {
          setUsage(prev => prev ? {
            ...prev,
            current: prev.limit - data.remaining.requests,
            remaining: data.remaining.requests,
            percentage: data.remaining.percentage
          } : null);
        }
        return { success: true, content: data.content };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate AI content';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [department]);

  // Panel controls
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);

  // Computed values
  const canUseAi = usage?.limit === -1 || (usage?.remaining || 0) > 0;
  const isLimitReached = usage?.limit !== -1 && usage?.remaining === 0;
  const isLimitWarning = usage?.limit !== -1 && (usage?.percentage || 0) >= 80;

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetchUsage) {
      fetchUsage();
    }
  }, [autoFetchUsage, fetchUsage]);

  useEffect(() => {
    if (autoFetchTemplates) {
      fetchTemplates();
    }
  }, [autoFetchTemplates, fetchTemplates]);

  return {
    // State
    usage,
    templates,
    isLoading,
    error,
    isPanelOpen,
    
    // Actions
    fetchUsage,
    fetchTemplates,
    generate,
    openPanel,
    closePanel,
    togglePanel,
    
    // Computed
    canUseAi,
    isLimitReached,
    isLimitWarning
  };
}

export default useAi;
