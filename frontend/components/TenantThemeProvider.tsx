
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeTokens {
  primary: string;
  accent: string;
  surface: string;
  muted: string;
  text: string;
  cardBg: string;
  link: string;
  accentHover: string;
}

interface TenantThemeContextType {
  tokens: ThemeTokens | null;
  loading: boolean;
}

const TenantThemeContext = createContext<TenantThemeContextType>({
  tokens: null,
  loading: true,
});

export const useTenantTheme = () => useContext(TenantThemeContext);

interface TenantThemeProviderProps {
  children: React.ReactNode;
  tenantSlug: string;
}

export const TenantThemeProvider: React.FC<TenantThemeProviderProps> = ({
  children,
  tenantSlug,
}) => {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch(`/api/t/${tenantSlug}/theme`);
        if (response.ok) {
          const data = await response.json();
          setTokens(data.tokens);
        } else {
          // Fallback to default theme
          setTokens({
            primary: '#000000',
            accent: '#ff6600',
            surface: '#ffffff',
            muted: '#f5f5f5',
            text: '#333333',
            cardBg: '#ffffff',
            link: '#0066cc',
            accentHover: '#e55a00',
          });
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error);
        setTokens({
          primary: '#000000',
          accent: '#ff6600',
          surface: '#ffffff',
          muted: '#f5f5f5',
          text: '#333333',
          cardBg: '#ffffff',
          link: '#0066cc',
          accentHover: '#e55a00',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, [tenantSlug]);

  useEffect(() => {
    if (tokens) {
      const root = document.documentElement;
      Object.entries(tokens).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [tokens]);

  return (
    <TenantThemeContext.Provider value={{ tokens, loading }}>
      {children}
    </TenantThemeContext.Provider>
  );
};

export default TenantThemeProvider;

export const DEFAULT_THEME = {
  primary: '#000000',
  accent: '#ff6600',
  surface: '#ffffff',
  muted: '#f5f5f5',
  text: '#333333',
  cardBg: '#ffffff',
  link: '#0066cc',
  accentHover: '#e55a00',
};
