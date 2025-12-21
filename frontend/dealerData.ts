// Types for the public dealership website
export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  name: string;
  slogan?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    whatsapp?: string;
  };
}

export interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  grade?: string;
  mileage_km: number;
  engine_cc: number;
  transmission: string;
  fuel: string;
  price_usd: number;
  price_local_zmw?: number;
  main_image_url: string;
  images: string[];
  vin: string;
  status: 'available' | 'sold' | 'reserved';
  location: string;
  features?: string[];
}

// Mock data for development
export const mockCars: Car[] = [
  {
    id: '1',
    stockNo: 'ABC123',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    grade: 'XLE',
    mileage_km: 45000,
    engine_cc: 1800,
    transmission: 'Automatic',
    fuel: 'Petrol',
    price_usd: 18500,
    price_local_zmw: 185000,
    main_image_url: '/cars/toyota-corolla-2020.jpg',
    images: ['/cars/toyota-corolla-2020.jpg', '/cars/toyota-corolla-2020-2.jpg'],
    vin: 'JTNKU3JE0L0000001',
    status: 'available',
    location: 'Lusaka',
    features: ['Air Conditioning', 'Power Steering', 'ABS']
  },
  {
    id: '2',
    stockNo: 'DEF456',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    grade: 'EX',
    mileage_km: 32000,
    engine_cc: 1500,
    transmission: 'CVT',
    fuel: 'Petrol',
    price_usd: 16500,
    price_local_zmw: 165000,
    main_image_url: '/cars/honda-civic-2019.jpg',
    images: ['/cars/honda-civic-2019.jpg'],
    vin: '2HGFC2F59KH000002',
    status: 'available',
    location: 'Lusaka',
    features: ['Navigation', 'Backup Camera', 'Bluetooth']
  },
  {
    id: '3',
    stockNo: 'GHI789',
    make: 'Nissan',
    model: 'Altima',
    year: 2021,
    grade: 'SV',
    mileage_km: 28000,
    engine_cc: 2500,
    transmission: 'Automatic',
    fuel: 'Petrol',
    price_usd: 21000,
    price_local_zmw: 210000,
    main_image_url: '/cars/nissan-altima-2021.jpg',
    images: ['/cars/nissan-altima-2021.jpg'],
    vin: '1N4BL4BV4MN000003',
    status: 'reserved',
    location: 'Ndola',
    features: ['Leather Seats', 'Sunroof', 'Heated Seats']
  }
];

export const mockTenantTheme: TenantTheme = {
  primaryColor: '#1e40af',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  logoUrl: '/logos/denuel-auto.png',
  name: 'Denuel Auto',
  slogan: 'Your Trusted Car Partner',
  contactInfo: {
    phone: '+260 211 123456',
    email: 'info@denuelauto.com',
    address: '123 Main Street, Lusaka, Zambia',
    whatsapp: '+260 955 123456'
  }
};

export const mockTestimonials = [
  {
    id: '1',
    name: 'John Mwanza',
    location: 'Lusaka',
    rating: 5,
    comment: 'Excellent service! Found my dream car at a great price.',
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mary Banda',
    location: 'Kitwe',
    rating: 5,
    comment: 'Professional staff and transparent pricing. Highly recommended!',
    date: '2024-01-10'
  }
];

export const mockFeaturedCars = mockCars.slice(0, 2);