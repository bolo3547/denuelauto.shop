export type BusinessContactStep = {
  businessName: string;
  country: string;
  city: string;
  businessType: 'dealer' | 'broker' | 'exporter' | 'auction';
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export type OperationalProfileStep = {
  expectedListings: number; // numeric upper bound from range selection
  expectedSales?: number;
  staffCount: number;
  multiBranch: boolean;
  branchCount: number;
  requiredModules: {
    cifCalculator: boolean;
    onlinePayments: boolean;
    whatsappIntegration: boolean;
    customerAccounts: boolean;
    apiAccess: boolean;
    multiWarehouse: boolean;
  };
};

export type BrandingStep = {
  themePreset: 'BEFORWARD' | 'SBT' | 'AUTOCOM';
  logoUrl?: string;
  primaryColor?: string;
};

export type PricingStep = {
  billingCycle: 'monthly' | 'annual';
  promoCode?: string;
  trialRequested: boolean;
};

export type PaymentStep = {
  paymentMethod: 'momo' | 'bank' | 'card-placeholder';
  momoProvider?: 'airtel' | 'mtn';
  paymentProofUrl?: string;
  acceptTerms: boolean;
};

export type TenantPricingInput = {
  expectedListings: number;
  staffCount: number;
  branchCount: number;
  addOns: OperationalProfileStep['requiredModules'];
  billingCycle: PricingStep['billingCycle'];
  promoCode?: string;
  taxRatePct?: number;
  trialRequested?: boolean;
};

export type PricingLine = {
  label: string;
  amountMinor: number;
  type: 'base' | 'addon' | 'surcharge' | 'overage' | 'discount' | 'tax' | 'total';
  description?: string;
};

export type PricingBreakdown = {
  tier: 'small' | 'medium' | 'large' | 'enterprise';
  basePriceMinor: number;
  currency: 'ZMW';
  billingCycle: 'monthly' | 'annual';
  lines: PricingLine[];
  addOnTotalMinor: number;
  surchargeTotalMinor: number;
  discountTotalMinor: number;
  overageMinor: number;
  taxMinor: number;
  totalMinor: number;
  annualTotalMinor: number;
  promo?: PromoCode | null;
  trialRequested?: boolean;
};

export type PromoCode = {
  id?: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number; // percent (e.g., 10) or fixed major-unit amount depending on type
  currency: 'ZMW';
  expiresAt: string;
  isActive: boolean;
};

export type EstimateRequest = {
  business: BusinessContactStep;
  operations: OperationalProfileStep;
  branding: BrandingStep;
  pricing: PricingStep;
};

export type EstimateResponse = {
  ok: boolean;
  breakdown: PricingBreakdown;
};

export type SubmitRegistrationRequest = {
  business: BusinessContactStep;
  operations: OperationalProfileStep;
  branding: BrandingStep;
  pricing: PricingStep;
  payment: PaymentStep;
};

export type SubmitRegistrationResponse = {
  ok: boolean;
  registrationId: string;
  invoiceId: string;
  nextStep: string;
};
