'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaCrown, 
  FaChartLine, 
  FaRobot, 
  FaUsers, 
  FaCar, 
  FaBuilding,
  FaCog,
  FaArrowUp,
  FaCheck,
  FaCalendar,
  FaDollarSign,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { 
  PlanTier, 
  DepartmentPortal, 
  PRICING_TIERS,
  getPortalConfig,
  getTierPeriod,
} from '@/lib/subscription/pricing-tiers';
import { UsageMeter, PlanComparisonModal } from './LockedPortalUI';

// =============================================================================
// TYPES
// =============================================================================

interface SubscriptionDashboardProps {
  tenantId: string;
  currentTier: PlanTier;
  subscription: {
    planType: PlanTier;
    status: 'active' | 'past_due' | 'cancelled' | 'trialing';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    cars: number;
    staff: number;
    branches: number;
    aiRequestsThisMonth: number;
  };
  activePortals: DepartmentPortal[];
  aiEnabledPortals: DepartmentPortal[];
  onUpgrade: (tier: PlanTier) => void;
  onManageSubscription: () => void;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UsageHistoryItem {
  date: string;
  aiRequests: number;
  carsAdded: number;
  staffAdded: number;
}

// =============================================================================
// SUBSCRIPTION DASHBOARD
// =============================================================================

export function SubscriptionDashboard({
  tenantId,
  currentTier,
  subscription,
  usage,
  activePortals,
  aiEnabledPortals,
  onUpgrade,
  onManageSubscription,
  className = '',
}: SubscriptionDashboardProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'portals' | 'ai' | 'billing'>('overview');

  const tierConfig = PRICING_TIERS[currentTier];
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const tierLabels: Record<PlanTier, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  const tierColors: Record<PlanTier, string> = {
    starter: 'from-gray-500 to-gray-600',
    growth: 'from-blue-500 to-blue-600',
    pro: 'from-purple-500 to-purple-600',
    enterprise: 'from-amber-500 to-amber-600',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    past_due: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-950 min-h-screen p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Subscription Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your plan, usage, and billing
            </p>
          </div>
          <button
            onClick={() => setShowPlanModal(true)}
            className="upgrade-button px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
          >
            <FaArrowUp className="animate-bounce" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Current Plan Card */}
      <div 
        className={`relative overflow-hidden bg-gradient-to-r ${tierColors[currentTier]} rounded-3xl p-8 text-white mb-8 animate-fade-in-up shadow-2xl`}
        style={{ animationDelay: '0.1s' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <FaCrown className="text-4xl text-yellow-300" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Current Plan</p>
              <h2 className="text-4xl font-extrabold tracking-tight">{tierLabels[currentTier]}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[subscription.status]}`}>
                  {subscription.status.replace('_', ' ').toUpperCase()}
                </span>
                {subscription.cancelAtPeriodEnd && (
                  <span className="text-white/70 text-xs">
                    Cancels at period end
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-extrabold tracking-tight">{tierConfig.price}</p>
            <p className="text-white/70 text-lg">{getTierPeriod(currentTier)}</p>
            <p className="text-sm text-white/60 mt-3 flex items-center gap-2 justify-end bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <FaCalendar />
              Renews in <span className="font-bold text-white">{daysUntilRenewal}</span> days
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'portals', label: 'Portals', icon: FaUsers },
            { id: 'ai', label: 'AI Usage', icon: FaRobot },
            { id: 'billing', label: 'Billing', icon: FaDollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-5 flex items-center gap-2 rounded-t-xl transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm border-t border-x border-gray-200 dark:border-gray-700 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className={activeTab === tab.id ? 'text-purple-500' : ''} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          usage={usage} 
          tierConfig={tierConfig}
          onUpgrade={() => setShowPlanModal(true)}
        />
      )}
      {activeTab === 'portals' && (
        <PortalsTab 
          activePortals={activePortals}
          aiEnabledPortals={aiEnabledPortals}
          currentTier={currentTier}
          onUpgrade={() => setShowPlanModal(true)}
        />
      )}
      {activeTab === 'ai' && (
        <AIUsageTab 
          tenantId={tenantId}
          aiEnabledPortals={aiEnabledPortals}
          currentTier={currentTier}
        />
      )}
      {activeTab === 'billing' && (
        <BillingTab 
          subscription={subscription}
          tierConfig={tierConfig}
          onManageSubscription={onManageSubscription}
        />
      )}

      {/* Plan Comparison Modal */}
      <PlanComparisonModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentTier={currentTier}
        onSelectPlan={onUpgrade}
      />
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function OverviewTab({
  usage,
  tierConfig,
  onUpgrade,
}: {
  usage: SubscriptionDashboardProps['usage'];
  tierConfig: typeof PRICING_TIERS[PlanTier];
  onUpgrade: () => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Resource Usage
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor your plan limits and usage</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <UsageMeter
          label="Car Listings"
          current={usage.cars}
          max={tierConfig.limits.maxCars}
          unit="cars"
          onUpgrade={onUpgrade}
        />
        <UsageMeter
          label="Staff Members"
          current={usage.staff}
          max={tierConfig.limits.maxStaff}
          unit="users"
          onUpgrade={onUpgrade}
        />
        <UsageMeter
          label="Branches"
          current={usage.branches}
          max={tierConfig.limits.maxBranches}
          unit="locations"
          onUpgrade={onUpgrade}
        />
        <UsageMeter
          label="AI Requests (Monthly)"
          current={usage.aiRequestsThisMonth}
          max={tierConfig.limits.aiRequestsPerMonth}
          unit="requests"
          onUpgrade={onUpgrade}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            ⚡
          </span>
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-md">
            <FaCar className="text-blue-500" />
            Add Car
          </button>
          <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-md">
            <FaUsers className="text-green-500" />
            Invite Staff
          </button>
          <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-md">
            <FaBuilding className="text-purple-500" />
            Add Branch
          </button>
        </div>
      </div>
    </div>
  );
}

function PortalsTab({
  activePortals,
  aiEnabledPortals,
  onUpgrade,
}: {
  activePortals: DepartmentPortal[];
  aiEnabledPortals: DepartmentPortal[];
  currentTier?: PlanTier;
  onUpgrade: () => void;
}) {
  const allPortals: DepartmentPortal[] = [
    'admin', 'sales', 'agent', 'accountant', 'hr', 'graphic_design', 'zr_operations', 'custom'
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Department Portals
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage access to specialized department tools</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <span className="text-purple-700 dark:text-purple-400 font-bold text-lg">{activePortals.length}</span>
          <span className="text-purple-600 dark:text-purple-400 text-sm">of {allPortals.length} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {allPortals.map((portal, index) => {
          const config = getPortalConfig(portal);
          const isActive = activePortals.includes(portal);
          const hasAI = aiEnabledPortals.includes(portal);

          return (
            <div
              key={portal}
              className={`
                portal-card group rounded-2xl border-2 p-5 transition-all duration-300
                ${isActive 
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-800/50 border-dashed border-gray-300 dark:border-gray-600 opacity-70 hover:opacity-100'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`text-3xl transition-transform duration-300 ${isActive ? 'group-hover:scale-110 group-hover:rotate-6' : 'grayscale'}`}>
                  {config.icon}
                </div>
                <div className="flex gap-1.5">
                  {isActive ? (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <FaCheck className="text-[10px]" /> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
                      🔒 Locked
                    </span>
                  )}
                  {hasAI && (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <FaRobot className="text-[10px]" /> AI
                    </span>
                  )}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                {config.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {config.description}
              </p>
              {!isActive && (
                <button
                  onClick={onUpgrade}
                  className="mt-4 w-full py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-purple-200 dark:border-purple-800"
                >
                  <FaArrowUp className="text-xs" />
                  Upgrade to unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIUsageTab({
  tenantId,
  aiEnabledPortals,
}: {
  tenantId: string;
  aiEnabledPortals: DepartmentPortal[];
  currentTier?: PlanTier;
}) {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    byDepartment: {} as Record<string, number>,
    averageProcessingTime: 0,
  });

  // In production, fetch from audit logger
  useEffect(() => {
    // Mock data for demo
    setStats({
      totalRequests: 156,
      totalTokens: 45230,
      byDepartment: {
        admin: 45,
        sales: 78,
        agent: 33,
      },
      averageProcessingTime: 1.2,
    });
  }, [tenantId]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          AI Assistant Usage
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Track your AI-powered assistance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
        <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Requests (30d)</p>
            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
              📊
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalRequests}</p>
        </div>
        <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Tokens Used</p>
            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
              🔤
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalTokens.toLocaleString()}</p>
        </div>
        <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Avg Response Time</p>
            <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
              ⚡
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.averageProcessingTime}s</p>
        </div>
        <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">AI-Enabled Portals</p>
            <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
              <FaRobot />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{aiEnabledPortals.length}</p>
        </div>
      </div>

      {/* Usage by Department */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
            📈
          </span>
          Usage by Department
        </h4>
        <div className="space-y-4">
          {Object.entries(stats.byDepartment).map(([dept, count], index) => (
            <div key={dept} className="flex items-center gap-4 group" style={{ animationDelay: `${index * 0.1}s` }}>
              <span className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {dept}
              </span>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${(count / stats.totalRequests) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
              <span className="w-14 text-sm font-bold text-gray-900 dark:text-white text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingTab({
  subscription,
  tierConfig,
  onManageSubscription,
}: {
  subscription: SubscriptionDashboardProps['subscription'];
  tierConfig: typeof PRICING_TIERS[PlanTier];
  onManageSubscription: () => void;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Billing Information
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your payment and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Billing */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              💳
            </span>
            Current Billing Cycle
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                ZMW {tierConfig.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">/month</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Next billing date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Payment method</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded">VISA</span>
                •••• 4242
              </span>
            </div>
          </div>
          <button
            onClick={onManageSubscription}
            className="mt-6 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <FaCog className="text-purple-500" />
            Manage Subscription
          </button>
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              📄
            </span>
            Recent Invoices
          </h4>
          <div className="space-y-2">
            {[
              { date: '2024-01-01', amount: tierConfig.price, status: 'paid' },
              { date: '2023-12-01', amount: tierConfig.price, status: 'paid' },
              { date: '2023-11-01', amount: tierConfig.price, status: 'paid' },
            ].map((invoice, i) => (
              <div key={i} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {invoice.amount}
                  </p>
                  <p className="text-xs text-gray-500">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <FaCheck className="text-[10px]" /> Paid
                  </span>
                  <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Download ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Subscription */}
      {!subscription.cancelAtPeriodEnd && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <FaExclamationTriangle className="text-red-500 text-xl mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-400">
                Cancel Subscription
              </h4>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                You can cancel your subscription at any time. Your access will continue until the end of the current billing period.
              </p>
              <button className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SubscriptionDashboard;
