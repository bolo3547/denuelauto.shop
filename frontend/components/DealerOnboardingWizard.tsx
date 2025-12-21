'use client';

import React, { useState, useMemo } from 'react';
import { trackEvent } from '../utils/analytics';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateDealerPrice } from '../lib/pricing';
import { BASE_PRICES } from '../lib/dealerConstants';
import { DealerPayload } from '../types/dealer';
import ThemePreview from '@/components/ThemePreview';
import { TenantTheme } from '@/types/dealer';

interface BusinessInfo {
  name: string;
  country: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  businessType: 'local' | 'exporter';
  branchesCount?: number;
  slug: string;
  baseCurrency: string;
}

interface SalesProfile {
  exporter: boolean;
  currencyMode: 'local' | 'usd' | 'both';
  customersFrom: string[];
  mobileMoney: string[];
}

interface ExportProfile {
  ports: string[];
  paymentMethods: string[];
}

interface DealerSiteSettings {
  theme: {
    palette: string;
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
    backgroundColor?: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  sections: {
    showHowToBuy: boolean;
    showWhyChooseUs: boolean;
    showTestimonials: boolean;
  };
  listing: {
    defaultView: 'grid' | 'list';
    showPrices: boolean;
  };
  brandTone: string;
}

const pricingPlans = [
  {
    code: 'starter' as const,
    name: 'Starter Dealer',
    description: 'For small yards and solo dealers.',
    price: 'From K1,200 / month',
    limits: 'Up to ~50 cars in stock, 1 branch, No export module by default',
    features: ['Inventory & photos', 'Leads & proformas', 'Basic reporting'],
  },
  {
    code: 'growth' as const,
    name: 'Growth Dealer',
    description: 'For growing and multi-branch dealerships.',
    price: 'From K2,500 / month',
    limits: 'Up to ~150 cars in stock, Multiple branches, Optional exporter module',
    features: ['Everything in Starter', 'Multi-user support', 'Agents & commissions', 'Buyer portal'],
  },
  {
    code: 'export' as const,
    name: 'Export Dealer',
    description: 'For full exporters using ports.',
    price: 'From K4,000 / month',
    limits: 'Exporter YES, Ports like Dar / Durban / Walvis',
    features: ['Everything in Growth', 'Export & shipping (FOB/CIF)', 'Ports & CIF rules', 'Shipping documents (PI, Invoice, Packing List)'],
  },
];

async function createDealerTenant(payload: DealerPayload) {
  try {
    const res = await fetch('/api/tenants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Failed to create tenant');
    }
    const body = await res.json();
    return { ok: true, tenantId: body.tenant?.id || body.tenantId || 'unknown', slug: body.tenant?.slug || body.slug || '' } as any;
  } catch (err) {
    console.error('createDealerTenant error', err);
    return { ok: false, tenantId: '' } as any;
  }
}

