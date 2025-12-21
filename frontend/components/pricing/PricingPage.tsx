'use client';

/**
 * Pricing Page Component
 * Shows subscription plans with AI features highlighted
 */

import React, { useState } from 'react';
import { 
  Check, X, Star, Zap, Shield, Users, Car, 
  BarChart3, MessageSquare, Building2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface PricingPageProps {
  tenantSlug?: string;
  currentPlan?: string;
  isPublic?: boolean;
}

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    description: 'Get started with basic car listing features',
    price: { monthly: 0, yearly: 0 },
    currency: 'K',
    highlight: false,
    cta: 'Start Free',
    features: {
      cars: '10 car listings',
      users: '1 user',
      leads: 'Basic lead capture',
      storage: '500MB storage',
      support: 'Email support',
      ai: null, // No AI
      analytics: 'Basic analytics',
      domains: 'Subdomain only',
      branding: 'Denuel branding',
      api: null
    },
    aiDetails: {
      enabled: false,
      requests: 0,
      note: 'AI features not included'
    }
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    description: 'Perfect for growing dealerships',
    price: { monthly: 499, yearly: 4990 },
    currency: 'K',
    highlight: false,
    cta: 'Start Growth',
    features: {
      cars: '100 car listings',
      users: '5 users',
      leads: 'Advanced lead management',
      storage: '5GB storage',
      support: 'Priority support',
      ai: '200 AI requests/month',
      analytics: 'Advanced analytics',
      domains: 'Custom domain',
      branding: 'Remove branding',
      api: 'API access'
    },
    aiDetails: {
      enabled: true,
      requests: 200,
      note: 'Basic AI templates'
    }
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'For professional dealerships',
    price: { monthly: 999, yearly: 9990 },
    currency: 'K',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Pro',
    features: {
      cars: '500 car listings',
      users: '20 users',
      leads: 'CRM integration',
      storage: '25GB storage',
      support: '24/7 phone support',
      ai: '1,000 AI requests/month',
      analytics: 'Custom reports',
      domains: 'Multiple domains',
      branding: 'White label',
      api: 'Full API + webhooks'
    },
    aiDetails: {
      enabled: true,
      requests: 1000,
      note: 'All AI templates + custom'
    }
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Custom solutions for large operations',
    price: { monthly: null, yearly: null },
    priceLabel: 'Custom',
    currency: 'K',
    highlight: false,
    cta: 'Contact Sales',
    features: {
      cars: 'Unlimited listings',
      users: 'Unlimited users',
      leads: 'Enterprise CRM',
      storage: 'Unlimited storage',
      support: 'Dedicated account manager',
      ai: 'Unlimited AI requests',
      analytics: 'BI integration',
      domains: 'Unlimited domains',
      branding: 'Full customization',
      api: 'Dedicated API'
    },
    aiDetails: {
      enabled: true,
      requests: -1,
      note: 'Unlimited AI + priority'
    }
  }
];

const aiCredits = [
  {
    id: 'SMALL',
    name: '200 AI Credits',
    price: 150,
    currency: 'K',
    description: 'Add 200 extra AI requests',
    perRequest: '0.75'
  },
  {
    id: 'LARGE',
    name: '1,000 AI Credits',
    price: 600,
    currency: 'K',
    description: 'Add 1,000 extra AI requests',
    perRequest: '0.60',
    badge: 'Best Value'
  }
];

const aiFeatures = [
  { 
    icon: MessageSquare, 
    title: 'Smart Reply Generation',
    description: 'AI-powered customer responses that convert'
  },
  { 
    icon: BarChart3, 
    title: 'Business Insights',
    description: 'Weekly summaries and growth recommendations'
  },
  { 
    icon: Car, 
    title: 'SEO Descriptions',
    description: 'Optimized car listings that rank higher'
  },
  { 
    icon: Users, 
    title: 'HR & Team Tools',
    description: 'Performance summaries and onboarding help'
  }
];

