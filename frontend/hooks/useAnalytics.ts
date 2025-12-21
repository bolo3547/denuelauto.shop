"use client";
import { useCallback, useEffect, useRef } from 'react';

// Types for analytics events
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  tenantSlug: string;
}

export interface CarViewEvent {
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  tenantSlug: string;
}

export interface SearchEvent {
  query?: string;
  filters: Record<string, unknown>;
  resultsCount: number;
  tenantSlug: string;
}

export interface InquiryEvent {
  stockNo: string;
  inquiryType: 'price' | 'availability' | 'shipping' | 'general';
  tenantSlug: string;
}

export interface ConversionEvent {
  type: 'inquiry_submitted' | 'quote_requested' | 'account_created' | 'favorite_added';
  stockNo?: string;
  value?: number;
  tenantSlug: string;
}

// Analytics provider interface (can be Google Analytics, Mixpanel, etc.)
interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void;
  pageView: (event: PageViewEvent) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
}

// Default provider that logs to console in development
const defaultProvider: AnalyticsProvider = {
  track: (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Track:', event);
    }
    // In production, this would send to your analytics service
  },
  pageView: (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] PageView:', event);
    }
    // Google Analytics 4 example:
    // gtag('event', 'page_view', { page_path: event.path, page_title: event.title });
  },
  identify: (userId, traits) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits);
    }
    // Google Analytics 4 example:
    // gtag('config', 'GA_MEASUREMENT_ID', { user_id: userId });
  },
};

// Hook configuration
interface UseAnalyticsConfig {
  tenantSlug: string;
  provider?: AnalyticsProvider;
  enabled?: boolean;
}

/**
 * Custom hook for tracking analytics events
 * Provides methods for tracking page views, car views, searches, and conversions
 */
export function useAnalytics({ tenantSlug, provider = defaultProvider, enabled = true }: UseAnalyticsConfig) {
  const lastPageView = useRef<string>('');

  // Track page view
  const trackPageView = useCallback((path: string, title: string) => {
    if (!enabled) return;
    
    // Prevent duplicate page views
    if (lastPageView.current === path) return;
    lastPageView.current = path;

    provider.pageView({
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      tenantSlug,
    });
  }, [enabled, provider, tenantSlug]);

  // Track car/vehicle view
  const trackCarView = useCallback((car: Omit<CarViewEvent, 'tenantSlug'>) => {
    if (!enabled) return;

    provider.track({
      event: 'car_view',
      category: 'Engagement',
      action: 'View Car',
      label: `${car.year} ${car.make} ${car.model}`,
      value: car.price,
      metadata: { ...car, tenantSlug },
    });

    // Also store in recently viewed (localStorage)
    try {
      const key = `recentlyViewed:${tenantSlug}`;
      const stored = localStorage.getItem(key);
      const recentlyViewed: string[] = stored ? JSON.parse(stored) : [];
      
      // Add to front, remove duplicates, limit to 20
      const updated = [car.stockNo, ...recentlyViewed.filter(sn => sn !== car.stockNo)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      // localStorage may not be available
    }
  }, [enabled, provider, tenantSlug]);

  // Track search
  const trackSearch = useCallback((search: Omit<SearchEvent, 'tenantSlug'>) => {
    if (!enabled) return;

    provider.track({
      event: 'search',
      category: 'Search',
      action: 'Perform Search',
      label: search.query || 'Filter Search',
      value: search.resultsCount,
      metadata: { ...search, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track inquiry
  const trackInquiry = useCallback((inquiry: Omit<InquiryEvent, 'tenantSlug'>) => {
    if (!enabled) return;

    provider.track({
      event: 'inquiry',
      category: 'Conversion',
      action: 'Submit Inquiry',
      label: inquiry.inquiryType,
      metadata: { ...inquiry, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track conversion events
  const trackConversion = useCallback((conversion: Omit<ConversionEvent, 'tenantSlug'>) => {
    if (!enabled) return;

    provider.track({
      event: conversion.type,
      category: 'Conversion',
      action: conversion.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      label: conversion.stockNo,
      value: conversion.value,
      metadata: { ...conversion, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track add to favorites
  const trackFavorite = useCallback((stockNo: string, action: 'add' | 'remove') => {
    if (!enabled) return;

    provider.track({
      event: action === 'add' ? 'favorite_add' : 'favorite_remove',
      category: 'Engagement',
      action: action === 'add' ? 'Add Favorite' : 'Remove Favorite',
      label: stockNo,
      metadata: { stockNo, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track compare actions
  const trackCompare = useCallback((stockNo: string, action: 'add' | 'remove' | 'view') => {
    if (!enabled) return;

    provider.track({
      event: `compare_${action}`,
      category: 'Engagement',
      action: `Compare ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      label: stockNo,
      metadata: { stockNo, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track outbound links
  const trackOutboundLink = useCallback((url: string, label?: string) => {
    if (!enabled) return;

    provider.track({
      event: 'outbound_link',
      category: 'Outbound',
      action: 'Click',
      label: label || url,
      metadata: { url, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Track file downloads
  const trackDownload = useCallback((fileName: string, fileType: string) => {
    if (!enabled) return;

    provider.track({
      event: 'file_download',
      category: 'Download',
      action: fileType,
      label: fileName,
      metadata: { fileName, fileType, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  // Identify user (for logged-in users)
  const identifyUser = useCallback((userId: string, traits?: Record<string, unknown>) => {
    if (!enabled) return;

    provider.identify(userId, {
      ...traits,
      tenantSlug,
    });
  }, [enabled, provider, tenantSlug]);

  // Generic event tracking
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'metadata'> & { metadata?: Record<string, unknown> }) => {
    if (!enabled) return;

    provider.track({
      ...event,
      metadata: { ...event.metadata, tenantSlug },
    });
  }, [enabled, provider, tenantSlug]);

  return {
    trackPageView,
    trackCarView,
    trackSearch,
    trackInquiry,
    trackConversion,
    trackFavorite,
    trackCompare,
    trackOutboundLink,
    trackDownload,
    identifyUser,
    trackEvent,
  };
}

/**
 * Hook to automatically track page views on route changes
 */
export function usePageViewTracking(tenantSlug: string, path: string, title: string) {
  const { trackPageView } = useAnalytics({ tenantSlug });

  useEffect(() => {
    trackPageView(path, title);
  }, [path, title, trackPageView]);
}

export default useAnalytics;
