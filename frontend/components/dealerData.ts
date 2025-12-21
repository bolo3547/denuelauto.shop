// Types and mock data for Dealer Public App

export type TenantTheme = {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
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
  contactInfo?: {
    address: string;
    phone: string;
    email: string;
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
  priceLocal?: number;
  priceUsd?: number;
  currency: 'ZMW' | 'USD';
  location: string;
  portOption?: string;
  bodyType?: string;
  color?: string;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold';
};

export type Testimonial = {
  name: string;
  country: string;
  message: string;
};

// Mock tenant theme
export const mockTenantTheme: TenantTheme = {
  name: 'Enuel Motors Zambia',
  logoUrl: 'https://via.placeholder.com/150x50?text=Enuel+Motors',
  primaryColor: '#1e40af', // Navy blue
  secondaryColor: '#3b82f6', // Blue
  accentColor: '#fbbf24', // Gold
  country: 'Zambia',
  baseCurrency: 'ZMW',
  phone: '+260 211 123456',
  whatsapp: '+260971234567',
  email: 'info@enuelmotors.zm',
  location: 'Lusaka, Zambia',
  heroTitle: 'Find Your Next Quality Import Car',
  heroSubtitle: 'Pre-inspected vehicles with full documentation and shipping assistance.',
  brandTone: 'professional',
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

// Mock cars
export const mockCars: Car[] = [
  {
    id: '1',
    stockNo: 'EMZ-001',
    make: 'Toyota',
    model: 'Harrier',
    grade: 'Premium',
    year: 2017,
    mileageKm: 85000,
    engineCc: 2000,
    transmission: 'AT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 220000,
    priceUsd: 10500,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Dar es Salaam',
    bodyType: 'SUV',
    color: 'White',
    images: ['https://via.placeholder.com/400x300?text=Toyota+Harrier'],
    status: 'Available',
  },
  {
    id: '2',
    stockNo: 'EMZ-002',
    make: 'Honda',
    model: 'CR-V',
    grade: 'EX',
    year: 2018,
    mileageKm: 65000,
    engineCc: 2000,
    transmission: 'AT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 250000,
    priceUsd: 12000,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Durban',
    bodyType: 'SUV',
    color: 'Black',
    images: ['https://via.placeholder.com/400x300?text=Honda+CR-V'],
    status: 'Available',
  },
  {
    id: '3',
    stockNo: 'EMZ-003',
    make: 'Nissan',
    model: 'Qashqai',
    grade: 'Tekna',
    year: 2016,
    mileageKm: 95000,
    engineCc: 1600,
    transmission: 'MT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 180000,
    priceUsd: 8600,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Walvis Bay',
    bodyType: 'SUV',
    color: 'Silver',
    images: ['https://via.placeholder.com/400x300?text=Nissan+Qashqai'],
    status: 'Reserved',
  },
  {
    id: '4',
    stockNo: 'EMZ-004',
    make: 'Mazda',
    model: 'CX-5',
    grade: 'Touring',
    year: 2019,
    mileageKm: 45000,
    engineCc: 2500,
    transmission: 'AT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 280000,
    priceUsd: 13400,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Dar es Salaam',
    bodyType: 'SUV',
    color: 'Blue',
    images: ['https://via.placeholder.com/400x300?text=Mazda+CX-5'],
    status: 'Available',
  },
  {
    id: '5',
    stockNo: 'EMZ-005',
    make: 'Toyota',
    model: 'Corolla',
    grade: 'Altis',
    year: 2015,
    mileageKm: 120000,
    engineCc: 1800,
    transmission: 'AT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 150000,
    priceUsd: 7200,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Durban',
    bodyType: 'Sedan',
    color: 'Red',
    images: ['https://via.placeholder.com/400x300?text=Toyota+Corolla'],
    status: 'Sold',
  },
  {
    id: '6',
    stockNo: 'EMZ-006',
    make: 'Honda',
    model: 'Civic',
    grade: 'Type R',
    year: 2020,
    mileageKm: 30000,
    engineCc: 2000,
    transmission: 'MT',
    fuel: 'Petrol',
    steering: 'RHD',
    priceLocal: 350000,
    priceUsd: 16800,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Walvis Bay',
    bodyType: 'Hatchback',
    color: 'Orange',
    images: ['https://via.placeholder.com/400x300?text=Honda+Civic'],
    status: 'Available',
  },
];

export const featuredCars = mockCars.slice(0, 3);

export const mockTestimonials: Testimonial[] = [
  {
    name: 'John Doe',
    country: 'Zimbabwe',
    message: 'Great service and quality vehicles. Highly recommended!',
  },
  {
    name: 'Jane Smith',
    country: 'Malawi',
    message: 'Smooth export process and excellent customer support.',
  },
  {
    name: 'Mike Johnson',
    country: 'Tanzania',
    message: 'Found the perfect car at a fair price. Thank you!',
  },
];