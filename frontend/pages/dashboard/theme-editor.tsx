'use client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { FaPalette, FaEye, FaSave, FaUndo, FaCopy, FaDownload, FaUpload, FaMobile, FaDesktop, FaTablet } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

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

const PRESET_THEMES: { [key: string]: ThemeConfig } = {
  'be-forward': {
    name: 'Professional Blue Theme',
    description: 'Modern blue theme with professional styling',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#1e40af'
      },
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: {
        heading: '"Inter", "Helvetica Neue", sans-serif',
        body: '"Inter", "Helvetica Neue", sans-serif'
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
        primaryBg: '#1e40af',
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
  },
  'sbt-japan': {
    name: 'SBT Japan Style',
    description: 'Clean red and white theme inspired by SBT Japan',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f59e0b',
      background: '#fefefe',
      surface: '#ffffff',
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        accent: '#dc2626'
      },
      border: '#d1d5db',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    typography: {
      fontFamily: {
        heading: '"Roboto", "Helvetica", sans-serif',
        body: '"Roboto", "Helvetica", sans-serif'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '2rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    layout: {
      borderRadius: '0.25rem',
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2.5rem'
      },
      shadows: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    },
    components: {
      header: {
        height: '4.5rem',
        background: '#dc2626',
        textColor: '#ffffff',
        logoSize: '3rem'
      },
      footer: {
        background: '#111827',
        textColor: '#f9fafb'
      },
      buttons: {
        borderRadius: '0.25rem',
        primaryBg: '#dc2626',
        primaryText: '#ffffff',
        secondaryBg: '#f9fafb',
        secondaryText: '#374151'
      },
      cards: {
        background: '#ffffff',
        borderRadius: '0.25rem',
        shadow: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        borderColor: '#d1d5db'
      }
    },
    branding: {
      companyName: 'Your Dealership',
      tagline: 'Reliable Japanese Cars'
    }
  },
  'autocom': {
    name: 'Autocom Style',
    description: 'Modern green theme inspired by Autocom',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: {
        primary: '#064e3b',
        secondary: '#6b7280',
        accent: '#059669'
      },
      border: '#d1fae5',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    typography: {
      fontFamily: {
        heading: '"Poppins", "Helvetica", sans-serif',
        body: '"Open Sans", "Helvetica", sans-serif'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '2.5rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    layout: {
      borderRadius: '0.75rem',
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '3rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    },
    components: {
      header: {
        height: '5rem',
        background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
        textColor: '#ffffff',
        logoSize: '2.75rem'
      },
      footer: {
        background: '#064e3b',
        textColor: '#f0fdf4'
      },
      buttons: {
        borderRadius: '0.5rem',
        primaryBg: '#059669',
        primaryText: '#ffffff',
        secondaryBg: '#ecfdf5',
        secondaryText: '#065f46'
      },
      cards: {
        background: '#ffffff',
        borderRadius: '0.75rem',
        shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderColor: '#d1fae5'
      }
    },
    branding: {
      companyName: 'Your Dealership',
      tagline: 'Premium Auto Experience'
    }
  },
  'custom': {
    name: 'Custom Theme',
    description: 'Create your own unique theme',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#4f46e5'
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
        primaryBg: '#6366f1',
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
      tagline: 'Your Custom Tagline'
    }
  }
};

