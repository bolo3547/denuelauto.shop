// components/SubscriptionAndUsagePage.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { PLAN_LIMITS } from '../lib/dealerConstants';
import { BillingSummary } from '../types/dealer';

interface SubscriptionAndUsagePageProps {
  currentPlan: 'starter' | 'growth' | 'export';
  usage: {
    carsInStock: number;
    branches: number;
    users: number;
    exporterEnabled: boolean;
  };
  billingSummary: BillingSummary;
}

export default function SubscriptionAndUsagePage({ currentPlan, usage, billingSummary }: SubscriptionAndUsagePageProps) {
  const limits = PLAN_LIMITS[currentPlan];

  const getUsagePercentage = (used: number, limit: number) => Math.min((used / limit) * 100, 100);
  const isOverLimit = (used: number, limit: number) => used > limit;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Subscription & Usage</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-medium">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Dealer</p>
            <p className="text-sm text-gray-600">{billingSummary.currency} {billingSummary.total} / month</p>
          </div>
          <button className="px-4 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#0D3A7A] transition">
            Change Plan
          </button>
        </div>
      </div>

      {/* Usage vs Limits */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage vs Limits</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Cars in stock</span>
              <span className={isOverLimit(usage.carsInStock, limits.maxCars) ? 'text-red-600 font-medium' : ''}>
                {usage.carsInStock} / {limits.maxCars}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isOverLimit(usage.carsInStock, limits.maxCars) ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${getUsagePercentage(usage.carsInStock, limits.maxCars)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Branches</span>
              <span className={isOverLimit(usage.branches, limits.maxBranches) ? 'text-red-600 font-medium' : ''}>
                {usage.branches} / {limits.maxBranches}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isOverLimit(usage.branches, limits.maxBranches) ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${getUsagePercentage(usage.branches, limits.maxBranches)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Users</span>
              <span className={isOverLimit(usage.users, limits.maxUsers) ? 'text-red-600 font-medium' : ''}>
                {usage.users} / {limits.maxUsers}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isOverLimit(usage.users, limits.maxUsers) ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${getUsagePercentage(usage.users, limits.maxUsers)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Exporter module</span>
              <span className={usage.exporterEnabled && !limits.exporterIncluded ? 'text-red-600 font-medium' : ''}>
                {usage.exporterEnabled ? (limits.exporterIncluded ? 'Included' : 'Add-on') : 'Not enabled'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${usage.exporterEnabled && !limits.exporterIncluded ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: usage.exporterEnabled ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Breakdown</h2>
        <div className="space-y-2">
          {billingSummary.lines.map((line, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{line.label}</span>
              <span>{billingSummary.currency} {line.amount}</span>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total / month</span>
            <span>{billingSummary.currency} {billingSummary.total}</span>
          </div>
        </div>
      </div>

      {/* Upgrade Suggestions */}
      {(currentPlan === 'starter' && (usage.carsInStock > 50 || usage.exporterEnabled)) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Upgrade Recommendation</h2>
          <p className="text-yellow-700 mb-4">
            We recommend upgrading to Growth or Export plan to accommodate your current usage.
          </p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
            View Upgrade Options
          </button>
        </div>
      )}

      {/* Payment Instructions & Support */}
      <PaymentInstructions />
    </div>
  );
}

function PaymentInstructions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/hq/public/payment-instructions')
      .then((r) => r.json())
      .then((json) => { if (mounted) setData(json); })
      .catch((e) => console.error(e))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">Loading payment instructions...</div>;
  if (!data) return <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">No payment instructions available.</div>;

  const wallet = data.wallet;
  const support = data.support;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">How to pay your subscription</h2>
      {wallet ? (
        <div className="space-y-2">
          <p>You can pay your Denuel subscription using {wallet.provider.replace('_', ' ')}:</p>
          <p className="font-medium">{wallet.label}</p>
          <div className="text-sm text-gray-700">
            <div><strong>{wallet.provider}:</strong> {wallet.phoneNumber}</div>
            {wallet.accountName && <div><strong>Account name:</strong> {wallet.accountName}</div>}
            <div><strong>Currency:</strong> {wallet.currency}</div>
          </div>
        </div>
      ) : (
        <p>No wallet instructions configured.</p>
      )}

      {support && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Support contacts</h3>
          <div className="text-sm text-gray-700">
            <div><strong>Email:</strong> {support.supportEmail}</div>
            <div><strong>Phone/WhatsApp:</strong> {support.primaryPhone}{support.secondaryPhone ? `, ${support.secondaryPhone}` : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}