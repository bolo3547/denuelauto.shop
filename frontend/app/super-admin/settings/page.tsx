'use client';

import React, { useState } from 'react';
import {
  FaCog,
  FaShieldAlt,
  FaBell,
  FaEnvelope,
  FaDatabase,
  FaPalette,
  FaGlobe,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaKey,
  FaCreditCard,
  FaServer,
  FaCloudUploadAlt
} from 'react-icons/fa';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General
    platformName: 'Denuel Auto HQ',
    supportEmail: 'support@denuelauto.com',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    // Security
    twoFactorRequired: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    // Notifications
    emailNotifications: true,
    slackIntegration: false,
    webhookUrl: '',
    alertOnNewTenant: true,
    alertOnLargePayment: true,
    largePaymentThreshold: 10000,
    // Payments
    stripeEnabled: true,
    paypalEnabled: true,
    momoEnabled: true,
    paymentFeePercent: 2.5,
    // System
    maintenanceMode: false,
    debugMode: false,
    logRetentionDays: 90,
    backupFrequency: 'daily'
  });

  const sections: SettingsSection[] = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'payments', label: 'Payment Gateway', icon: FaCreditCard },
    { id: 'system', label: 'System', icon: FaServer }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = 'text',
    placeholder,
    helpText
  }: { 
    label: string; 
    value: string | number; 
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    helpText?: string;
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );

  const SelectField = ({
    label,
    value,
    onChange,
    options
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const ToggleField = ({
    label,
    description,
    value,
    onChange
  }: {
    label: string;
    description?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure global platform settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <nav className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaCog className="w-5 h-5 text-gray-400" />
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Basic platform configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Platform Name"
                    value={settings.platformName}
                    onChange={(v) => setSettings({ ...settings, platformName: v })}
                  />
                  <InputField
                    label="Support Email"
                    value={settings.supportEmail}
                    onChange={(v) => setSettings({ ...settings, supportEmail: v })}
                    type="email"
                  />
                  <SelectField
                    label="Default Currency"
                    value={settings.defaultCurrency}
                    onChange={(v) => setSettings({ ...settings, defaultCurrency: v })}
                    options={[
                      { value: 'USD', label: 'US Dollar (USD)' },
                      { value: 'EUR', label: 'Euro (EUR)' },
                      { value: 'GBP', label: 'British Pound (GBP)' },
                      { value: 'JPY', label: 'Japanese Yen (JPY)' }
                    ]}
                  />
                  <SelectField
                    label="Default Language"
                    value={settings.defaultLanguage}
                    onChange={(v) => setSettings({ ...settings, defaultLanguage: v })}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'fr', label: 'French' },
                      { value: 'ja', label: 'Japanese' },
                      { value: 'sw', label: 'Swahili' }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaShieldAlt className="w-5 h-5 text-gray-400" />
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage authentication and security policies</p>
                </div>

                <div className="divide-y divide-gray-100">
                  <ToggleField
                    label="Require Two-Factor Authentication"
                    description="Require 2FA for all admin users"
                    value={settings.twoFactorRequired}
                    onChange={(v) => setSettings({ ...settings, twoFactorRequired: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InputField
                    label="Session Timeout (minutes)"
                    value={settings.sessionTimeout}
                    onChange={(v) => setSettings({ ...settings, sessionTimeout: parseInt(v) || 30 })}
                    type="number"
                    helpText="Auto-logout after inactivity"
                  />
                  <InputField
                    label="Max Login Attempts"
                    value={settings.maxLoginAttempts}
                    onChange={(v) => setSettings({ ...settings, maxLoginAttempts: parseInt(v) || 5 })}
                    type="number"
                    helpText="Before account lockout"
                  />
                  <InputField
                    label="Minimum Password Length"
                    value={settings.passwordMinLength}
                    onChange={(v) => setSettings({ ...settings, passwordMinLength: parseInt(v) || 8 })}
                    type="number"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <FaKey className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">API Keys</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Manage API keys and access tokens in the Developer Portal
                      </p>
                      <button className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900">
                        Go to Developer Portal →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaBell className="w-5 h-5 text-gray-400" />
                    Notification Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure alerts and notifications</p>
                </div>

                <div className="divide-y divide-gray-100">
                  <ToggleField
                    label="Email Notifications"
                    description="Receive important alerts via email"
                    value={settings.emailNotifications}
                    onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
                  />
                  <ToggleField
                    label="Slack Integration"
                    description="Send notifications to Slack channel"
                    value={settings.slackIntegration}
                    onChange={(v) => setSettings({ ...settings, slackIntegration: v })}
                  />
                  <ToggleField
                    label="Alert on New Tenant"
                    description="Get notified when a new tenant signs up"
                    value={settings.alertOnNewTenant}
                    onChange={(v) => setSettings({ ...settings, alertOnNewTenant: v })}
                  />
                  <ToggleField
                    label="Alert on Large Payments"
                    description="Get notified for payments above threshold"
                    value={settings.alertOnLargePayment}
                    onChange={(v) => setSettings({ ...settings, alertOnLargePayment: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InputField
                    label="Webhook URL"
                    value={settings.webhookUrl}
                    onChange={(v) => setSettings({ ...settings, webhookUrl: v })}
                    placeholder="https://..."
                    helpText="Receive events via webhook"
                  />
                  <InputField
                    label="Large Payment Threshold ($)"
                    value={settings.largePaymentThreshold}
                    onChange={(v) => setSettings({ ...settings, largePaymentThreshold: parseInt(v) || 10000 })}
                    type="number"
                  />
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeSection === 'payments' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaCreditCard className="w-5 h-5 text-gray-400" />
                    Payment Gateway Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure payment methods and fees</p>
                </div>

                <div className="divide-y divide-gray-100">
                  <ToggleField
                    label="Stripe Payments"
                    description="Accept credit/debit card payments via Stripe"
                    value={settings.stripeEnabled}
                    onChange={(v) => setSettings({ ...settings, stripeEnabled: v })}
                  />
                  <ToggleField
                    label="PayPal Payments"
                    description="Accept payments via PayPal"
                    value={settings.paypalEnabled}
                    onChange={(v) => setSettings({ ...settings, paypalEnabled: v })}
                  />
                  <ToggleField
                    label="Mobile Money (MoMo)"
                    description="Accept mobile money payments (Africa)"
                    value={settings.momoEnabled}
                    onChange={(v) => setSettings({ ...settings, momoEnabled: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InputField
                    label="Platform Fee (%)"
                    value={settings.paymentFeePercent}
                    onChange={(v) => setSettings({ ...settings, paymentFeePercent: parseFloat(v) || 2.5 })}
                    type="number"
                    helpText="Fee charged on each transaction"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <FaCreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Payment Provider Credentials</p>
                      <p className="text-sm text-blue-700 mt-1">
                        API keys and secrets are stored securely. Contact support to update credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaServer className="w-5 h-5 text-gray-400" />
                    System Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Advanced system configuration</p>
                </div>

                <div className="divide-y divide-gray-100">
                  <ToggleField
                    label="Maintenance Mode"
                    description="Put the platform in maintenance mode (tenants will see maintenance page)"
                    value={settings.maintenanceMode}
                    onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                  />
                  <ToggleField
                    label="Debug Mode"
                    description="Enable detailed error logging (not recommended for production)"
                    value={settings.debugMode}
                    onChange={(v) => setSettings({ ...settings, debugMode: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InputField
                    label="Log Retention (days)"
                    value={settings.logRetentionDays}
                    onChange={(v) => setSettings({ ...settings, logRetentionDays: parseInt(v) || 90 })}
                    type="number"
                    helpText="Days to keep system logs"
                  />
                  <SelectField
                    label="Backup Frequency"
                    value={settings.backupFrequency}
                    onChange={(v) => setSettings({ ...settings, backupFrequency: v })}
                    options={[
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' }
                    ]}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <FaDatabase className="w-4 h-4 mr-2" />
                    Run Backup Now
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <FaCloudUploadAlt className="w-4 h-4 mr-2" />
                    Clear Cache
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <FaServer className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">⚠️ Maintenance Mode Active</p>
                        <p className="text-sm text-red-700 mt-1">
                          The platform is currently in maintenance mode. All tenant sites are showing the maintenance page.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
