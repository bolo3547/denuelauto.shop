'use client';

/**
 * Example: Sales Portal Dashboard
 * 
 * Demonstrates how to use the enterprise subscription system with:
 * - Department-specific layout
 * - AI Assistant integration
 * - Quick actions for common tasks
 * - Context-aware AI suggestions
 */

import React, { useState } from 'react';
import { SalesPortalLayout } from '@/components/layouts';
import { useSalesAI } from '@/lib/ai';
import type { AIContextValue } from '@/lib/ai/use-ai-assistant';
import { useSubscription, useLimitCheck } from '@/lib/subscription';
import { useParams } from 'next/navigation';
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaCar,
  FaUserCircle,
  FaFireAlt,
  FaSpinner,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';

// =============================================================================
// TYPES
// =============================================================================

interface Lead extends Record<string, AIContextValue> {
  id: string;
  name: string;
  phone: string;
  email: string;
  inquiry: string;
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed';
  score: number;
  createdAt: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Mwanza',
    phone: '+260 97 123 4567',
    email: 'john.mwanza@email.com',
    inquiry: 'Looking for a Toyota Hilux 2019-2022, budget around $25,000',
    status: 'new',
    score: 85,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Mary Banda',
    phone: '+260 96 987 6543',
    email: 'mary.b@company.zm',
    inquiry: 'Need a sedan for company use, Honda or Toyota preferred',
    status: 'contacted',
    score: 72,
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    name: 'Peter Zimba',
    phone: '+260 95 555 1234',
    email: 'pzimba@gmail.com',
    inquiry: 'Interested in the white Land Cruiser on your website',
    status: 'qualified',
    score: 92,
    createdAt: '2024-01-13T09:15:00Z',
  },
];

// =============================================================================
// SALES DASHBOARD COMPONENT
// =============================================================================

export default function SalesDashboardPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [replyDraft, setReplyDraft] = useState('');
  const [copied, setCopied] = useState(false);
  
  const params = useParams();
  const tenantId = (params?.tenantSlug as string) || 'default-tenant';

  const salesAI = useSalesAI(tenantId);
  const { subscription } = useSubscription();
  const carsLimit = useLimitCheck('car');

  // Handle text selection for AI context
  const handleTextSelect = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 5) {
      setSelectedText(selection);
    }
  };

  // Use AI to rewrite a reply
  const handleRewriteReply = async () => {
    if (!replyDraft || !salesAI.isEnabled) return;
    
    const result = await salesAI.rewriteReply(replyDraft, 'professional');
    if (result && typeof result === 'object' && 'content' in result) {
      setReplyDraft((result as { content: string }).content);
    }
  };

  // Use AI to find hot leads
  const handleFindHotLeads = async () => {
    if (!salesAI.isEnabled) return;
    await salesAI.findHotLeads(mockLeads);
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SalesPortalLayout
      title="Sales Dashboard"
      contextData={{
        selectedLead,
        leadsCount: mockLeads.length,
        activeDeals: 5,
      }}
      selectedText={selectedText}
      onSelectText={setSelectedText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" onMouseUp={handleTextSelect}>
        {/* Leads List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Active Leads ({mockLeads.length})
              </h2>
              
              {/* AI Quick Action */}
              {salesAI.isEnabled && (
                <button
                  onClick={handleFindHotLeads}
                  disabled={salesAI.loading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                >
                  {salesAI.loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaFireAlt />
                  )}
                  Find Hot Leads
                </button>
              )}
            </div>

            {/* AI Response Display */}
            {salesAI.response && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                      AI Analysis
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {salesAI.response.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(salesAI.response!.content)}
                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
                  >
                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
              </div>
            )}

            {/* Leads Table */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FaUserCircle className="text-xl text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${lead.score >= 80 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : lead.score >= 60
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }
                          `}>
                            Score: {lead.score}
                          </span>
                          <span className={`
                            px-2 py-0.5 text-xs rounded-full capitalize
                            ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' : ''}
                            ${lead.status === 'contacted' ? 'bg-purple-100 text-purple-700' : ''}
                            ${lead.status === 'qualified' ? 'bg-green-100 text-green-700' : ''}
                            ${lead.status === 'negotiating' ? 'bg-orange-100 text-orange-700' : ''}
                          `}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {lead.inquiry}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaPhone /> {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaEnvelope /> {lead.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Today's Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-xs text-gray-500">New Leads</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                <p className="text-xs text-gray-500">Calls Made</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                <p className="text-xs text-gray-500">Deals Closed</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-600">$45K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </div>

          {/* Reply Composer with AI */}
          {selectedLead && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Reply to {selectedLead.name}
                </h3>
                {salesAI.isEnabled && (
                  <button
                    onClick={handleRewriteReply}
                    disabled={!replyDraft || salesAI.loading}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {salesAI.loading ? <FaSpinner className="animate-spin" /> : '✨'}
                    AI Rewrite
                  </button>
                )}
              </div>
              
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Type your reply..."
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <FaWhatsapp />
                  WhatsApp
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <FaEnvelope />
                  Email
                </button>
              </div>
            </div>
          )}

          {/* Inventory Alert */}
          {carsLimit.usage && carsLimit.usage.limit > 0 && (
            <div className={`p-4 rounded-xl border ${
              (carsLimit.usage.used / carsLimit.usage.limit) >= 0.8
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FaCar className={(carsLimit.usage.used / carsLimit.usage.limit) >= 0.8 ? 'text-amber-600' : 'text-green-600'} />
                <span className="font-medium text-gray-900 dark:text-white">Inventory</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {carsLimit.usage.used} / {carsLimit.usage.limit} cars listed
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${(carsLimit.usage.used / carsLimit.usage.limit) >= 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((carsLimit.usage.used / carsLimit.usage.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </SalesPortalLayout>
  );
}
