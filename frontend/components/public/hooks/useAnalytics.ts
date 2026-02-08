'use client';

import { useCallback } from 'react';
import { useTenantTheme } from '../tenant';

// =====================================================
// ANALYTICS EVENT TYPES
// =====================================================
export type AnalyticsEvent =
  | 'search_submit'
  | 'filter_apply'
  | 'stock_view'
  | 'favorite_add'
  | 'favorite_remove'
  | 'compare_add'
  | 'compare_remove'
  | 'inquiry_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'share_click'
  | 'quote_request'
  | 'pdf_download'
  | 'page_view'
  | 'saved_search_create'
  | 'saved_search_delete';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  tenantSlug: string;
  data?: Record<string, any>;
  timestamp?: number;
}

// =====================================================
// ANALYTICS HOOK
// =====================================================
export function useAnalytics() {
  const { settings } = useTenantTheme();

  const track = useCallback(
    async (event: AnalyticsEvent, data?: Record<string, any>) => {
      const payload: AnalyticsPayload = {
        event,
        tenantSlug: settings.tenantSlug,
        data,
        timestamp: Date.now(),
      };

      // Console log for development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', payload);
      }

      // Send to server analytics endpoint (fire and forget)
      try {
        fetch(`/api/t/${settings.tenantSlug}/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {
          // Silent fail - analytics should not break UX
        });

        // GA4 integration: send events to Google Analytics if configured
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', event, {
            tenant_slug: settings.tenantSlug,
            ...data,
          });
        }
      } catch {
        // Silent fail
      }
    },
    [settings.tenantSlug]
  );

  // Convenience methods
  const trackSearch = useCallback(
    (query: string, filters?: Record<string, any>) => {
      track('search_submit', { query, filters });
    },
    [track]
  );

  const trackFilterApply = useCallback(
    (filters: Record<string, any>) => {
      track('filter_apply', { filters });
    },
    [track]
  );

  const trackStockView = useCallback(
    (stockNo: string, make?: string, model?: string) => {
      track('stock_view', { stockNo, make, model });
      
      // Also update recently viewed in localStorage
      if (typeof window !== 'undefined') {
        const key = `recently_viewed:${settings.tenantSlug}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = existing.filter((s: string) => s !== stockNo);
        const updated = [stockNo, ...filtered].slice(0, 12);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    },
    [track, settings.tenantSlug]
  );

  const trackFavorite = useCallback(
    (stockNo: string, action: 'add' | 'remove') => {
      track(action === 'add' ? 'favorite_add' : 'favorite_remove', { stockNo });
    },
    [track]
  );

  const trackCompare = useCallback(
    (stockNo: string, action: 'add' | 'remove') => {
      track(action === 'add' ? 'compare_add' : 'compare_remove', { stockNo });
    },
    [track]
  );

  const trackInquiry = useCallback(
    (stockNo: string, type: 'form' | 'whatsapp' | 'phone') => {
      track('inquiry_submit', { stockNo, type });
    },
    [track]
  );

  const trackWhatsAppClick = useCallback(
    (context?: string) => {
      track('whatsapp_click', { context });
    },
    [track]
  );

  const trackShare = useCallback(
    (stockNo: string, platform: string) => {
      track('share_click', { stockNo, platform });
    },
    [track]
  );

  return {
    track,
    trackSearch,
    trackFilterApply,
    trackStockView,
    trackFavorite,
    trackCompare,
    trackInquiry,
    trackWhatsAppClick,
    trackShare,
  };
}

export default useAnalytics;
