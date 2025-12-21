'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// =====================================================
// TENANT THEME TYPES
// =====================================================
export interface TenantColors {
  primary: string;
  accent: string;
  surface: string;
  text: string;
  border: string;
}

export interface TenantSupport {
  phone?: string;
  phone2?: string;
  email?: string;
  whatsappNumber?: string;
}

export interface TenantLocation {
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  lat?: number;
  lng?: number;
}

export interface TenantSEO {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

export interface TenantHomepageConfig {
  enabledSections: string[];
  featuredMakes: string[];
  featuredModels: string[];
  promoBuckets: PromoBucket[];
}

export interface PromoBucket {
  id: string;
  label: string;
  slug: string;
  icon?: string;
  color?: string;
  filter?: Record<string, unknown>;
}

export interface TenantPublicSettings {
  tenantSlug: string;
  tenantId?: string;
  tenantName: string;
  logoUrl?: string;
  logoAlt?: string;
  themePreset: 'beforward' | 'sbt' | 'autocom' | 'custom';
  colors: TenantColors;
  support: TenantSupport;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  seo: TenantSEO;
  locations?: TenantLocation[];
  homepageConfig?: TenantHomepageConfig;
  currencies?: string[];
  defaultCurrency?: string;
  countries?: string[];
  defaultCountry?: string;
}

// =====================================================
// DEFAULT THEME (BE FORWARD STYLE)
// =====================================================
export const DEFAULT_BEFORWARD_COLORS: TenantColors = {
  primary: '#000000',
  accent: '#ff7a00',
  surface: '#ffffff',
  text: '#0f172a',
  border: '#e5e7eb',
};

export const DEFAULT_TENANT_SETTINGS: TenantPublicSettings = {
  tenantSlug: 'demo',
  tenantName: 'Auto Dealership',
  themePreset: 'beforward',
  colors: DEFAULT_BEFORWARD_COLORS,
  support: {},
  seo: {},
  currencies: ['USD', 'ZMW'],
  defaultCurrency: 'USD',
  countries: ['Zambia', 'Zimbabwe', 'Malawi', 'Tanzania', 'Kenya'],
  defaultCountry: 'Zambia',
};

// Theme presets
export const THEME_PRESETS: Record<string, TenantColors> = {
  beforward: {
    primary: '#000000',
    accent: '#ff7a00',
    surface: '#ffffff',
    text: '#0f172a',
    border: '#e5e7eb',
  },
  sbt: {
    primary: '#1e3a8a',
    accent: '#dc2626',
    surface: '#ffffff',
    text: '#1f2937',
    border: '#d1d5db',
  },
  autocom: {
    primary: '#0052CC',
    accent: '#00875A',
    surface: '#ffffff',
    text: '#172B4D',
    border: '#DFE1E6',
  },
  custom: DEFAULT_BEFORWARD_COLORS,
};

// =====================================================
// CONTEXT
// =====================================================
interface TenantThemeContextType {
  settings: TenantPublicSettings;
  loading: boolean;
  error: string | null;
  currency: string;
  country: string;
  setCurrency: (c: string) => void;
  setCountry: (c: string) => void;
}

const TenantThemeContext = createContext<TenantThemeContextType | null>(null);

export function useTenantTheme() {
  const ctx = useContext(TenantThemeContext);
  if (!ctx) {
    throw new Error('useTenantTheme must be used within TenantThemeProvider');
  }
  return ctx;
}

// =====================================================
// PROVIDER COMPONENT
// =====================================================
interface TenantThemeProviderProps {
  tenantSlug: string;
  initialSettings?: Partial<TenantPublicSettings>;
  children: React.ReactNode;
}

export default function TenantThemeProvider({
  tenantSlug,
  initialSettings,
  children,
}: TenantThemeProviderProps) {
  const [settings, setSettings] = useState<TenantPublicSettings>(() => ({
    ...DEFAULT_TENANT_SETTINGS,
    tenantSlug,
    ...initialSettings,
  }));
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);

  // Currency and country state with localStorage persistence
  const CURRENCY_KEY = `denuel:currency:${tenantSlug}`;
  const COUNTRY_KEY = `denuel:country:${tenantSlug}`;

  const [currency, setCurrencyState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CURRENCY_KEY) || initialSettings?.defaultCurrency || 'USD';
    }
    return initialSettings?.defaultCurrency || 'USD';
  });

  const [country, setCountryState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(COUNTRY_KEY) || initialSettings?.defaultCountry || 'Zambia';
    }
    return initialSettings?.defaultCountry || 'Zambia';
  });

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_KEY, c);
    }
  };

  const setCountry = (c: string) => {
    setCountryState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_KEY, c);
    }
  };

  // Fetch tenant settings
  useEffect(() => {
    if (initialSettings) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/t/${tenantSlug}/public/settings`);
        if (!res.ok) {
          throw new Error('Failed to fetch tenant settings');
        }
        const data = await res.json();
        setSettings({
          ...DEFAULT_TENANT_SETTINGS,
          ...data,
          tenantSlug,
        });
        // Update currency/country from server defaults if not set locally
        if (!localStorage.getItem(CURRENCY_KEY) && data.defaultCurrency) {
          setCurrencyState(data.defaultCurrency);
        }
        if (!localStorage.getItem(COUNTRY_KEY) && data.defaultCountry) {
          setCountryState(data.defaultCountry);
        }
      } catch (err) {
        console.error('Failed to load tenant settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [tenantSlug, initialSettings]);

  // Apply CSS variables (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement.style;
    const colors = settings.colors || DEFAULT_BEFORWARD_COLORS;

    root.setProperty('--primary', colors.primary);
    root.setProperty('--accent', colors.accent);
    root.setProperty('--surface', colors.surface);
    root.setProperty('--text', colors.text);
    root.setProperty('--border', colors.border);

    // Additional derived tokens
    root.setProperty('--header-bg', colors.surface);
    root.setProperty('--footer-bg', colors.primary);
    root.setProperty('--card-bg', colors.surface);
    root.setProperty('--btn-primary-bg', colors.accent);
    root.setProperty('--btn-primary-text', '#ffffff');
    root.setProperty('--link-color', colors.accent);
    root.setProperty('--link-hover', colors.primary);

    return () => {
      // Cleanup if needed
    };
  }, [settings.colors]);

  const contextValue = useMemo(
    () => ({
      settings,
      loading,
      error,
      currency,
      country,
      setCurrency,
      setCountry,
    }),
    [settings, loading, error, currency, country]
  );

  // Inline critical CSS variables for SSR (prevent FOUC)
  const inlineStyles = useMemo(() => {
    const colors = settings.colors || DEFAULT_BEFORWARD_COLORS;
    return {
      '--primary': colors.primary,
      '--accent': colors.accent,
      '--surface': colors.surface,
      '--text': colors.text,
      '--border': colors.border,
    } as React.CSSProperties;
  }, [settings.colors]);

  return (
    <TenantThemeContext.Provider value={contextValue}>
      <div style={inlineStyles} className="tenant-theme-root">
        {children}
      </div>
    </TenantThemeContext.Provider>
  );
}

// =====================================================
// HELPER HOOKS
// =====================================================
export function useTenantColors() {
  const { settings } = useTenantTheme();
  return settings.colors;
}

export function useTenantSupport() {
  const { settings } = useTenantTheme();
  return settings.support;
}

export function useTenantSEO() {
  const { settings } = useTenantTheme();
  return settings.seo;
}
