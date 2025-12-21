'use client';

/**
 * Denuel AI Panel Component
 * Reusable AI assistant panel for all portals
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, X, Send, Copy, Check, ChevronDown, ChevronRight,
  Loader2, AlertCircle, RefreshCw, History, Zap
} from 'lucide-react';

// Types
interface AiTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  category: string;
  icon: string;
  variablesJson: string[];
}

interface AiUsage {
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}

interface DenuelAiPanelProps {
  department: string;
  tenantSlug: string;
  context?: Record<string, string>;
  onClose?: () => void;
  isOpen?: boolean;
  position?: 'right' | 'bottom' | 'modal';
}

export default function DenuelAiPanel({
  department,
  tenantSlug,
  context = {},
  onClose,
  isOpen = true,
  position = 'right'
}: DenuelAiPanelProps) {
  // State
  const [templates, setTemplates] = useState<AiTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AiTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [mode, setMode] = useState<'template' | 'custom'>('template');

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    fetchUsage();
  }, [department]);

  // Initialize variables from context
  useEffect(() => {
    if (selectedTemplate && context) {
      const initialVars: Record<string, string> = {};
      (selectedTemplate.variablesJson || []).forEach(varName => {
        if (context[varName]) {
          initialVars[varName] = context[varName];
        }
      });
      setVariables(prev => ({ ...initialVars, ...prev }));
    }
  }, [selectedTemplate, context]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/ai/templates?department=${department}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/ai/usage');
      const data = await res.json();
      if (data.success) {
        setUsage({
          current: data.currentMonth.requests,
          limit: data.limit,
          percentage: data.percentage,
          remaining: data.remaining
        });
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const body: any = {
        department
      };

      if (mode === 'template' && selectedTemplate) {
        body.templateId = selectedTemplate.id;
        body.variables = variables;
      } else {
        body.prompt = customPrompt;
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.content);
        if (data.remaining) {
          setUsage(prev => prev ? {
            ...prev,
            current: prev.limit - data.remaining.requests,
            remaining: data.remaining.requests,
            percentage: data.remaining.percentage
          } : null);
        }
      } else {
        setError(data.error || 'Failed to generate response');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const selectTemplate = (template: AiTemplate) => {
    setSelectedTemplate(template);
    setVariables({});
    setResponse('');
    setError('');
    setShowTemplates(false);
  };

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, AiTemplate[]>);

  if (!isOpen) return null;

  const panelClasses = {
    right: 'fixed right-0 top-0 h-full w-96 shadow-2xl',
    bottom: 'fixed bottom-0 left-0 right-0 h-96 shadow-2xl',
    modal: 'fixed inset-4 md:inset-10 rounded-xl shadow-2xl'
  };

  return (
    <div className={`${panelClasses[position]} bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center gap-2 text-white">
          <Star className="h-5 w-5" />
          <span className="font-semibold">Denuel AI</span>
          {usage && usage.limit !== -1 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {usage.remaining} left
            </span>
          )}
        </div>
        {onClose && (
          <button 
            type="button"
            title="Close panel"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Usage Bar */}
      {usage && usage.limit !== -1 && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>AI Requests</span>
            <span>{usage.current} / {usage.limit}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                usage.percentage >= 90 ? 'bg-red-500' :
                usage.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex p-2 gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setMode('template')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'template' 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'custom'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'template' ? (
          <>
            {/* Template Selection */}
            {showTemplates ? (
              <div className="p-4 space-y-4">
                {Object.entries(templatesByCategory).map(([category, catTemplates]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {catTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => selectTemplate(template)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {template.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Variable Form */
              <div className="p-4">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 mb-4 hover:underline"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back to templates
                </button>

                {selectedTemplate && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTemplate.description}
                    </p>
                  </div>
                )}

                {/* Variable Inputs */}
                <div className="space-y-3">
                  {(selectedTemplate?.variablesJson || []).map(varName => (
                    <div key={varName}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {varName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </label>
                      <textarea
                        value={variables[varName] || ''}
                        onChange={(e) => setVariables(prev => ({ 
                          ...prev, 
                          [varName]: e.target.value 
                        }))}
                        placeholder={`Enter ${varName}...`}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Custom Prompt */
          <div className="p-4">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Type your prompt here..."
              className="w-full h-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="m-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                AI Response
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleGenerate}
          disabled={isLoading || (mode === 'template' && !selectedTemplate) || (mode === 'custom' && !customPrompt.trim())}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Star className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
