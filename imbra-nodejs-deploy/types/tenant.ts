export type TenantTheme = {
  name: string;
  logoUrl?: string;
  primaryColor: string;
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
