'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { makeApiUrl } from '@/lib/config/api';

interface ThemeConfig {
  id?: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  layout: {
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  components: {
    header: {
      height: string;
      background: string;
      textColor: string;
      logoSize: string;
    };
    footer: {
      background: string;
      textColor: string;
    };
    buttons: {
      borderRadius: string;
      primaryBg: string;
      primaryText: string;
      secondaryBg: string;
      secondaryText: string;
    };
    cards: {
      background: string;
      borderRadius: string;
      shadow: string;
      borderColor: string;
    };
  };
  branding: {
    logo?: string;
    favicon?: string;
    companyName: string;
    tagline?: string;
  };
}

interface ThemeContextType {
  currentTheme: ThemeConfig | null;
  themes: ThemeConfig[];
  loading: boolean;
  setActiveTheme: (themeId: string) => Promise<void>;
  saveTheme: (theme: ThemeConfig) => Promise<void>;
  updateTheme: (themeId: string, theme: ThemeConfig) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default theme fallback
const DEFAULT_THEME: ThemeConfig = {
  name: 'Default Theme',
  description: 'Default dealership theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6'
    },
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  typography: {
    fontFamily: {
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  layout: {
    borderRadius: '0.5rem',
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '3rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    }
  },
  components: {
    header: {
      height: '4rem',
      background: '#ffffff',
      textColor: '#1f2937',
      logoSize: '2.5rem'
    },
    footer: {
      background: '#1f2937',
      textColor: '#f9fafb'
    },
    buttons: {
      borderRadius: '0.375rem',
      primaryBg: '#3b82f6',
      primaryText: '#ffffff',
      secondaryBg: '#f3f4f6',
      secondaryText: '#374151'
    },
    cards: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      borderColor: '#e5e7eb'
    }
  },
  branding: {
    companyName: 'Your Dealership',
    tagline: 'Quality Cars, Trusted Service'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate CSS variables from theme
  const generateCSSVariables = (theme: ThemeConfig): string => {
    return `
      :root {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text-primary: ${theme.colors.text.primary};
        --color-text-secondary: ${theme.colors.text.secondary};
        --color-text-accent: ${theme.colors.text.accent};
        --color-border: ${theme.colors.border};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        
        --font-heading: ${theme.typography.fontFamily.heading};
        --font-body: ${theme.typography.fontFamily.body};
        
        --text-xs: ${theme.typography.fontSize.xs};
        --text-sm: ${theme.typography.fontSize.sm};
        --text-base: ${theme.typography.fontSize.base};
        --text-lg: ${theme.typography.fontSize.lg};
        --text-xl: ${theme.typography.fontSize.xl};
        --text-xxl: ${theme.typography.fontSize.xxl};
        
        --border-radius: ${theme.layout.borderRadius};
        --spacing-xs: ${theme.layout.spacing.xs};
        --spacing-sm: ${theme.layout.spacing.sm};
        --spacing-md: ${theme.layout.spacing.md};
        --spacing-lg: ${theme.layout.spacing.lg};
        --spacing-xl: ${theme.layout.spacing.xl};
        
        --shadow-sm: ${theme.layout.shadows.sm};
        --shadow-md: ${theme.layout.shadows.md};
        --shadow-lg: ${theme.layout.shadows.lg};
        
        --header-height: ${theme.components.header.height};
        --header-background: ${theme.components.header.background};
        --header-text-color: ${theme.components.header.textColor};
        --header-logo-size: ${theme.components.header.logoSize};
        
        --footer-background: ${theme.components.footer.background};
        --footer-text-color: ${theme.components.footer.textColor};
        
        --button-border-radius: ${theme.components.buttons.borderRadius};
        --button-primary-bg: ${theme.components.buttons.primaryBg};
        --button-primary-text: ${theme.components.buttons.primaryText};
        --button-secondary-bg: ${theme.components.buttons.secondaryBg};
        --button-secondary-text: ${theme.components.buttons.secondaryText};
        
        --card-background: ${theme.components.cards.background};
        --card-border-radius: ${theme.components.cards.borderRadius};
        --card-shadow: ${theme.components.cards.shadow};
        --card-border-color: ${theme.components.cards.borderColor};
      }
    `;
  };

  // Apply theme to document
  const applyTheme = (theme: ThemeConfig) => {
    // Remove existing theme styles
    const existingStyle = document.getElementById('theme-variables');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'theme-variables';
    style.innerHTML = generateCSSVariables(theme);
    document.head.appendChild(style);

    // Update document title and favicon if provided
    if (theme.branding.companyName) {
      document.title = `${theme.branding.companyName} - Dashboard`;
    }

    if (theme.branding.favicon) {
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(favicon);
      }
      favicon.href = theme.branding.favicon;
    }
  };

  // Load themes from API
  const refreshThemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(makeApiUrl('/api/themes'));
      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes || []);
        
        // Find active theme
        const activeTheme = data.themes?.find((theme: any) => theme.isActive);
        if (activeTheme) {
          setCurrentTheme(activeTheme.themeConfig);
          applyTheme(activeTheme.themeConfig);
        } else {
          // Use default theme if no active theme
          setCurrentTheme(DEFAULT_THEME);
          applyTheme(DEFAULT_THEME);
        }
      } else {
        // Fallback to default theme
        setCurrentTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
      // Fallback to default theme
      setCurrentTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  // Set active theme
  const setActiveTheme = async (themeId: string) => {
    try {
      const response = await fetch(makeApiUrl(`/api/themes/${themeId}/activate`), {
        method: 'POST'
      });

      if (response.ok) {
        await refreshThemes(); // Reload themes to get updated active status
      } else {
        throw new Error('Failed to activate theme');
      }
    } catch (error) {
      console.error('Failed to activate theme:', error);
      throw error;
    }
  };

  // Save new theme
  const saveTheme = async (theme: ThemeConfig) => {
    try {
      const response = await fetch(makeApiUrl('/api/themes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: theme.name,
          description: theme.description,
          themeConfig: theme
        })
      });

      if (response.ok) {
        await refreshThemes(); // Reload themes
      } else {
        throw new Error('Failed to save theme');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  };

  // Update existing theme
  const updateTheme = async (themeId: string, theme: ThemeConfig) => {
    try {
      const response = await fetch(makeApiUrl(`/api/themes/${themeId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: theme.name,
          description: theme.description,
          themeConfig: theme
        })
      });

      if (response.ok) {
        await refreshThemes(); // Reload themes
      } else {
        throw new Error('Failed to update theme');
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  };

  // Delete theme
  const deleteTheme = async (themeId: string) => {
    try {
      const response = await fetch(makeApiUrl(`/api/themes/${themeId}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        await refreshThemes(); // Reload themes
      } else {
        throw new Error('Failed to delete theme');
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
      throw error;
    }
  };

  // Load themes on mount
  useEffect(() => {
    refreshThemes();
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    loading,
    setActiveTheme,
    saveTheme,
    updateTheme,
    deleteTheme,
    refreshThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export type { ThemeConfig };