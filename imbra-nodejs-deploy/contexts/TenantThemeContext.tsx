'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { TenantTheme } from '@/types/dealer';
import { themePresets } from '@/lib/themePresets';
import { useParams } from 'next/navigation';
import { makeApiUrl } from '@/lib/config/api';

type TenantThemeContextType = {
  theme: TenantTheme | null;
  loading: boolean;
  refresh: () => Promise<TenantTheme | null>;
};

const TenantThemeContext = React.createContext<TenantThemeContextType | undefined>(undefined);

export const TenantThemeProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const slug = (params as any)?.slug || '';
  const [theme, setTheme] = useState<TenantTheme | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    if (!slug) return null;
    try {
      setLoading(true);
      const res = await fetch(makeApiUrl(`/api/tenants/${slug}/theme`));
      if (!res.ok) return null;
      const body = await res.json();
      // API might return { theme: {...} } or a bare theme object; support both.
      let t = body.theme || body as any;
      // Normalize older shape: if theme is nested under theme.theme
      if (t && t.theme) t = { ...t, ...t.theme };
      // If palette provided, attempt to apply preset colors
      const paletteKey = (t?.palette || t?.theme?.palette || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const preset = (themePresets as any)[paletteKey];
      if (preset) {
        t = { ...t, primaryColor: t.primaryColor || preset.primaryAccentColor, accentColor: t.accentColor || preset.secondaryAccentColor, mainBgColor: t.mainBgColor || preset.mainBgColor };
      }
      setTheme(t as TenantTheme);
      return body.theme as TenantTheme;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return <TenantThemeContext.Provider value={{ theme, loading, refresh }}>{children}</TenantThemeContext.Provider>;
};

export const useTenantTheme = (): TenantThemeContextType => {
  const ctx = React.useContext(TenantThemeContext);
  if (!ctx) {
    // Return a safe default for server-side rendering or when not wrapped
    return {
      theme: null,
      loading: false,
      refresh: async () => null,
    };
  }
  return ctx;
};

export default TenantThemeProvider;
