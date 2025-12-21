"use client";
import { useCallback, useEffect, useState } from 'react';

const RECENTLY_VIEWED_KEY = (tenantSlug: string) => `recentlyViewed:${tenantSlug}`;
const MAX_RECENT_ITEMS = 20;

/**
 * Hook for managing recently viewed vehicles
 * Stores recently viewed stock numbers in localStorage
 */
export function useRecentlyViewed(tenantSlug: string) {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY(tenantSlug));
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading recently viewed:', e);
    }
    setIsLoaded(true);
  }, [tenantSlug]);

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY(tenantSlug), JSON.stringify(recentlyViewed));
      } catch (e) {
        console.error('Error saving recently viewed:', e);
      }
    }
  }, [recentlyViewed, tenantSlug, isLoaded]);

  // Add a vehicle to recently viewed (moves to front if already exists)
  const addToRecentlyViewed = useCallback((stockNo: string) => {
    setRecentlyViewed((prev) => {
      // Remove if exists, add to front, limit to max items
      const filtered = prev.filter((sn) => sn !== stockNo);
      return [stockNo, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  // Remove from recently viewed
  const removeFromRecentlyViewed = useCallback((stockNo: string) => {
    setRecentlyViewed((prev) => prev.filter((sn) => sn !== stockNo));
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    recentCount: recentlyViewed.length,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
  };
}

export default useRecentlyViewed;