export default function DealerOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    country: '',
    city: '',
    phone: '',
    whatsapp: '',
    email: '',
    businessType: 'local',
    slug: '',
    baseCurrency: 'USD',
  });
  const [salesProfile, setSalesProfile] = useState<SalesProfile>({
    exporter: false,
    currencyMode: 'both',
    customersFrom: [],
    mobileMoney: [],
  });
  const [exportProfile, setExportProfile] = useState<ExportProfile>({
    ports: [],
    paymentMethods: [],
  });
  const [dealerSiteSettings, setDealerSiteSettings] = useState<DealerSiteSettings>({
    theme: {
      palette: 'Deep Blue + Gold',
      primaryColor: '#0F3D91',
      accentColor: '#FFD700',
    },
    hero: {
      title: 'Find your next import car.',
      subtitle: 'Quality used vehicles imported for Africa.',
    },
    sections: {
      showHowToBuy: true,
      showWhyChooseUs: true,
      showTestimonials: true,
    },
    listing: {
      defaultView: 'grid',
      showPrices: true,
    },
    brandTone: 'Professional',
  });
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'export'>('starter');
  const [onboardingPriority, setOnboardingPriority] = useState('');
  const [initialStockVolume, setInitialStockVolume] = useState('');
  const [features, setFeatures] = useState({
    agentsEnabled: true,
    buyerPortalEnabled: true,
    serviceEnabled: false,
    favouritesEnabled: true,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string | number) => {
    setBusinessInfo(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value as string);
      }
      if (field === 'country') {
        updated.baseCurrency = value === 'Zambia' ? 'ZMW' : 'USD';
      }
      return updated;
    });
  };

  const handleSalesProfileChange = (field: keyof SalesProfile, value: any) => {
    setSalesProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleExportProfileChange = (field: keyof ExportProfile, value: any) => {
    setExportProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleDealerSiteSettingsChange = (field: string, value: any) => {
    if (field === 'theme' && value.palette) {
      // Set colors based on palette
      let primaryColor = '#0F3D91';
      let accentColor = '#FFD700';
      let backgroundColor = '#ffffff';
      
      switch (value.palette) {
        case 'Deep Blue + Gold':
          primaryColor = '#0F3D91';
          accentColor = '#FFD700';
          break;
        case 'Charcoal + Orange':
          primaryColor = '#374151';
          accentColor = '#F97316';
          break;
        case 'White + Navy Minimalist':
          primaryColor = '#1e3a8a';
          accentColor = '#ffffff';
          break;
        case 'BE FORWARD':
          primaryColor = '#FF7900';
          accentColor = '#FFB020';
          break;
        case 'SBT Japan':
          primaryColor = '#1E3A8A';
          accentColor = '#3B82F6';
          break;
        case 'AUTOCOM Japan':
          primaryColor = '#DC2626';
          accentColor = '#EF4444';
          break;
        case 'Forest Green + Cream':
          primaryColor = '#166534';
          accentColor = '#FEF3C7';
          break;
        case 'Royal Purple + Silver':
          primaryColor = '#7C3AED';
          accentColor = '#E5E7EB';
          break;
        case 'Crimson Red + White':
          primaryColor = '#DC2626';
          accentColor = '#FFFFFF';
          break;
        case 'Teal + Coral':
          primaryColor = '#0D9488';
          accentColor = '#FF7F50';
          break;
        case 'Indigo + Yellow':
          primaryColor = '#4338CA';
          accentColor = '#FACC15';
          break;
        case 'Emerald + Gold':
          primaryColor = '#059669';
          accentColor = '#F59E0B';
          break;
        case 'Slate Gray + Lime':
          primaryColor = '#64748B';
          accentColor = '#84CC16';
          break;
        case 'Maroon + Beige':
          primaryColor = '#7F1D1D';
          accentColor = '#F5F5DC';
          break;
        case 'Ocean Blue + Peach':
          primaryColor = '#0369A1';
          accentColor = '#FDBCB4';
          break;
      }
      
      value.primaryColor = primaryColor;
      value.accentColor = accentColor;
      value.backgroundColor = backgroundColor;
    }
    
    setDealerSiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const getRecommendedPlan = () => {
    if (salesProfile.exporter) return 'export';
    if (initialStockVolume === '51–150' || initialStockVolume === '150+') return 'growth';
    return 'starter';
  };

  const pricingSummary = useMemo(() => {
    return calculateDealerPrice({
      planCode: selectedPlan,
      country: businessInfo.country,
      branchesCount: businessInfo.branchesCount || 1,
      exporter: salesProfile.exporter,
      initialStockVolume,
      features,
    });
  }, [selectedPlan, businessInfo.country, businessInfo.branchesCount, salesProfile.exporter, initialStockVolume, features]);

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return businessInfo.name && businessInfo.country && businessInfo.city && businessInfo.phone && businessInfo.email;
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional
      case 4:
        return selectedPlan && onboardingPriority && initialStockVolume && acceptTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!isStepValid(4)) return;

    setIsSubmitting(true);
    const payload: DealerPayload = {
      tenant: {
        name: businessInfo.name,
        slug: businessInfo.slug,
        country: businessInfo.country,
        city: businessInfo.city,
        phone: businessInfo.phone,
        whatsapp: businessInfo.whatsapp,
        email: businessInfo.email,
        branchesCount: businessInfo.branchesCount || 1,
      },
      modules: {
        carDealer: true,
        exporter: salesProfile.exporter,
        agents: features.agentsEnabled,
        buyerPortal: features.buyerPortalEnabled,
        serviceCenter: features.serviceEnabled,
        publicSite: true,
      },
      dealerSiteSettings: {
        name: businessInfo.name,
        logoUrl: dealerSiteSettings.theme.logoUrl,
        primaryColor: dealerSiteSettings.theme.primaryColor,
        secondaryColor: dealerSiteSettings.theme.primaryColor, // fallback
        accentColor: dealerSiteSettings.theme.accentColor,
        backgroundColor: dealerSiteSettings.theme.backgroundColor || '#ffffff',
        country: businessInfo.country,
        baseCurrency: businessInfo.baseCurrency as 'ZMW' | 'USD',
        contactInfo: {
          address: businessInfo.city,
          phone: businessInfo.phone,
          whatsapp: businessInfo.whatsapp,
          email: businessInfo.email,
        },
        heroTitle: dealerSiteSettings.hero.title,
        heroSubtitle: dealerSiteSettings.hero.subtitle,
        // Normalize brandTone values such as "Very Formal" to 'formal' for consistent back-end schema
        brandTone: (dealerSiteSettings.brandTone.toLowerCase().includes('formal') ? 'formal' : dealerSiteSettings.brandTone.toLowerCase()) as 'formal' | 'professional' | 'friendly',
        export: {
          enabled: salesProfile.exporter,
        },
        sections: dealerSiteSettings.sections,
        listing: dealerSiteSettings.listing,
      },
      exportSettings: {
        enabled: salesProfile.exporter,
        ports: exportProfile.ports,
        currencyMode: salesProfile.currencyMode.toUpperCase() as 'LOCAL' | 'USD' | 'BOTH',
      },
      paymentSettings: {
        mobileMoney: salesProfile.mobileMoney,
        acceptedMethods: exportProfile.paymentMethods,
      },
      onboardingPriority,
      initialStockVolume,
      brandTone: dealerSiteSettings.brandTone,
      selectedPlan: {
        code: selectedPlan,
        name: pricingPlans.find(p => p.code === selectedPlan)?.name || '',
        billingPeriod: 'monthly',
      },
      billingSummary: pricingSummary,
    };

    try {
      const result = await createDealerTenant(payload);
      if (result.ok) {
        // remember tenant slug locally so future visits default to this tenant
        const slugToStore = result.slug || payload.tenant.slug;
        try {
          localStorage.setItem('lastTenantSlug', slugToStore);
        } catch (e) {
          // ignore storage failures
        }
        try {
          trackEvent('tenant_created', { slug: slugToStore, plan: selectedPlan });
        } catch (err) {
          // ignore analytics errors
        }
        setSubmitted(true);
        // Redirect the user to their public tenant site after creation
        try {
          // small delay so the user sees the submitted state briefly
          setTimeout(() => {
            router.push(`/t/${slugToStore}`);
          }, 800);
        } catch (err) {
          console.error('Redirect after tenant creation failed', err);
        }
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Denuel Auto system is ready!</h2>
          <p className="text-gray-600 mb-6">Plan: {pricingPlans.find(p => p.code === selectedPlan)?.name}</p>
          <p className="text-sm text-gray-500 mb-6">URL: https://{businessInfo.slug}.denuel.app</p>
          <div className="space-y-3">
            <button onClick={() => router.push('/admin')} className="w-full bg-[#0F3D91] text-white py-2 px-4 rounded-lg hover:bg-[#0D3A7A] transition">
              Go to Back Office
            </button>
            <button
              onClick={() => {
                try {
                  const themeForPreview = {
                    name: businessInfo.name || businessInfo.slug,
                    logoUrl: dealerSiteSettings.theme.logoUrl,
                    primaryColor: dealerSiteSettings.theme.primaryColor,
                    accentColor: dealerSiteSettings.theme.accentColor,
                    backgroundColor: dealerSiteSettings.theme.backgroundColor || '#ffffff',
                    country: businessInfo.country,
                    baseCurrency: businessInfo.baseCurrency,
                    phone: businessInfo.phone,
                    whatsapp: businessInfo.whatsapp,
                    email: businessInfo.email,
                    location: businessInfo.city,
                    heroTitle: dealerSiteSettings.hero.title,
                    heroSubtitle: dealerSiteSettings.hero.subtitle,
                    brandTone: dealerSiteSettings.brandTone.toLowerCase().includes('formal') ? 'formal' : dealerSiteSettings.brandTone.toLowerCase(),
                    sections: dealerSiteSettings.sections,
                    listing: dealerSiteSettings.listing,
                  } as unknown as TenantTheme;
                  const encoded = encodeURIComponent(btoa(JSON.stringify(themeForPreview)));
                  const url = `/t/${businessInfo.slug}/preview?workTheme=${encoded}`;
                  window.open(url, '_blank');
                } catch (err) {
                  console.error('Preview failed', err);
                  router.push(`/t/${businessInfo.slug}`);
                }
              }}
              className="w-full border border-[#0F3D91] text-[#0F3D91] py-2 px-4 rounded-lg hover:bg-[#F7F8FC] transition"
            >
              View Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-4xl w-full">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-[#0F3D91] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-[#0F3D91]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStep === 1 && 'Business Basics'}
            {currentStep === 2 && 'Sales & Geography'}
            {currentStep === 3 && 'Website Look & Brand Tone'}
            {currentStep === 4 && 'Plan, Features & Confirmation'}
          </h1>
          <p className="text-gray-600">
            {currentStep === 1 && 'Tell us about your dealership'}
            {currentStep === 2 && 'Configure your sales and export settings'}
            {currentStep === 3 && 'Customize your public website'}
            {currentStep === 4 && 'Choose your plan and finalize setup'}
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="dealer-name" className="block text-sm font-medium text-gray-700 mb-1">Dealership Name <span aria-hidden className="text-red-500">*</span></label>
                <input
                    id="dealer-name"
                     aria-label="Dealership Name"
                    type="text"
                  value={businessInfo.name}
                  onChange={e => handleBusinessInfoChange('name', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                  placeholder="e.g. ABC Motors"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country <span aria-hidden className="text-red-500">*</span></label>
                <select
                  id="country"
                   aria-label="Country"
                  value={businessInfo.country}
                  onChange={e => handleBusinessInfoChange('country', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                >
                  <option value="">Select country</option>
                  <option>Zambia</option>
                  <option>Zimbabwe</option>
                  <option>Malawi</option>
                  <option>Tanzania</option>
                  <option>Kenya</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City / Town <span aria-hidden className="text-red-500">*</span></label>
                <input
                  id="city"
                   aria-label="City / Town"
                  type="text"
                  value={businessInfo.city}
                  onChange={e => handleBusinessInfoChange('city', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span aria-hidden className="text-red-500">*</span></label>
                <input
                  id="phone"
                   aria-label="Phone Number"
                  type="tel"
                  value={businessInfo.phone}
                  onChange={e => handleBusinessInfoChange('phone', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  id="whatsapp"
                   aria-label="WhatsApp Number"
                  type="tel"
                  value={businessInfo.whatsapp}
                  onChange={e => handleBusinessInfoChange('whatsapp', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span aria-hidden className="text-red-500">*</span></label>
                <input
                  id="email"
                  aria-label="Email"
                  type="email"
                  value={businessInfo.email}
                  onChange={e => handleBusinessInfoChange('email', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                />
              </div>
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Business Type *</legend>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="local"
                    checked={businessInfo.businessType === 'local'}
                    onChange={e => handleBusinessInfoChange('businessType', e.target.value)}
                    className="mr-2"
                    aria-labelledby="business-type-local-label"
                  />
                  <span id="business-type-local-label">Local Car Dealer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="exporter"
                    checked={businessInfo.businessType === 'exporter'}
                    onChange={e => handleBusinessInfoChange('businessType', e.target.value)}
                    className="mr-2"
                    aria-labelledby="business-type-exporter-label"
                  />
                  <span id="business-type-exporter-label">Car Dealer + Exporter</span>
                </label>
              </div>
            </fieldset>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of branches (optional)</label>
              <select
                value={businessInfo.branchesCount || ''}
                onChange={e => {
                  const parsed = parseInt(e.target.value, 10);
                  handleBusinessInfoChange('branchesCount', Number.isNaN(parsed) ? '' : parsed);
                }}
                title="Number of branches"
                id="branches-count-select"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
              >
                <option value="">Select</option>
                <option value="1">1 branch</option>
                <option value="2">2–3 branches</option>
                <option value="4">4+ branches</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Do you export vehicles?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="exporter"
                    value="yes"
                    checked={salesProfile.exporter}
                    onChange={() => handleSalesProfileChange('exporter', true)}
                    className="mr-2"
                    disabled={businessInfo.businessType === 'exporter'}
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="exporter"
                    value="no"
                    checked={!salesProfile.exporter}
                    onChange={() => handleSalesProfileChange('exporter', false)}
                    className="mr-2"
                    disabled={businessInfo.businessType === 'exporter'}
                  />
                  No
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main currency mode</label>
              <select
                value={salesProfile.currencyMode}
                onChange={e => handleSalesProfileChange('currencyMode', e.target.value)}
                title="Currency mode"
                id="currency-mode-select"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
              >
                <option value="local">Local currency only</option>
                <option value="usd">USD only</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customers mainly from (multi-select)</label>
              <div className="space-y-2">
                {['Zambia', 'Other African countries', 'Outside Africa'].map(country => (
                  <label key={country} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={salesProfile.customersFrom.includes(country)}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...salesProfile.customersFrom, country]
                          : salesProfile.customersFrom.filter(c => c !== country);
                        handleSalesProfileChange('customersFrom', updated);
                      }}
                      className="mr-2"
                    />
                    {country}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money acceptance (optional)</label>
              <div className="space-y-2">
                {['MTN Money', 'Airtel Money'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={salesProfile.mobileMoney.includes(method)}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...salesProfile.mobileMoney, method]
                          : salesProfile.mobileMoney.filter(m => m !== method);
                        handleSalesProfileChange('mobileMoney', updated);
                      }}
                      className="mr-2"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            {salesProfile.exporter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ports (multi-select)</label>
                  <div className="space-y-2">
                    {['Dar es Salaam', 'Durban', 'Walvis Bay', 'Other'].map(port => (
                      <label key={port} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportProfile.ports.includes(port)}
                          onChange={e => {
                            const updated = e.target.checked
                              ? [...exportProfile.ports, port]
                              : exportProfile.ports.filter(p => p !== port);
                            handleExportProfileChange('ports', updated);
                          }}
                          className="mr-2"
                        />
                        {port}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accepted payment methods</label>
                  <div className="space-y-2">
                    {['Bank transfer', 'Mobile Money (MTN)', 'Mobile Money (Airtel)', 'Cash at Yard', 'Other'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportProfile.paymentMethods.includes(method)}
                          onChange={e => {
                            const updated = e.target.checked
                              ? [...exportProfile.paymentMethods, method]
                              : exportProfile.paymentMethods.filter(m => m !== method);
                            handleExportProfileChange('paymentMethods', updated);
                          }}
                          className="mr-2"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
              <input
                type="url"
                value={dealerSiteSettings.theme.logoUrl || ''}
                onChange={e => handleDealerSiteSettingsChange('theme', { ...dealerSiteSettings.theme, logoUrl: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme palette</label>
              <select
                value={dealerSiteSettings.theme.palette}
                onChange={e => handleDealerSiteSettingsChange('theme', { ...dealerSiteSettings.theme, palette: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                title="Theme palette"
              >
                <option>Deep Blue + Gold</option>
                <option>Charcoal + Orange</option>
                <option>White + Navy Minimalist</option>
                <option>BE FORWARD</option>
                <option>SBT Japan</option>
                <option>AUTOCOM Japan</option>
                <option>Forest Green + Cream</option>
                <option>Royal Purple + Silver</option>
                <option>Crimson Red + White</option>
                <option>Teal + Coral</option>
                <option>Indigo + Yellow</option>
                <option>Emerald + Gold</option>
                <option>Slate Gray + Lime</option>
                <option>Maroon + Beige</option>
                <option>Ocean Blue + Peach</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home hero headline (optional)</label>
                <input
                  type="text"
                  value={dealerSiteSettings.hero.title}
                  onChange={e => handleDealerSiteSettingsChange('hero', { ...dealerSiteSettings.hero, title: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                  title="Hero headline"
                  placeholder="e.g. Japanese Used Cars - Direct Import"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home hero subheadline (optional)</label>
                <input
                  type="text"
                  value={dealerSiteSettings.hero.subtitle}
                  onChange={e => handleDealerSiteSettingsChange('hero', { ...dealerSiteSettings.hero, subtitle: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                  title="Hero subheadline"
                  placeholder="e.g. Quality pre-owned vehicles with full export documentation"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website brand tone</label>
              <select
                value={dealerSiteSettings.brandTone}
                onChange={e => handleDealerSiteSettingsChange('brandTone', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                title="Website brand tone"
              >
                <option>Very Formal</option>
                <option>Professional</option>
                <option>Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
              <select
                value={dealerSiteSettings.theme?.primaryColor ? (dealerSiteSettings.theme as any).font || 'Inter' : 'Inter'}
                onChange={e => handleDealerSiteSettingsChange('theme', { ...dealerSiteSettings.theme, font: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                title="Website font"
              >
                <option value="Inter">Inter (Default)</option>
                <option value="Merriweather">Merriweather (Formal)</option>
                <option value="Nunito">Nunito (Friendly)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              {/* Quick visual preview of current settings */}
              <div className="p-2 bg-gray-50 rounded">
                <ThemePreview theme={{
                  name: businessInfo.name || 'Dealer name',
                  slogan: dealerSiteSettings.hero.subtitle,
                  theme: dealerSiteSettings.theme,
                  primaryColor: dealerSiteSettings.theme.primaryColor,
                  accentColor: dealerSiteSettings.theme.accentColor,
                  brandTone: dealerSiteSettings.brandTone.toLowerCase().includes('formal') ? 'formal' : dealerSiteSettings.brandTone.toLowerCase(),
                } as unknown as TenantTheme} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Public website sections</label>
              <div className="space-y-2">
                {[
                  { key: 'showHowToBuy', label: 'Show "How to Buy"' },
                  { key: 'showWhyChooseUs', label: 'Show "Why Choose Us"' },
                  { key: 'showTestimonials', label: 'Show Testimonials' },
                ].map(section => (
                  <label key={section.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dealerSiteSettings.sections[section.key as keyof typeof dealerSiteSettings.sections]}
                      onChange={e => handleDealerSiteSettingsChange('sections', { ...dealerSiteSettings.sections, [section.key]: e.target.checked })}
                      className="mr-2"
                    />
                    {section.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing preferences</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Default view</label>
                  <select
                    value={dealerSiteSettings.listing.defaultView}
                    onChange={e => handleDealerSiteSettingsChange('listing', { ...dealerSiteSettings.listing, defaultView: e.target.value as 'grid' | 'list' })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                    title="Default listing view"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Show prices publicly</label>
                  <select
                    value={dealerSiteSettings.listing.showPrices ? 'yes' : 'no'}
                    onChange={e => handleDealerSiteSettingsChange('listing', { ...dealerSiteSettings.listing, showPrices: e.target.value === 'yes' })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
                    title="Show prices publicly"
                  >
                    <option value="yes">Yes (show prices)</option>
                    <option value="no">No (hide prices, show "Inquire for price")</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Pricing Plans */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {pricingPlans.map(plan => (
                  <div
                    key={plan.code}
                    className={`cursor-pointer transition border-2 rounded-2xl p-4 ${
                      selectedPlan === plan.code ? 'border-[#0F3D91] bg-blue-50' : 'border-gray-200'
                    } ${getRecommendedPlan() === plan.code ? 'ring-2 ring-[#FFD700]' : ''}`}
                    onClick={() => setSelectedPlan(plan.code)}
                  >
                    {getRecommendedPlan() === plan.code && (
                      <div className="bg-[#FFD700] text-[#0F3D91] text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                        Recommended
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    <p className="text-lg font-bold text-[#0F3D91] mb-2">{plan.price}</p>
                    <ul className="text-sm space-y-1">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* What matters most */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What is MOST important to your dealership right now? *</label>
              <div className="space-y-2">
                {[
                  'Getting more online leads',
                  'Managing stock & photos',
                  'Issuing proformas and receipts',
                  'Managing exports & port shipments',
                  'Managing agents & commissions',
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value={option}
                      checked={onboardingPriority === option}
                      onChange={e => setOnboardingPriority(e.target.value)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Stock volume */}
            <div>
              <label htmlFor="initialStockVolume" className="block text-sm font-medium text-gray-700 mb-2">How many vehicles do you usually keep in stock? *</label>
              <select
                id="initialStockVolume"
                value={initialStockVolume}
                onChange={e => setInitialStockVolume(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F3D91]"
              >
                <option value="">Select</option>
                <option>1–20</option>
                <option>21–50</option>
                <option>51–150</option>
                <option>150+</option>
              </select>
            </div>

            {/* Feature toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feature Modules</label>
              <div className="space-y-2">
                {[
                  { key: 'agentsEnabled', label: 'Enable agents & commission module' },
                  { key: 'buyerPortalEnabled', label: 'Enable buyer portal for customers' },
                  { key: 'serviceEnabled', label: 'Enable service/workshop module' },
                  { key: 'favouritesEnabled', label: 'Enable favourites/wishlist on public site' },
                ].map(feature => (
                  <label key={feature.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features[feature.key as keyof typeof features]}
                      onChange={e => setFeatures(prev => ({ ...prev, [feature.key]: e.target.checked }))}
                      className="mr-2"
                    />
                    {feature.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Pricing Summary</h4>
              <div className="space-y-1 text-sm">
                {pricingSummary.lines.map((line, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{line.label}</span>
                    <span>{pricingSummary.currency} {line.amount}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total / month</span>
                  <span>{pricingSummary.currency} {pricingSummary.total}</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">I accept the Terms & Conditions and Privacy Policy. *</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sendUpdates}
                  onChange={e => setSendUpdates(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Send me updates and onboarding tips on email/WhatsApp.</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="flex items-center px-4 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#0D3A7A] transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid(4) || isSubmitting}
              className="flex items-center px-6 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#0D3A7A] transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create my dealership system'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}