export default function PricingPage({ 
  tenantSlug, 
  currentPlan,
  isPublic = false 
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your dealership. All plans include our core features.
            Upgrade anytime as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-green-600 font-medium">(Save 17%)</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden ${
                plan.highlight 
                  ? 'ring-2 ring-purple-600 scale-105 z-10' 
                  : 'border border-gray-200 dark:border-gray-800'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-center text-sm py-1 font-medium">
                  {plan.badge}
                </div>
              )}

              <div className={`p-6 ${plan.badge ? 'pt-10' : ''}`}>
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6">
                  {plan.price.monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.currency}{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.priceLabel}
                    </span>
                  )}
                </div>

                {/* AI Highlight */}
                <div className={`mt-4 p-3 rounded-lg ${
                  plan.aiDetails.enabled 
                    ? 'bg-purple-50 dark:bg-purple-900/20' 
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${
                      plan.aiDetails.enabled ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      plan.aiDetails.enabled 
                        ? 'text-purple-700 dark:text-purple-300' 
                        : 'text-gray-500'
                    }`}>
                      {plan.aiDetails.enabled 
                        ? plan.aiDetails.requests === -1 
                          ? 'Unlimited AI'
                          : `${plan.aiDetails.requests} AI requests/mo`
                        : 'No AI'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {plan.aiDetails.note}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href={isPublic 
                    ? `/signup?plan=${plan.id.toLowerCase()}` 
                    : plan.id === 'ENTERPRISE'
                      ? '/contact-sales'
                      : `/t/${tenantSlug}/admin/billing?upgrade=${plan.id.toLowerCase()}`
                  }
                  className={`mt-6 block w-full py-3 px-4 text-center rounded-lg font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : currentPlan === plan.id
                        ? 'bg-gray-200 text-gray-500 cursor-default dark:bg-gray-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : plan.cta}
                </Link>

                {/* Features List */}
                <ul className="mt-6 space-y-3">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2">
                      {value ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        value 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {value || key}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* AI Credits Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                <Star className="h-5 w-5" />
                <span className="font-medium">Denuel AI</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Need More AI Power?
              </h2>
              <p className="text-purple-100 max-w-2xl mx-auto">
                Running low on AI requests? Purchase additional credits anytime.
                Credits are added to your current month's allowance.
              </p>
            </div>

            {/* Credit Packages */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {aiCredits.map((credit) => (
                <div 
                  key={credit.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative"
                >
                  {credit.badge && (
                    <span className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      {credit.badge}
                    </span>
                  )}
                  <div className="text-2xl font-bold">{credit.name}</div>
                  <div className="text-purple-200 text-sm mt-1">{credit.description}</div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{credit.currency}{credit.price}</span>
                    <span className="text-purple-200 text-sm ml-2">
                      ({credit.currency}{credit.perRequest}/request)
                    </span>
                  </div>
                  <Link
                    href={tenantSlug 
                      ? `/t/${tenantSlug}/admin/billing?purchase=${credit.id.toLowerCase()}`
                      : '/signup'
                    }
                    className="mt-4 block w-full py-2 bg-white text-purple-600 text-center rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    Purchase
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            What's Included with Denuel AI
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <feature.icon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <summary className="p-4 font-medium cursor-pointer text-gray-900 dark:text-white">
                What counts as an AI request?
              </summary>
              <p className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Each time you generate content using Denuel AI (like a customer reply, 
                business summary, or car description), it counts as one AI request. 
                Viewing templates or checking your usage doesn't count.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <summary className="p-4 font-medium cursor-pointer text-gray-900 dark:text-white">
                Do unused AI requests roll over?
              </summary>
              <p className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Monthly plan requests reset each billing cycle. However, purchased 
                credit packs are valid until used - they don't expire at month end.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <summary className="p-4 font-medium cursor-pointer text-gray-900 dark:text-white">
                Can I upgrade or downgrade anytime?
              </summary>
              <p className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Yes! You can upgrade instantly and the difference is pro-rated. 
                Downgrades take effect at the next billing cycle.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <summary className="p-4 font-medium cursor-pointer text-gray-900 dark:text-white">
                Is my data used to train AI models?
              </summary>
              <p className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                No. Your data is never used to train AI models. We use OpenAI's API 
                with data privacy settings enabled. Your business data stays yours.
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions? Need a custom solution?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
