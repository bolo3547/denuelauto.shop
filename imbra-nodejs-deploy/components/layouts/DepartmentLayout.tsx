'use client';

/**
 * Department Portal Layout with AI Assistant
 * 
 * This is an example layout component that can be used for any department portal.
 * It includes:
 * - Subscription-based portal access check
 * - AI Assistant panel integration
 * - Locked portal UI for upgrades
 */

import React, { useState, ReactNode } from 'react';
import { 
  useSubscription, 
  usePortalAccess, 
  useAIAccess,
  DepartmentPortal,
} from '@/lib/subscription';
import { AIPanel, AIToggleButton } from '@/components/ai';
import { 
  LockedPortalCard, 
  PlanComparisonModal,
} from '@/components/subscription';
import { FaLock } from 'react-icons/fa';

// =============================================================================
// TYPES
// =============================================================================

interface DepartmentLayoutProps {
  department: DepartmentPortal;
  children: ReactNode;
  title?: string;
  showAIPanel?: boolean;
  contextData?: Record<string, any>;
  selectedText?: string;
  onSelectText?: (text: string) => void;
}

// =============================================================================
// DEPARTMENT LAYOUT COMPONENT
// =============================================================================

export function DepartmentLayout({
  department,
  children,
  title,
  showAIPanel = true,
  contextData = {},
  selectedText,
  onSelectText,
}: DepartmentLayoutProps) {
  const { subscription, loading: subLoading } = useSubscription();
  const portalAccess = usePortalAccess(department);
  const aiAccess = useAIAccess(department);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Simple portal name from department
  const portalName = department.charAt(0).toUpperCase() + department.slice(1);

  // Loading state
  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Portal locked - show upgrade prompt
  if (!portalAccess.allowed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-3xl text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {portalName} Portal Locked
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {portalAccess.reason || `Upgrade to access the ${portalName} portal`}
            </p>
          </div>
          
          <LockedPortalCard
            portal={department}
            currentTier={subscription?.planType || 'starter'}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Want to see what you're missing?
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Compare all plans →
            </button>
          </div>
        </div>

        <PlanComparisonModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={subscription?.planType || 'starter'}
          onSelectPlan={(tier) => {
            // Handle plan selection - redirect to checkout
            window.location.href = `/checkout?plan=${tier}`;
          }}
        />
      </div>
    );
  }

  // Portal accessible - render content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title || portalName}
              </h1>
              <p className="text-sm text-gray-500">{department} portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Toggle Button */}
            {showAIPanel && (
              <AIToggleButton
                onClick={() => setShowAI(!showAI)}
                isEnabled={aiAccess.allowed}
              />
            )}
            
            {/* Upgrade Nudge (if near limits or AI locked) */}
            {!aiAccess.allowed && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Unlock AI →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>

      {/* AI Panel */}
      {showAIPanel && (
        <AIPanel
          department={department}
          tenantId={subscription?.tenantId || ''}
          defaultOpen={showAI}
          position="right"
          contextData={{
            ...contextData,
            page: portalName,
            currentPlan: subscription?.planType || 'starter',
          }}
          selectedText={selectedText}
          onSelectText={onSelectText}
        />
      )}

      {/* Upgrade Modal */}
      <PlanComparisonModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={subscription?.planType || 'starter'}
        onSelectPlan={(tier) => {
          window.location.href = `/checkout?plan=${tier}`;
        }}
      />
    </div>
  );
}

// =============================================================================
// PRE-BUILT PORTAL LAYOUTS
// =============================================================================

export function AdminPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="admin" {...props}>{children}</DepartmentLayout>;
}

export function SalesPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="sales" {...props}>{children}</DepartmentLayout>;
}

export function AgentPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="agent" {...props}>{children}</DepartmentLayout>;
}

export function AccountantPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="accountant" {...props}>{children}</DepartmentLayout>;
}

export function HRPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="hr" {...props}>{children}</DepartmentLayout>;
}

export function DesignPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="graphic_design" {...props}>{children}</DepartmentLayout>;
}

export function OperationsPortalLayout({ children, ...props }: Omit<DepartmentLayoutProps, 'department'>) {
  return <DepartmentLayout department="zr_operations" {...props}>{children}</DepartmentLayout>;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default DepartmentLayout;
