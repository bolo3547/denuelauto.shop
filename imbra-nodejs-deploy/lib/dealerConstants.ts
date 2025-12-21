// constants.ts
import { Car, Testimonial, TenantTheme, PlanCode } from '../types/dealer';

export const PLAN_LIMITS = {
  starter: {
    maxCars: 50,
    maxBranches: 1,
    maxUsers: 3,
    exporterIncluded: false,
  },
  growth: {
    maxCars: 150,
    maxBranches: 3,
    maxUsers: 10,
    exporterIncluded: false,
  },
  export: {
    maxCars: 9999,
    maxBranches: 9999,
    maxUsers: 50,
    exporterIncluded: true,
  },
};

export const BASE_PRICES: Record<PlanCode, number> = {
  starter: 1200,
  growth: 2500,
  export: 4000,
};

export const mockTenantTheme: TenantTheme = {
  backgroundColor: '#ffffff',
  name: 'Enuel Motors Zambia',
  logoUrl: '/mock-logo.png',
  primaryColor: '#0F3D91',
  secondaryColor: '#1e40af',
  accentColor: '#F4C430',
  country: 'Zambia',
  baseCurrency: 'ZMW',
  phone: '+260 97 000 0000',
  whatsapp: '+260970000000',
  email: 'sales@enuelmotors.com',
  location: 'Lusaka, Zambia',
  heroTitle: 'Find your next import car.',
  heroSubtitle: 'Quality vehicles at competitive prices.',
  brandTone: 'professional',
  contactInfo: {
    address: 'Lusaka, Zambia',
    phone: '+260 97 000 0000',
    whatsapp: '+260970000000',
    email: 'sales@enuelmotors.com',
  },
  export: {
    enabled: true,
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
};

export const cars: Car[] = [
  {
    id: '1',
    stockNo: 'DJ-8891',
    make: 'Toyota',
    model: 'Harrier',
    grade: 'Premium',
    year: 2017,
    mileageKm: 86000,
    engineCc: 2500,
    transmission: 'AT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceUsd: 10500,
    priceLocal: 220000,
    currency: 'USD',
    location: 'Lusaka Yard',
    images: ['/cars/car-1.jpg', '/cars/car-1-2.jpg'],
    status: 'Available',
    bodyType: 'SUV',
    color: 'White',
    portOption: 'Dar es Salaam',
  },
  // Add more cars as needed
];

export const featuredCars: Car[] = [cars[0]];

export const testimonials: Testimonial[] = [
  {
    name: 'John Doe',
    country: 'Zambia',
    message: 'Excellent service and quality cars.',
  },
  {
    name: 'Jane Smith',
    country: 'Kenya',
    message: 'Fast and reliable delivery.',
  },
];