export default function ThemeEditor() {
  const { currentTheme: contextTheme, themes, loading, setActiveTheme, saveTheme: saveThemeToAPI } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(PRESET_THEMES['be-forward']);
  const [selectedPreset, setSelectedPreset] = useState('be-forward');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize with context theme or fallback
  useEffect(() => {
    if (contextTheme) {
      setCurrentTheme(contextTheme);
      // Try to match with preset
      const presetMatch = Object.entries(PRESET_THEMES).find(([, preset]) => 
        JSON.stringify(preset) === JSON.stringify(contextTheme)
      );
      if (presetMatch) {
        setSelectedPreset(presetMatch[0]);
      } else {
        setSelectedPreset('custom');
      }
    }
  }, [contextTheme]);

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
      }
    `;
  };

  // Apply theme to preview
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = generateCSSVariables(currentTheme);
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [currentTheme]);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setCurrentTheme(PRESET_THEMES[presetKey]);
    setHasUnsavedChanges(false);
  };

  const handleThemeChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newTheme = { ...currentTheme };
    let current: any = newTheme;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setCurrentTheme(newTheme);
    setHasUnsavedChanges(true);
  };

  const saveTheme = async () => {
    try {
      await saveThemeToAPI(currentTheme);
      setHasUnsavedChanges(false);
      alert('Theme saved successfully!');
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme. Please try again.');
    }
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        setCurrentTheme(importedTheme);
        setSelectedPreset('custom');
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Invalid theme file format');
      }
    };
    reader.readAsText(file);
  };

  const resetToPreset = () => {
    setCurrentTheme(PRESET_THEMES[selectedPreset]);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaPalette className="text-purple-600" />
                Theme Editor
              </h1>
              <p className="text-gray-600 mt-2">Customize your dealership&apos;s visual appearance</p>
            </div>
            
            <div className="flex gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={resetToPreset}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
                >
                  <FaUndo /> Reset
                </button>
              )}
              
              <button
                onClick={exportTheme}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <FaDownload /> Export
              </button>
              
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 cursor-pointer">
                <FaUpload /> Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={saveTheme}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                disabled={!hasUnsavedChanges}
              >
                <FaSave /> Save Theme
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme Editor Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preset Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Theme Presets</h3>
              <div className="space-y-3">
                {Object.entries(PRESET_THEMES).map(([key, preset]) => (
                  <div
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPreset === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-gray-600">{preset.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Customization Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex border-b">
                {['colors', 'typography', 'layout', 'components', 'branding'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {activeTab === 'colors' && (
                  <ColorEditor theme={currentTheme} onChange={handleThemeChange} />
                )}
                {activeTab === 'typography' && (
                  <TypographyEditor theme={currentTheme} onChange={handleThemeChange} />
                )}
                {activeTab === 'layout' && (
                  <LayoutEditor theme={currentTheme} onChange={handleThemeChange} />
                )}
                {activeTab === 'components' && (
                  <ComponentsEditor theme={currentTheme} onChange={handleThemeChange} />
                )}
                {activeTab === 'branding' && (
                  <BrandingEditor theme={currentTheme} onChange={handleThemeChange} />
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaEye className="text-blue-600" />
                  Live Preview
                </h3>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                  >
                    <FaDesktop />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                  >
                    <FaTablet />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                  >
                    <FaMobile />
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <ThemePreview theme={currentTheme} mode={previewMode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color Editor Component
function ColorEditor({ theme, onChange }: { theme: ThemeConfig; onChange: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Brand Colors</h4>
      <div className="grid grid-cols-2 gap-4">
        <ColorInput label="Primary" value={theme.colors.primary} onChange={(v) => onChange('colors.primary', v)} />
        <ColorInput label="Secondary" value={theme.colors.secondary} onChange={(v) => onChange('colors.secondary', v)} />
        <ColorInput label="Accent" value={theme.colors.accent} onChange={(v) => onChange('colors.accent', v)} />
        <ColorInput label="Background" value={theme.colors.background} onChange={(v) => onChange('colors.background', v)} />
      </div>

      <h4 className="font-medium mt-6">Text Colors</h4>
      <div className="grid grid-cols-2 gap-4">
        <ColorInput label="Primary Text" value={theme.colors.text.primary} onChange={(v) => onChange('colors.text.primary', v)} />
        <ColorInput label="Secondary Text" value={theme.colors.text.secondary} onChange={(v) => onChange('colors.text.secondary', v)} />
      </div>

      <h4 className="font-medium mt-6">Status Colors</h4>
      <div className="grid grid-cols-2 gap-4">
        <ColorInput label="Success" value={theme.colors.success} onChange={(v) => onChange('colors.success', v)} />
        <ColorInput label="Warning" value={theme.colors.warning} onChange={(v) => onChange('colors.warning', v)} />
        <ColorInput label="Error" value={theme.colors.error} onChange={(v) => onChange('colors.error', v)} />
        <ColorInput label="Border" value={theme.colors.border} onChange={(v) => onChange('colors.border', v)} />
      </div>
    </div>
  );
}

// Typography Editor Component
function TypographyEditor({ theme, onChange }: { theme: ThemeConfig; onChange: (path: string, value: any) => void }) {
  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Poppins',
    'Montserrat',
    'Lato',
    'Source Sans Pro',
    'Nunito',
    'PT Sans',
    'Raleway'
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Font Families</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Heading Font</label>
          <select
            value={theme.typography.fontFamily.heading.split(',')[0].replace(/"/g, '')}
            onChange={(e) => onChange('typography.fontFamily.heading', `"${e.target.value}", sans-serif`)}
            className="w-full border rounded px-3 py-2"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Body Font</label>
          <select
            value={theme.typography.fontFamily.body.split(',')[0].replace(/"/g, '')}
            onChange={(e) => onChange('typography.fontFamily.body', `"${e.target.value}", sans-serif`)}
            className="w-full border rounded px-3 py-2"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </div>

      <h4 className="font-medium mt-6">Font Sizes</h4>
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Extra Small" value={theme.typography.fontSize.xs} onChange={(v) => onChange('typography.fontSize.xs', v)} />
        <TextInput label="Small" value={theme.typography.fontSize.sm} onChange={(v) => onChange('typography.fontSize.sm', v)} />
        <TextInput label="Base" value={theme.typography.fontSize.base} onChange={(v) => onChange('typography.fontSize.base', v)} />
        <TextInput label="Large" value={theme.typography.fontSize.lg} onChange={(v) => onChange('typography.fontSize.lg', v)} />
      </div>
    </div>
  );
}

// Layout Editor Component
function LayoutEditor({ theme, onChange }: { theme: ThemeConfig; onChange: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Border Radius</h4>
      <TextInput
        label="Default Border Radius"
        value={theme.layout.borderRadius}
        onChange={(v) => onChange('layout.borderRadius', v)}
      />

      <h4 className="font-medium mt-6">Spacing</h4>
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Extra Small" value={theme.layout.spacing.xs} onChange={(v) => onChange('layout.spacing.xs', v)} />
        <TextInput label="Small" value={theme.layout.spacing.sm} onChange={(v) => onChange('layout.spacing.sm', v)} />
        <TextInput label="Medium" value={theme.layout.spacing.md} onChange={(v) => onChange('layout.spacing.md', v)} />
        <TextInput label="Large" value={theme.layout.spacing.lg} onChange={(v) => onChange('layout.spacing.lg', v)} />
      </div>
    </div>
  );
}

// Components Editor Component
function ComponentsEditor({ theme, onChange }: { theme: ThemeConfig; onChange: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Header</h4>
      <div className="space-y-3">
        <TextInput label="Height" value={theme.components.header.height} onChange={(v) => onChange('components.header.height', v)} />
        <ColorInput label="Background" value={theme.components.header.background} onChange={(v) => onChange('components.header.background', v)} />
        <ColorInput label="Text Color" value={theme.components.header.textColor} onChange={(v) => onChange('components.header.textColor', v)} />
      </div>

      <h4 className="font-medium mt-6">Buttons</h4>
      <div className="space-y-3">
        <TextInput label="Border Radius" value={theme.components.buttons.borderRadius} onChange={(v) => onChange('components.buttons.borderRadius', v)} />
        <ColorInput label="Primary Background" value={theme.components.buttons.primaryBg} onChange={(v) => onChange('components.buttons.primaryBg', v)} />
        <ColorInput label="Primary Text" value={theme.components.buttons.primaryText} onChange={(v) => onChange('components.buttons.primaryText', v)} />
      </div>

      <h4 className="font-medium mt-6">Cards</h4>
      <div className="space-y-3">
        <ColorInput label="Background" value={theme.components.cards.background} onChange={(v) => onChange('components.cards.background', v)} />
        <TextInput label="Border Radius" value={theme.components.cards.borderRadius} onChange={(v) => onChange('components.cards.borderRadius', v)} />
        <ColorInput label="Border Color" value={theme.components.cards.borderColor} onChange={(v) => onChange('components.cards.borderColor', v)} />
      </div>
    </div>
  );
}

// Branding Editor Component
function BrandingEditor({ theme, onChange }: { theme: ThemeConfig; onChange: (path: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Company Information</h4>
      <div className="space-y-3">
        <TextInput
          label="Company Name"
          value={theme.branding.companyName}
          onChange={(v) => onChange('branding.companyName', v)}
        />
        <TextInput
          label="Tagline"
          value={theme.branding.tagline || ''}
          onChange={(v) => onChange('branding.tagline', v)}
        />
      </div>

      <h4 className="font-medium mt-6">Logo & Branding</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Logo Upload</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Upload your logo</p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 text-sm"
              onChange={(e) => {
                // TODO: Handle logo upload
                console.log('Logo upload:', e.target.files);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm font-mono"
        />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

// Theme Preview Component
function ThemePreview({ theme, mode }: { theme: ThemeConfig; mode: 'desktop' | 'tablet' | 'mobile' }) {
  const containerClasses = {
    desktop: 'w-full h-96',
    tablet: 'w-2/3 h-96 mx-auto',
    mobile: 'w-1/3 h-96 mx-auto'
  };

  return (
    <div className={containerClasses[mode]} style={{ 
      backgroundColor: theme.colors.background,
      fontFamily: theme.typography.fontFamily.body 
    }}>
      {/* Header */}
      <div
        style={{
          height: theme.components.header.height,
          backgroundColor: theme.components.header.background,
          color: theme.components.header.textColor,
          borderRadius: `${theme.layout.borderRadius} ${theme.layout.borderRadius} 0 0`
        }}
        className="flex items-center justify-between px-6"
      >
        <div className="font-bold text-lg">{theme.branding.companyName}</div>
        <nav className="flex gap-4 text-sm">
          <a href="#" className="hover:opacity-75">Cars</a>
          <a href="#" className="hover:opacity-75">About</a>
          <a href="#" className="hover:opacity-75">Contact</a>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1
            style={{
              fontSize: theme.typography.fontSize.xxl,
              fontFamily: theme.typography.fontFamily.heading,
              color: theme.colors.text.primary
            }}
          >
            {theme.branding.companyName}
          </h1>
          {theme.branding.tagline && (
            <p
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary
              }}
              className="mt-2"
            >
              {theme.branding.tagline}
            </p>
          )}
        </div>

        {/* Sample Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div
            style={{
              backgroundColor: theme.components.cards.background,
              borderRadius: theme.components.cards.borderRadius,
              boxShadow: theme.layout.shadows.md,
              borderColor: theme.components.cards.borderColor
            }}
            className="p-4 border"
          >
            <h3
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg
              }}
              className="font-semibold mb-2"
            >
              Toyota Camry 2020
            </h3>
            <p
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              $15,000
            </p>
          </div>

          <div
            style={{
              backgroundColor: theme.components.cards.background,
              borderRadius: theme.components.cards.borderRadius,
              boxShadow: theme.layout.shadows.md,
              borderColor: theme.components.cards.borderColor
            }}
            className="p-4 border"
          >
            <h3
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg
              }}
              className="font-semibold mb-2"
            >
              Honda Civic 2019
            </h3>
            <p
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              $12,000
            </p>
          </div>
        </div>

        {/* Sample Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            style={{
              backgroundColor: theme.components.buttons.primaryBg,
              color: theme.components.buttons.primaryText,
              borderRadius: theme.components.buttons.borderRadius,
              fontSize: theme.typography.fontSize.sm
            }}
            className="px-4 py-2 font-medium"
          >
            View Cars
          </button>
          <button
            style={{
              backgroundColor: theme.components.buttons.secondaryBg,
              color: theme.components.buttons.secondaryText,
              borderRadius: theme.components.buttons.borderRadius,
              fontSize: theme.typography.fontSize.sm
            }}
            className="px-4 py-2 font-medium border"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: theme.components.footer.background,
          color: theme.components.footer.textColor,
          fontSize: theme.typography.fontSize.sm
        }}
        className="mt-auto p-4 text-center"
      >
        © 2024 {theme.branding.companyName}. All rights reserved.
      </div>
    </div>
  );
}