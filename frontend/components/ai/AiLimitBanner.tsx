'use client';

/**
 * AI Usage Limit Banner
 * Shows warnings when approaching AI limits
 */

import React from 'react';
import { AlertTriangle, Zap, X } from 'lucide-react';
import Link from 'next/link';

interface AiLimitBannerProps {
  percentage: number;
  remaining: number;
  limit: number;
  tenantSlug: string;
  onDismiss?: () => void;
}

export default function AiLimitBanner({
  percentage,
  remaining,
  limit,
  tenantSlug,
  onDismiss
}: AiLimitBannerProps) {
  // Don't show for unlimited plans or if well under limit
  if (limit === -1 || percentage < 70) return null;

  const isWarning = percentage >= 70 && percentage < 90;
  const isCritical = percentage >= 90;
  const isExhausted = remaining === 0;

  if (isExhausted) {
    return (
      <div className="bg-red-600 text-white px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <span className="font-medium">AI Request Limit Reached</span>
              <span className="ml-2 text-red-100">
                Purchase additional credits to continue using Denuel AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/t/${tenantSlug}/admin/billing?tab=ai-credits`}
              className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Buy Credits
            </Link>
            {onDismiss && (
              <button onClick={onDismiss} className="text-red-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isCritical) {
    return (
      <div className="bg-amber-500 text-white px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <span className="font-medium">Only {remaining} AI requests left</span>
              <span className="ml-2 text-amber-100">
                Running low on AI credits this month
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/t/${tenantSlug}/admin/billing?tab=ai-credits`}
              className="px-4 py-1.5 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              Get More
            </Link>
            {onDismiss && (
              <button onClick={onDismiss} className="text-amber-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="bg-blue-600 text-white px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            <span>
              {remaining} AI requests remaining this month ({100 - percentage}% left)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/t/${tenantSlug}/admin/billing?tab=ai-credits`}
              className="text-sm text-blue-100 hover:text-white underline"
            >
              View options
            </Link>
            {onDismiss && (
              <button onClick={onDismiss} className="text-blue-200 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
