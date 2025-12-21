'use client';

import React from 'react';
import { 
  FaLock, 
  FaArrowUp, 
  FaCheck,
  FaCrown,
  FaStar,
} from 'react-icons/fa';
import { DepartmentPortal, getPortalConfig, PlanTier } from '@/lib/subscription/pricing-tiers';

// =============================================================================
// TYPES
// =============================================================================

interface LockedPortalCardProps {
  portal: DepartmentPortal;
  currentTier?: PlanTier;
  onUpgrade: () => void;
  className?: string;
}

interface PortalGridProps {
  portals: DepartmentPortal[];
  currentTier?: PlanTier;
  unlockedPortals: DepartmentPortal[];
  onPortalClick: (portal: DepartmentPortal) => void;
  onUpgrade: () => void;
  className?: string;
}

interface UpgradeBannerProps {
  currentTier?: PlanTier;
  suggestedTier: PlanTier;
  feature: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  className?: string;
}

// =============================================================================
// LOCKED PORTAL CARD
// =============================================================================

export function LockedPortalCard({
  portal,
  onUpgrade,
  className = '',
}: LockedPortalCardProps) {
  const config = getPortalConfig(portal);
  const requiredTier = config.requiredTier;

  const tierLabels: Record<PlanTier, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  const tierColors: Record<PlanTier, string> = {
    starter: 'bg-gray-500',
    growth: 'bg-blue-500',
    pro: 'bg-purple-500',
    enterprise: 'bg-gradient-to-r from-amber-500 to-orange-500',
  };

  return (
    <div className={`locked-portal relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden ${className}`}>
      {/* Lock Overlay */}
      <div className="locked-overlay absolute inset-0 bg-gradient-to-br from-gray-100/90 to-gray-200/90 dark:from-gray-800/90 dark:to-gray-900/90 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md">
        <div className="lock-icon w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
          <FaLock className="text-3xl text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-3 text-center px-4 font-medium">
          Unlock {config.name} with
        </p>
        <span className={`px-4 py-1.5 ${tierColors[requiredTier]} text-white text-sm font-semibold rounded-full mb-5 shadow-lg`}>
          {tierLabels[requiredTier]} Plan
        </span>
        <button
          onClick={onUpgrade}
          className="upgrade-button px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30"
        >
          <FaArrowUp className="animate-bounce" />
          Upgrade to Unlock
        </button>
      </div>

      {/* Underlying Card (blurred) */}
      <div className="opacity-20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-3xl">
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{config.name}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PORTAL GRID
// =============================================================================

export function PortalGrid({
  portals,
  unlockedPortals,
  onPortalClick,
  onUpgrade,
  className = '',
}: PortalGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children ${className}`}>
      {portals.map((portal) => {
        const isUnlocked = unlockedPortals.includes(portal);
        const config = getPortalConfig(portal);

        if (!isUnlocked) {
          return (
            <LockedPortalCard
              key={portal}
              portal={portal}
              onUpgrade={onUpgrade}
            />
          );
        }

        return (
          <button
            key={portal}
            onClick={() => onPortalClick(portal)}
            className="portal-card relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-2xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="portal-icon w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-xl flex items-center justify-center text-3xl shadow-sm">
                {config.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {config.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active
              </span>
            </div>
            {/* Hover shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// UPGRADE BANNER
// =============================================================================

export function UpgradeBanner({
  suggestedTier,
  feature,
  onUpgrade,
  onDismiss,
  className = '',
}: UpgradeBannerProps) {
  const tierLabels: Record<PlanTier, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  return (
    <div className={`animate-fade-in-down relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-2xl p-5 shadow-xl shadow-purple-500/20 ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-blue-600/50 to-cyan-500/50 animate-gradient" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      
      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <FaCrown className="text-3xl text-yellow-300 animate-bounce-subtle" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Upgrade to {tierLabels[suggestedTier]}</h3>
            <p className="text-sm text-white/90">
              Unlock {feature} and supercharge your dealership
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 text-white/80 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded-xl"
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="upgrade-button px-6 py-2.5 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            <FaArrowUp />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PLAN COMPARISON MODAL
// =============================================================================

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PlanTier;
  onSelectPlan: (tier: PlanTier) => void;
}

export function PlanComparisonModal({
  isOpen,
  onClose,
  currentTier,
  onSelectPlan,
}: PlanComparisonModalProps) {
  if (!isOpen) return null;

  const plans: Array<{
    tier: PlanTier;
    name: string;
    price: string;
    period: string;
    features: string[];
    highlight?: boolean;
  }> = [
    {
      tier: 'starter',
      name: 'Starter',
      price: 'ZMW 499',
      period: '/month',
      features: [
        'Admin Portal',
        'Up to 50 cars',
        '3 staff members',
        '1 branch',
        'Email support',
      ],
    },
    {
      tier: 'growth',
      name: 'Growth',
      price: 'ZMW 999',
      period: '/month',
      features: [
        'Everything in Starter',
        'Sales & Agent Portals',
        'Up to 200 cars',
        '10 staff members',
        '3 branches',
        'AI assistance (basic)',
        'Priority support',
      ],
      highlight: true,
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: 'ZMW 1,999',
      period: '/month',
      features: [
        'Everything in Growth',
        'All 7 Portals',
        'Unlimited cars',
        '50 staff members',
        '10 branches',
        'Full AI assistance',
        'Custom branding',
        'API access',
      ],
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      price: 'ZMW 3,999+',
      period: '/month',
      features: [
        'Everything in Pro',
        'Custom portals',
        'Unlimited everything',
        'Dedicated support',
        'SLA guarantee',
        'White-label option',
        'Custom integrations',
        'On-premise option',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />
      
      {/* Modal */}
      <div className="modal-content relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 z-10 p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Unlock more features and scale your dealership ✨
              </p>
            </div>
            <button
              onClick={onClose}
              className="modal-close w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {plans.map((plan, index) => (
            <div
              key={plan.tier}
              className={`
                pricing-card group relative rounded-2xl border-2 p-6 transition-all duration-300
                hover:shadow-xl hover:-translate-y-1
                ${plan.highlight 
                  ? 'pricing-card-popular border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-900 scale-[1.02]' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${currentTier === plan.tier ? 'ring-2 ring-green-500 ring-offset-2' : ''}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Highlight gradient overlay */}
              {plan.highlight && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none" />
              )}
              
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg animate-pulse-subtle">
                  ⭐ Most Popular
                </div>
              )}
              {currentTier === plan.tier && (
                <div className="absolute -top-3.5 right-4 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg">
                  <FaCheck className="text-[10px]" /> Current
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6 stagger-children">
                {plan.features.map((feature, i) => (
                  <li key={i} className="pricing-feature flex items-start gap-2.5 text-sm" style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlight ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-green-100 dark:bg-green-900/50'
                    }`}>
                      <FaCheck className={`text-[10px] ${plan.highlight ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(plan.tier)}
                disabled={currentTier === plan.tier}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all duration-300 transform
                  ${currentTier === plan.tier
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : plan.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-[1.02]'
                  }
                `}
              >
                {currentTier === plan.tier ? '✓ Current Plan' : 'Select Plan →'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// USAGE METER COMPONENT
// =============================================================================

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
  className?: string;
}

export function UsageMeter({
  label,
  current,
  max,
  unit = '',
  showUpgrade = true,
  onUpgrade,
  className = '',
}: UsageMeterProps) {
  const percentage = max === -1 ? 0 : Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {label}
        </span>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
          isAtLimit 
            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' 
            : isNearLimit 
              ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' 
              : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
        }`}>
          {max === -1 ? (
            <span className="flex items-center gap-1.5">
              <FaStar className="text-amber-500 animate-pulse" />
              Unlimited
            </span>
          ) : (
            `${current.toLocaleString()} / ${max.toLocaleString()} ${unit}`
          )}
        </span>
      </div>

      {max !== -1 && (
        <>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
            {/* Animated background shimmer */}
            <div className="absolute inset-0 shimmer-subtle opacity-50" />
            
            {/* Progress bar */}
            <div
              className={`usage-meter-fill h-full rounded-full transition-all duration-700 ease-out relative ${
                isAtLimit 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : isNearLimit 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                    : 'bg-gradient-to-r from-green-400 to-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            >
              {/* Shine effect on progress */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>

          {/* Percentage indicator */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              {percentage.toFixed(0)}% used
            </span>
            {!isAtLimit && max !== -1 && (
              <span className="text-gray-500 dark:text-gray-400">
                {(max - current).toLocaleString()} {unit} remaining
              </span>
            )}
          </div>

          {isNearLimit && showUpgrade && onUpgrade && (
            <button
              onClick={onUpgrade}
              className={`
                mt-4 w-full py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300
                ${isAtLimit 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25' 
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25'
                }
              `}
            >
              <FaArrowUp className="animate-bounce" />
              {isAtLimit ? '⚠️ Limit reached — Upgrade now' : 'Running low? Upgrade now'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  LockedPortalCard,
  PortalGrid,
  UpgradeBanner,
  PlanComparisonModal,
  UsageMeter,
};
