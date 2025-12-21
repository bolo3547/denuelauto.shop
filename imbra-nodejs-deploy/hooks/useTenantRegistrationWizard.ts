"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  BrandingStep,
  BusinessContactStep,
  OperationalProfileStep,
  PaymentStep,
  PricingBreakdown,
  PricingStep,
} from '@/types/tenantRegistration';
import { calculateTenantPricing } from '@/lib/tenantPricing';

const STORAGE_KEY = 'tenant-registration-wizard-v1';

const defaultBusiness: BusinessContactStep = {
  businessName: '',
  country: 'Zambia',
  city: '',
  businessType: 'dealer',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

const defaultOperations: OperationalProfileStep = {
  expectedListings: 20,
  expectedSales: undefined,
  staffCount: 5,
  multiBranch: false,
  branchCount: 1,
  requiredModules: {
    cifCalculator: false,
    onlinePayments: false,
    whatsappIntegration: false,
    customerAccounts: true,
    apiAccess: false,
    multiWarehouse: false,
  },
};

const defaultBranding: BrandingStep = {
  themePreset: 'BEFORWARD',
  logoUrl: '',
  primaryColor: '#FF7900',
};

const defaultPricing: PricingStep = {
  billingCycle: 'monthly',
  promoCode: '',
  trialRequested: false,
};

const defaultPayment: PaymentStep = {
  paymentMethod: 'momo',
  momoProvider: 'airtel',
  paymentProofUrl: '',
  acceptTerms: false,
};

export function useTenantRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [business, setBusiness] = useState<BusinessContactStep>(defaultBusiness);
  const [operations, setOperations] = useState<OperationalProfileStep>(defaultOperations);
  const [branding, setBranding] = useState<BrandingStep>(defaultBranding);
  const [pricing, setPricing] = useState<PricingStep>(defaultPricing);
  const [payment, setPayment] = useState<PaymentStep>(defaultPayment);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setBusiness({ ...defaultBusiness, ...parsed.business });
        setOperations({ ...defaultOperations, ...parsed.operations });
        setBranding({ ...defaultBranding, ...parsed.branding });
        setPricing({ ...defaultPricing, ...parsed.pricing });
        setPayment({ ...defaultPayment, ...parsed.payment });
        setCurrentStep(parsed.currentStep || 1);
      }
    } catch (err) {
      // ignore corrupted cache
      console.warn('Failed to restore wizard cache', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = { currentStep, business, operations, branding, pricing, payment };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to persist wizard cache', err);
    }
  }, [currentStep, business, operations, branding, pricing, payment]);

  const breakdown: PricingBreakdown = useMemo(() => {
    return calculateTenantPricing(
      {
        expectedListings: operations.expectedListings,
        staffCount: operations.staffCount,
        branchCount: operations.branchCount,
        addOns: operations.requiredModules,
        billingCycle: pricing.billingCycle,
        promoCode: pricing.promoCode,
        trialRequested: pricing.trialRequested,
      },
      undefined,
      { taxRatePct: 0 }
    );
  }, [operations.expectedListings, operations.staffCount, operations.branchCount, operations.requiredModules, pricing.billingCycle, pricing.promoCode, pricing.trialRequested]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const reset = () => {
    setBusiness(defaultBusiness);
    setOperations(defaultOperations);
    setBranding(defaultBranding);
    setPricing(defaultPricing);
    setPayment(defaultPayment);
    setCurrentStep(1);
  };

  return {
    currentStep,
    business,
    operations,
    branding,
    pricing,
    payment,
    breakdown,
    setBusiness,
    setOperations,
    setBranding,
    setPricing,
    setPayment,
    setCurrentStep,
    nextStep,
    prevStep,
    reset,
  };
}
