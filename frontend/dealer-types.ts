// dealer-types.ts - Mock data for dealer template
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  description: string;
  mileage?: number;
  grade?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  avatar: string;
  location: string;
  rating: number;
}

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  name: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
  };
}

// Mock data
export const cars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 25000,
    images: ['/images/camry.jpg'],
    description: 'Reliable sedan with excellent fuel economy',
    mileage: 15000,
    grade: 'A'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    images: ['/images/civic.jpg'],
    description: 'Sporty and efficient compact car',
    mileage: 20000,
    grade: 'A'
  },
  {
    id: '3',
    make: 'BMW',
    model: 'X3',
    year: 2023,
    price: 45000,
    images: ['/images/x3.jpg'],
    description: 'Luxury SUV with premium features',
    mileage: 5000,
    grade: 'A+'
  }
];

export const featuredCars: Car[] = cars.slice(0, 2);

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Doe',
    comment: 'Excellent service and great selection of vehicles. Highly recommended!',
    avatar: '/images/avatar1.jpg',
    location: 'New York, NY',
    rating: 5
  },
  {
    id: '2',
    name: 'Jane Smith',
    comment: 'Found my dream car here. The staff was very helpful throughout the process.',
    avatar: '/images/avatar2.jpg',
    location: 'Los Angeles, CA',
    rating: 5
  },
  {
    id: '3',
    name: 'Mike Johnson',
    comment: 'Transparent pricing and no pressure sales. Will definitely return.',
    avatar: '/images/avatar3.jpg',
    location: 'Chicago, IL',
    rating: 4
  }
];

export const tenantTheme: TenantTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#1d4ed8',
  logo: '/images/logo.png',
  name: 'Denuel Auto Dealership',
  contactInfo: {
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@denuelauto.com'
  }
};