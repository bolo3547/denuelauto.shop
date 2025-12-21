"use client";
import { useCallback, useEffect, useState } from 'react';

const COMPARE_KEY = (tenantSlug: string) => `compare:${tenantSlug}`;
const MAX_COMPARE_ITEMS = 4;

/**
 * Hook for managing compare list functionality
 * Stores compare items in localStorage for persistence
 */
export function useCompare(tenantSlug: string) {
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load compare list from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY(tenantSlug));
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading compare list:', e);
    }
    setIsLoaded(true);
  }, [tenantSlug]);

  // Save compare list to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(COMPARE_KEY(tenantSlug), JSON.stringify(compareList));
      } catch (e) {
        console.error('Error saving compare list:', e);
      }
    }
  }, [compareList, tenantSlug, isLoaded]);

  // Check if a stock number is in compare list
  const isInCompare = useCallback((stockNo: string) => {
    return compareList.includes(stockNo);
  }, [compareList]);

  // Add to compare list
  const addToCompare = useCallback((stockNo: string): { success: boolean; message?: string } => {
    if (compareList.includes(stockNo)) {
      return { success: false, message: 'Already in compare list' };
    }
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return { success: false, message: `Maximum ${MAX_COMPARE_ITEMS} items allowed in compare` };
    }
    setCompareList((prev) => [...prev, stockNo]);
    return { success: true };
  }, [compareList]);

  // Remove from compare list
  const removeFromCompare = useCallback((stockNo: string) => {
    setCompareList((prev) => prev.filter((sn) => sn !== stockNo));
  }, []);

  // Toggle compare status
  const toggleCompare = useCallback((stockNo: string): { success: boolean; message?: string; action: 'added' | 'removed' } => {
    if (compareList.includes(stockNo)) {
      setCompareList((prev) => prev.filter((sn) => sn !== stockNo));
      return { success: true, action: 'removed' };
    }
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return { success: false, message: `Maximum ${MAX_COMPARE_ITEMS} items allowed`, action: 'added' };
    }
    setCompareList((prev) => [...prev, stockNo]);
    return { success: true, action: 'added' };
  }, [compareList]);

  // Clear all compare items
  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  // Check if can add more items
  const canAddMore = compareList.length < MAX_COMPARE_ITEMS;

  return {
    compareList,
    compareCount: compareList.length,
    maxItems: MAX_COMPARE_ITEMS,
    isInCompare,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    canAddMore,
    isLoaded,
  };
}

export default useCompare;
