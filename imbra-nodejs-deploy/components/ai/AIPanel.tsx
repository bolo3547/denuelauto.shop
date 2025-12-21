'use client';

import React, { useState, useRef } from 'react';
import { 
  FaRobot, 
  FaTimes, 
  FaPaperPlane, 
  FaHistory, 
  FaLightbulb,
  FaMagic,
  FaSpinner,
  FaChevronDown,
  FaCopy,
  FaCheck,
  FaLock,
  FaArrowUp,
} from 'react-icons/fa';
import { DepartmentPortal } from '@/lib/subscription/pricing-tiers';
import { useAIAssistant, AIResponse } from '@/lib/ai/use-ai-assistant';
import { QuickAction } from '@/lib/subscription/ai-capabilities';

// =============================================================================
// TYPES
// =============================================================================

interface AIPanelProps {
  department: DepartmentPortal;
  tenantId: string;
  className?: string;
  defaultOpen?: boolean;
  position?: 'right' | 'bottom';
  contextData?: Record<string, string | number | boolean>;
  selectedText?: string;
  onSelectText?: (text: string) => void;
}

// =============================================================================
// AI PANEL COMPONENT
// =============================================================================

export function AIPanel({
  department,
  tenantId,
  className = '',
  defaultOpen = false,
  position = 'right',
  contextData = {},
  selectedText,
  onSelectText,
}: AIPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showHistory, setShowHistory] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const ai = useAIAssistant(department, tenantId);

  // Handle quick action click
  const handleQuickAction = async (action: QuickAction) => {
    await ai.executeQuickAction(action.id, {
      ...contextData,
      selected_text: selectedText || '',
    });
  };

  // Handle custom prompt submit
  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;

    // Use the first available prompt or create ad-hoc
    const defaultPromptId = ai.config.prompts[0]?.id;
    if (defaultPromptId) {
      await ai.executePrompt({
        promptId: defaultPromptId,
        context: {
          ...contextData,
          custom_query: customPrompt,
          selected_text: selectedText || '',
        },
      });
    }
    setCustomPrompt('');
  };

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use suggestion (callback to parent)
  const handleUseSuggestion = (text: string) => {
    if (onSelectText) {
      onSelectText(text);
    }
  };

  if (!ai.isEnabled) {
    return (
      <LockedAIPanel 
        department={department}
        upgradeMessage={ai.upgradeRequired || 'AI is not available'}
        position={position}
        className={className}
      />
    );
  }

  return (
    <div
      className={`
        ai-panel fixed z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl 
        border border-gray-200/50 dark:border-gray-700/50 rounded-2xl
        transition-all duration-500 ease-out
        ${position === 'right' 
          ? 'top-20 right-4 w-[420px] max-h-[calc(100vh-6rem)]' 
          : 'bottom-4 left-1/2 -translate-x-1/2 w-[600px] max-h-96'
        }
        ${isOpen 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
        }
        ${className}
      `}
    >
      {/* Header with animated gradient */}
      <div className="ai-panel-header flex items-center justify-between p-4 border-b border-white/10 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm animate-pulse-glow">
            <FaRobot className="text-xl animate-bounce-subtle" />
          </div>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">{ai.config.name}</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Ready to assist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="Show history"
            aria-label="Show history"
          >
            <FaHistory className="transition-transform hover:scale-110" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col h-[calc(100%-4rem)] max-h-[500px]">
        {showHistory ? (
          /* History View */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Recent Responses</h4>
              <button
                onClick={() => ai.clearHistory()}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            {ai.history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No history yet</p>
            ) : (
              ai.history.map((item) => (
                <HistoryItem 
                  key={item.id} 
                  item={item} 
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))
            )}
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500 animate-pulse" />
                Quick Actions
              </h4>
              <div className="flex flex-wrap gap-2 stagger-children">
                {ai.config.quickActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    disabled={ai.loading || (action.requiresSelection && !selectedText)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="ai-quick-action px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-700 dark:hover:text-purple-400 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-2 font-medium"
                    title={action.requiresSelection && !selectedText ? 'Select text first' : ''}
                  >
                    <span className="text-base">{action.icon || '✨'}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Text Preview */}
            {selectedText && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800/50 animate-fade-in-down">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Selected Text
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                  "{selectedText}"
                </p>
              </div>
            )}

            {/* Response Area */}
            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
              {ai.loading ? (
                <div className="flex flex-col items-center justify-center py-12 animate-fade-in-scale">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <FaSpinner className="text-3xl animate-spin text-purple-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">Analyzing<span className="ai-thinking" /></p>
                  <p className="text-xs text-gray-400 mt-1">This usually takes a few seconds</p>
                </div>
              ) : ai.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{ai.error}</p>
                  <button
                    onClick={() => ai.clearError()}
                    className="text-xs text-red-500 hover:underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              ) : ai.response ? (
                <ResponseCard 
                  response={ai.response}
                  onCopy={handleCopy}
                  onUse={handleUseSuggestion}
                  copiedId={copiedId}
                />
              ) : (
                <div className="text-center py-10 animate-fade-in-up">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                    <FaMagic className="text-4xl text-purple-400 animate-float" />
                  </div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">How can I help you today?</p>
                  <p className="text-sm mt-2 text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                    Select a quick action above or type your question below
                  </p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCustomPrompt();
                      }
                    }}
                    placeholder="Ask Denuel AI anything..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all duration-200"
                    rows={2}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    Press Enter to send
                  </span>
                </div>
                <button
                  onClick={handleCustomPrompt}
                  disabled={ai.loading || !customPrompt.trim()}
                  className="upgrade-button p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:shadow-none"
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            ai-fab fixed z-50 w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-600 to-blue-600 text-white rounded-2xl 
            shadow-xl shadow-purple-500/30 flex items-center justify-center group
            hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300
            ${position === 'right' ? 'bottom-6 right-6' : 'bottom-6 right-6'}
          `}
        >
          <FaRobot className="text-2xl group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ResponseCard({
  response,
  onCopy,
  onUse,
  copiedId,
}: {
  response: AIResponse;
  onCopy: (text: string, id: string) => void;
  onUse: (text: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="ai-response-card bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden animate-fade-in-up">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">
            ✨
          </span>
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            AI Response
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {response.tokensUsed} tokens • {response.processingTime}ms
          </span>
          <span className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <FaChevronDown className="text-gray-400" />
          </span>
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4">
          <div className="bg-white dark:bg-gray-800/80 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap shadow-inner leading-relaxed">
            {response.content}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onCopy(response.content, response.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 font-medium"
            >
              {copiedId === response.id ? <FaCheck className="text-green-500" /> : <FaCopy className="text-gray-400" />}
              {copiedId === response.id ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => onUse(response.content)}
              className="upgrade-button flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md shadow-purple-500/20"
            >
              <FaCheck />
              Use This
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({
  item,
  onCopy,
  copiedId,
}: {
  item: AIResponse;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const timestamp = new Date(item.timestamp).toLocaleTimeString();

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 pr-4">
          {item.content.slice(0, 50)}...
        </span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{timestamp}</span>
          <span className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <FaChevronDown className="text-gray-400 text-xs" />
          </span>
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[300px]' : 'max-h-0'}`}>
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {item.content}
          </p>
          <button
            onClick={() => onCopy(item.content, item.id)}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {copiedId === item.id ? <FaCheck className="text-green-500" /> : <FaCopy />}
            {copiedId === item.id ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LockedAIPanel({
  department,
  upgradeMessage,
  position,
  className,
}: {
  department: DepartmentPortal;
  upgradeMessage: string;
  position: 'right' | 'bottom';
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className={`
            fixed z-40 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 
            rounded-lg w-80
            ${position === 'right' ? 'top-20 right-4' : 'bottom-4 right-4'}
            ${className}
          `}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-2xl text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              AI Assistant Locked
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {upgradeMessage}
            </p>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <FaArrowUp />
              Upgrade Now
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed z-50 w-14 h-14 bg-gray-400 text-white rounded-full shadow-lg 
          flex items-center justify-center cursor-pointer
          ${position === 'right' ? 'bottom-6 right-6' : 'bottom-6 right-6'}
        `}
        title="AI Assistant (Locked)"
      >
        <div className="relative">
          <FaRobot className="text-2xl opacity-50" />
          <FaLock className="absolute -bottom-1 -right-1 text-xs" />
        </div>
      </button>
    </>
  );
}

// =============================================================================
// TOGGLE BUTTON COMPONENT (for use in layouts)
// =============================================================================

export function AIToggleButton({
  onClick,
  isEnabled,
  className = '',
}: {
  onClick: () => void;
  isEnabled: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-lg transition-all
        ${isEnabled 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
        }
        ${className}
      `}
      title={isEnabled ? 'Open AI Assistant' : 'AI Assistant (Upgrade Required)'}
    >
      <FaRobot className="text-xl" />
      {!isEnabled && (
        <FaLock className="absolute -top-1 -right-1 text-xs text-gray-500" />
      )}
    </button>
  );
}

export default AIPanel;
