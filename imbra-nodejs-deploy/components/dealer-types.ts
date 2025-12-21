// Types and mock data for the dealer public site

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
  mileage: number;
  mileageKm: number;
  engineCc: number;
  engineSize: string;
  transmission: string;
  fuelType: string;
  fuel: string;
  steering: string;
  price: number;
  priceLocal?: number;
  priceUsd?: number;
  currency: 'ZMW' | 'USD';
  location: string;
  portOption?: string;
  bodyType?: string;
  color?: string;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold';
  description?: string;
  features?: string[];
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
  primaryColor: '#0F3D91',
  secondaryColor: '#1d4ed8',
  accentColor: '#FFD700',
  country: 'Zambia',
  baseCurrency: 'ZMW',
  phone: '+260 971 234 567',
  whatsapp: '+260 971 234 567',
  email: 'info@enuelmotors.zm',
  location: 'Lusaka, Zambia',
  heroTitle: 'Find your next import car.',
  heroSubtitle: 'Quality used vehicles imported for Africa.',
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
    mileage: 85000,
    mileageKm: 85000,
    engineCc: 2500,
    engineSize: '2500cc',
    transmission: 'AT',
    fuelType: 'Petrol',
    fuel: 'Petrol',
    steering: 'RHD',
    price: 10500,
    priceLocal: 220000,
    priceUsd: 10500,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Dar es Salaam',
    bodyType: 'SUV',
    color: 'White',
    images: ['https://via.placeholder.com/400x300?text=Toyota+Harrier'],
    status: 'Available',
    description: 'Well-maintained Toyota Harrier with premium features and comfortable ride.',
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags'],
  },
  {
    id: '2',
    stockNo: 'EMZ-002',
    make: 'Honda',
    model: 'CR-V',
    grade: 'EX',
    year: 2018,
    mileage: 65000,
    mileageKm: 65000,
    engineCc: 2000,
    engineSize: '2000cc',
    transmission: 'AT',
    fuelType: 'Petrol',
    fuel: 'Petrol',
    steering: 'RHD',
    price: 8500,
    priceLocal: 180000,
    priceUsd: 8500,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Durban',
    bodyType: 'SUV',
    color: 'Black',
    images: ['https://via.placeholder.com/400x300?text=Honda+CR-V'],
    status: 'Available',
    description: 'Reliable Honda CR-V with excellent fuel economy and spacious interior.',
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Alloy Wheels'],
  },
  {
    id: '3',
    stockNo: 'EMZ-003',
    make: 'Nissan',
    model: 'Patrol',
    grade: 'Safari',
    year: 2016,
    mileage: 120000,
    mileageKm: 120000,
    engineCc: 3200,
    engineSize: '3200cc',
    transmission: 'AT',
    fuelType: 'Diesel',
    fuel: 'Diesel',
    steering: 'RHD',
    price: 12000,
    priceLocal: 250000,
    priceUsd: 12000,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Walvis Bay',
    bodyType: 'SUV',
    color: 'Silver',
    images: ['https://via.placeholder.com/400x300?text=Nissan+Patrol'],
    status: 'Reserved',
    description: 'Powerful Nissan Patrol Safari with diesel engine and off-road capability.',
    features: ['4WD', 'Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Roof Rack'],
  },
  {
    id: '4',
    stockNo: 'EMZ-004',
    make: 'Mitsubishi',
    model: 'Pajero',
    grade: 'GLX',
    year: 2019,
    mileage: 45000,
    mileageKm: 45000,
    engineCc: 3200,
    engineSize: '3200cc',
    transmission: 'AT',
    fuelType: 'Diesel',
    fuel: 'Diesel',
    steering: 'RHD',
    price: 9500,
    priceLocal: 200000,
    priceUsd: 9500,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Dar es Salaam',
    bodyType: 'SUV',
    color: 'Blue',
    images: ['https://via.placeholder.com/400x300?text=Mitsubishi+Pajero'],
    status: 'Available',
    description: 'Versatile Mitsubishi Pajero GLX with modern features and reliable performance.',
    features: ['4WD', 'Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Leather Seats'],
  },
  {
    id: '5',
    stockNo: 'EMZ-005',
    make: 'Toyota',
    model: 'Land Cruiser',
    grade: 'VX',
    year: 2015,
    mileage: 150000,
    mileageKm: 150000,
    engineCc: 4600,
    engineSize: '4600cc',
    transmission: 'AT',
    fuelType: 'Diesel',
    fuel: 'Diesel',
    steering: 'RHD',
    price: 16500,
    priceLocal: 350000,
    priceUsd: 16500,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Durban',
    bodyType: 'SUV',
    color: 'Green',
    images: ['https://via.placeholder.com/400x300?text=Toyota+Land+Cruiser'],
    status: 'Sold',
    description: 'Legendary Toyota Land Cruiser VX with premium interior and exceptional durability.',
    features: ['4WD', 'Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Premium Audio', 'Leather Seats', 'Sunroof'],
  },
  {
    id: '6',
    stockNo: 'EMZ-006',
    make: 'Honda',
    model: 'Fit',
    grade: 'RS',
    year: 2020,
    mileage: 30000,
    mileageKm: 30000,
    engineCc: 1500,
    engineSize: '1500cc',
    transmission: 'AT',
    fuelType: 'Petrol',
    fuel: 'Petrol',
    steering: 'RHD',
    price: 5700,
    priceLocal: 120000,
    priceUsd: 5700,
    currency: 'ZMW',
    location: 'Lusaka Yard',
    portOption: 'Dar es Salaam',
    bodyType: 'Hatchback',
    color: 'Red',
    images: ['https://via.placeholder.com/400x300?text=Honda+Fit'],
    status: 'Available',
    description: 'Sporty Honda Fit RS with excellent handling and fuel efficiency.',
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Sport Suspension', 'Alloy Wheels'],
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
    message: 'Smooth purchase process and excellent customer support.',
  },
  {
    name: 'Mike Johnson',
    country: 'Tanzania',
    message: 'Found the perfect car at a fair price. Will buy again.',
  },
];

// Export aliases for compatibility
export const tenantTheme = {
  ...mockTenantTheme,
  secondaryColor: mockTenantTheme.accentColor,
  contactInfo: {
    address: mockTenantTheme.location || '123 Main Street, Lusaka, Zambia',
    phone: mockTenantTheme.phone || '+260 971 234 567',
    email: mockTenantTheme.email || 'info@enuelmotors.zm',
  },
};

export const cars = mockCars;

export const testimonials = mockTestimonials.map(t => ({
  id: t.name.toLowerCase().replace(' ', '-'),
  name: t.name,
  comment: t.message,
  avatar: `https://via.placeholder.com/100x100?text=${t.name.split(' ')[0]}`,
  location: t.country,
  rating: 5,
}));