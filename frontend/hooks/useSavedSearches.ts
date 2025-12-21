"use client";
import { useState, useEffect, useCallback } from 'react';

const SAVED_SEARCHES_KEY = 'saved-searches';
const MAX_SEARCHES = 10;

export interface SavedSearchFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  minMileage?: number;
  maxMileage?: number;
  color?: string;
  driveType?: string;
  country?: string;
  keyword?: string;
  [key: string]: string | number | undefined;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
  lastUsedAt?: string;
}

export function useSavedSearches(tenantSlug: string) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const storageKey = `${SAVED_SEARCHES_KEY}:${tenantSlug}`;

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setSavedSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, [storageKey]);

  // Save a search
  const saveSearch = useCallback((name: string, filters: SavedSearchFilters) => {
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    setSavedSearches((prev) => {
      const updated = [newSearch, ...prev].slice(0, MAX_SEARCHES);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });

    return newSearch;
  }, [storageKey]);

  // Update a search
  const updateSearch = useCallback((id: string, updates: Partial<Pick<SavedSearch, 'name' | 'filters'>>) => {
    setSavedSearches((prev) => {
      const updated = prev.map((search) =>
        search.id === id ? { ...search, ...updates } : search
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey]);

  // Delete a search
  const deleteSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((search) => search.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey]);

  // Mark search as used (update lastUsedAt)
  const markAsUsed = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.map((search) =>
        search.id === id
          ? { ...search, lastUsedAt: new Date().toISOString() }
          : search
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey]);

  // Clear all
  const clearAll = useCallback(() => {
    setSavedSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Convert filters to URL params
  const filtersToParams = useCallback((filters: SavedSearchFilters): URLSearchParams => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    });
    return params;
  }, []);

  // Get search URL
  const getSearchUrl = useCallback((search: SavedSearch): string => {
    const params = filtersToParams(search.filters);
    return `/t/${tenantSlug}/stock?${params.toString()}`;
  }, [tenantSlug, filtersToParams]);

  return {
    savedSearches,
    saveSearch,
    updateSearch,
    deleteSearch,
    markAsUsed,
    clearAll,
    getSearchUrl,
    filtersToParams,
    count: savedSearches.length,
    isFull: savedSearches.length >= MAX_SEARCHES,
  };
}

export default useSavedSearches;
