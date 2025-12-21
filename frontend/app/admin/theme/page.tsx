'use client';

import { useState } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerBgColor: string;
  footerBgColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

export default function AdminThemePage() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: '#0F3D91',
    secondaryColor: '#1e40af',
    accentColor: '#F4C430',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headerBgColor: '#ffffff',
    footerBgColor: '#f9fafb',
    buttonStyle: 'rounded',
    fontFamily: 'sans',
    borderRadius: 'medium',
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (property: keyof ThemeSettings, value: string) => {
    setTheme(prev => ({ ...prev, [property]: value }));
  };

  const resetToDefault = () => {
    setTheme({
      primaryColor: '#0F3D91',
      secondaryColor: '#1e40af',
      accentColor: '#F4C430',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      headerBgColor: '#ffffff',
      footerBgColor: '#f9fafb',
      buttonStyle: 'rounded',
      fontFamily: 'sans',
      borderRadius: 'medium',
    });
  };

  const applyTheme = () => {
    // In a real app, this would save to database and update global CSS variables
    alert('Theme settings saved successfully!');
  };

  const colorPresets = [
    { name: 'Blue Professional', primary: '#0F3D91', secondary: '#1e40af', accent: '#F4C430' },
    { name: 'Green Modern', primary: '#059669', secondary: '#047857', accent: '#fbbf24' },
    { name: 'Red Dynamic', primary: '#dc2626', secondary: '#b91c1c', accent: '#f59e0b' },
    { name: 'Purple Elegant', primary: '#7c3aed', secondary: '#6d28d9', accent: '#06b6d4' },
    { name: 'Orange Warm', primary: '#ea580c', secondary: '#c2410c', accent: '#3b82f6' },
  ];

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme & Branding</h1>
          <p className="text-gray-600">Customize your website&apos;s appearance and colors</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {previewMode ? 'Exit Preview' : 'Preview Theme'}
          </button>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset to Default
          </button>
          <button
            onClick={applyTheme}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {previewMode ? (
        /* Theme Preview */
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Theme Preview</h2>
          <div
            className="border rounded-lg overflow-hidden"
            style={{
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
              fontFamily: theme.fontFamily === 'sans' ? 'ui-sans-serif' :
                         theme.fontFamily === 'serif' ? 'ui-serif' : 'ui-monospace'
            }}
          >
            {/* Header Preview */}
            <div
              className="p-4 border-b"
              style={{ backgroundColor: theme.headerBgColor }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: theme.primaryColor }}>
                  Enuel Motors
                </h3>
                <nav className="space-x-4">
                  <button type="button" className="hover:underline bg-transparent border-none p-0" style={{ color: theme.textColor }}>Home</button>
                  <button type="button" className="hover:underline bg-transparent border-none p-0" style={{ color: theme.textColor }}>Inventory</button>
                  <button type="button" className="hover:underline bg-transparent border-none p-0" style={{ color: theme.textColor }}>Contact</button>
                </nav>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-6">
              <h4 className="text-2xl font-bold mb-4" style={{ color: theme.primaryColor }}>
                Welcome to Our Dealership
              </h4>
              <p className="mb-4">
                Discover your dream car with our extensive collection of quality vehicles.
              </p>

              {/* Button Preview */}
              <div className="flex space-x-3">
                <button
                  className={`px-6 py-2 text-white ${
                    theme.buttonStyle === 'pill' ? 'rounded-full' :
                    theme.buttonStyle === 'square' ? 'rounded-none' : 'rounded'
                  }`}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius: theme.borderRadius === 'none' ? '0' :
                                theme.borderRadius === 'small' ? '0.25rem' :
                                theme.borderRadius === 'large' ? '0.5rem' : '0.375rem'
                  }}
                >
                  View Inventory
                </button>
                <button
                  className={`px-6 py-2 border ${
                    theme.buttonStyle === 'pill' ? 'rounded-full' :
                    theme.buttonStyle === 'square' ? 'rounded-none' : 'rounded'
                  }`}
                  style={{
                    borderColor: theme.secondaryColor,
                    color: theme.secondaryColor,
                    borderRadius: theme.borderRadius === 'none' ? '0' :
                                theme.borderRadius === 'small' ? '0.25rem' :
                                theme.borderRadius === 'large' ? '0.5rem' : '0.375rem'
                  }}
                >
                  Contact Us
                </button>
              </div>

              {/* Card Preview */}
              <div
                className="mt-6 p-4 border rounded"
                style={{
                  borderColor: theme.secondaryColor,
                  borderRadius: theme.borderRadius === 'none' ? '0' :
                              theme.borderRadius === 'small' ? '0.25rem' :
                              theme.borderRadius === 'large' ? '0.5rem' : '0.375rem'
                }}
              >
                <h5 className="font-semibold mb-2" style={{ color: theme.primaryColor }}>
                  Featured Car
                </h5>
                <p className="text-sm mb-2">2020 Toyota Camry</p>
                <span
                  className="inline-block px-2 py-1 text-xs rounded"
                  style={{ backgroundColor: theme.accentColor, color: theme.textColor }}
                >
                  Available
                </span>
              </div>
            </div>

            {/* Footer Preview */}
            <div
              className="p-4 border-t text-center text-sm"
              style={{ backgroundColor: theme.footerBgColor }}
            >
              © 2025 Enuel Motors. All rights reserved.
            </div>
          </div>
        </div>
      ) : (
        /* Theme Editor */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Color Palette</h2>

              {/* Color Presets */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="p-3 border border-gray-200 rounded hover:border-gray-300 text-left"
                    >
                      <div className="flex space-x-2 mb-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.secondary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.accent }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex space-x-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Primary color picker"
                      />
                      <input
                        type="text"
                        title="Primary color hex value"
                        value={theme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex space-x-2">
                      <input
                        id="secondary-color"
                        type="color"
                        value={theme.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Secondary color picker"
                      />
                      <input
                        type="text"
                        title="Secondary color hex value"
                        value={theme.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex space-x-2">
                    <input
                      id="accent-color"
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Accent color picker"
                    />
                    <input
                      type="text"
                      title="Accent color hex value"
                      value={theme.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="background-color" className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                    <div className="flex space-x-2">
                      <input
                        id="background-color"
                        type="color"
                        value={theme.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Background color picker"
                      />
                      <input
                        type="text"
                        title="Background color hex value"
                        value={theme.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <div className="flex space-x-2">
                      <input
                        id="text-color"
                        type="color"
                        value={theme.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Text color picker"
                      />
                      <input
                        type="text"
                        title="Text color hex value"
                        value={theme.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Layout & Typography</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="button-style-select" className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
                  <select
                    id="button-style-select"
                    title="Button style"
                    value={theme.buttonStyle}
                    onChange={(e) => handleColorChange('buttonStyle', e.target.value as ThemeSettings['buttonStyle'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="font-family-select" className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    id="font-family-select"
                    title="Font family"
                    value={theme.fontFamily}
                    onChange={(e) => handleColorChange('fontFamily', e.target.value as ThemeSettings['fontFamily'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="border-radius-select" className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                  <select
                    id="border-radius-select"
                    title="Border radius"
                    value={theme.borderRadius}
                    onChange={(e) => handleColorChange('borderRadius', e.target.value as ThemeSettings['borderRadius'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Header & Footer</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="header-bg-color" className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
                  <div className="flex space-x-2">
                    <input
                      id="header-bg-color"
                      type="color"
                      value={theme.headerBgColor}
                      onChange={(e) => handleColorChange('headerBgColor', e.target.value)}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Header background color picker"
                      placeholder="#ffffff"
                    />
                    <input
                      type="text"
                      value={theme.headerBgColor}
                      onChange={(e) => handleColorChange('headerBgColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      title="Header background hex value"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="footer-bg-color" className="block text-sm font-medium text-gray-700 mb-2">Footer Background</label>
                  <div className="flex space-x-2">
                    <input
                      id="footer-bg-color"
                      type="color"
                      value={theme.footerBgColor}
                      onChange={(e) => handleColorChange('footerBgColor', e.target.value)}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Footer background color picker"
                      placeholder="#f9fafb"
                    />
                    <input
                      type="text"
                      value={theme.footerBgColor}
                      onChange={(e) => handleColorChange('footerBgColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      title="Footer background hex value"
                      placeholder="#f9fafb"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Export/Import */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Theme Management</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                  📤 Export Theme Settings
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                  📥 Import Theme Settings
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                  💾 Save as Template
                </button>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high contrast colors for better accessibility</li>
                <li>• Test your theme on different devices</li>
                <li>• Consider your brand colors when choosing palette</li>
                <li>• Preview changes before applying to live site</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}