'use client';

/**
 * AI Upgrade Modal
 * Shown when user hits AI limit or tries to use AI on Starter plan
 */

import React from 'react';
import { X, Star, Zap, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AiUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  currentPlan: string;
  reason: 'limit-reached' | 'plan-upgrade' | 'feature-locked';
}

const creditPackages = [
  {
    id: 'SMALL',
    name: '+200 Requests',
    price: 'K150',
    priceNote: 'One-time',
    features: ['200 AI requests', 'Valid until month end', 'All templates']
  },
  {
    id: 'LARGE',
    name: '+1,000 Requests',
    price: 'K600',
    priceNote: 'One-time',
    features: ['1,000 AI requests', 'Valid until month end', 'All templates', 'Better value']
  }
];

const planUpgrades = [
  {
    name: 'Growth',
    price: 'K499',
    period: '/month',
    aiLimit: '200 AI requests/month',
    highlight: false
  },
  {
    name: 'Pro',
    price: 'K999',
    period: '/month',
    aiLimit: '1,000 AI requests/month',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    aiLimit: 'Unlimited AI requests',
    highlight: false
  }
];

export default function AiUpgradeModal({
  isOpen,
  onClose,
  tenantSlug,
  currentPlan,
  reason
}: AiUpgradeModalProps) {
  if (!isOpen) return null;

  const showCredits = reason === 'limit-reached' && currentPlan !== 'STARTER';
  const showPlans = reason === 'plan-upgrade' || currentPlan === 'STARTER';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {reason === 'limit-reached' ? 'Get More AI Power' : 'Unlock Denuel AI'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reason === 'limit-reached' 
                    ? 'Your monthly AI requests are exhausted'
                    : 'Upgrade to access AI-powered features'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Credit Packages - for users who hit limit */}
          {showCredits && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Buy Additional Credits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {creditPackages.map(pkg => (
                  <div 
                    key={pkg.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-colors"
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pkg.name}
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-purple-600">{pkg.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                        {pkg.priceNote}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/t/${tenantSlug}/admin/billing?purchase=${pkg.id}`}
                      className="mt-4 block w-full py-2 px-4 bg-purple-600 text-white text-center rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Purchase
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan Upgrades */}
          {showPlans && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {showCredits ? 'Or Upgrade Your Plan' : 'Choose a Plan with AI'}
              </h3>
              <div className="space-y-3">
                {planUpgrades.map(plan => (
                  <div 
                    key={plan.name}
                    className={`border rounded-xl p-4 flex items-center justify-between ${
                      plan.highlight 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </span>
                        {plan.highlight && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.aiLimit}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {plan.period}
                        </span>
                      </div>
                      <Link
                        href={`/t/${tenantSlug}/admin/billing?upgrade=${plan.name.toLowerCase()}`}
                        className="py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        Upgrade <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              What you can do with Denuel AI:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Generate sales replies
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Weekly business summaries
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                SEO car descriptions
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Customer follow-ups
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Financial insights
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                70+ department templates
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
