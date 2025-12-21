// types.ts
export type TenantTheme = {
  backgroundColor: any;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor: string;
  country: string;
  baseCurrency: 'ZMW' | 'USD';
  phone?: string;
  whatsapp?: string;
  email?: string;
  location?: string;
  heroTitle: string;
  heroSubtitle: string;
  brandTone: 'formal' | 'professional' | 'friendly';
  contactInfo: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
  slogan?: string;
  export: {
    enabled: boolean;
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
};

export type Car = {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  grade?: string;
  year: number;
  mileageKm: number;
  engineCc: number;
  transmission: string;
  fuel: string;
  steering: string;
  drive?: string;
  seats?: number;
  doors?: number;
  priceLocal?: number;
  priceUsd?: number;
  currency: 'ZMW' | 'USD';
  location: string;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold';
  bodyType?: string;
  color?: string;
  portOption?: string;
};

export type Testimonial = {
  name: string;
  country: string;
  message: string;
};

export type PlanCode = 'starter' | 'growth' | 'export';

export type BillingLine = {
  label: string;
  amount: number;
  type: 'base' | 'addon' | 'surcharge';
};

export type BillingSummary = {
  currency: 'ZMW' | 'USD';
  planCode: PlanCode;
  basePrice: number;
  lines: BillingLine[];
  total: number;
};

export type DealerPayload = {
  tenant: {
    name: string;
    slug: string;
    country: string;
    city?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    branchesCount: number;
  };
  modules: {
    carDealer: boolean;
    exporter: boolean;
    agents: boolean;
    buyerPortal: boolean;
    serviceCenter: boolean;
    publicSite: boolean;
  };
  dealerSiteSettings: TenantTheme;
  exportSettings: {
    enabled: boolean;
    ports: string[];
    currencyMode: 'LOCAL' | 'USD' | 'BOTH';
  };
  paymentSettings: {
    mobileMoney: string[];
    acceptedMethods: string[];
  };
  onboardingPriority: string;
  initialStockVolume: string;
  brandTone: string;
  selectedPlan: {
    code: PlanCode;
    name: string;
    billingPeriod: 'monthly';
  };
  billingSummary: BillingSummary;
};