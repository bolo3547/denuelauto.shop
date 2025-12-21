"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaSearch, FaHeart, FaShieldAlt, FaTruck, FaHandshake, FaFileAlt,
  FaArrowRight, FaCalculator, FaCheckCircle, FaHeadset,
  FaShoppingCart, FaQuestionCircle, FaWhatsapp, FaStar,
  FaUsers, FaCar, FaAward, FaClock, FaHome, FaPhone, FaUser
} from 'react-icons/fa';
import BeForwardHeader from './BeForwardHeader';
import BeForwardFooter from './BeForwardFooter';
import { AiButton } from '../ai';

interface BeForwardHomePageProps {
  tenantSlug: string;
  tenant?: {
    name?: string;
    logoUrl?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    primaryColor?: string;
    baseCurrency?: string;
    country?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    location?: string;
  };
  featuredCars?: CarData[];
  latestCars?: CarData[];
}

// Zambian price buckets
const PRICE_BUCKETS = [
  { label: 'Best Deals', slug: 'best-deals', icon: '🔥', color: 'bg-red-500' },
  { label: 'Under K150,000', slug: 'under-150k', icon: '💰', color: 'bg-green-500' },
  { label: 'Under K300,000', slug: 'under-300k', icon: '💵', color: 'bg-blue-500' },
  { label: 'Bank Repo', slug: 'bank-repo', icon: '🏦', color: 'bg-purple-500' },
  { label: 'New Arrivals', slug: 'new-arrivals', icon: '✨', color: 'bg-yellow-500' },
  { label: 'Clearance', slug: 'clearance', icon: '🏷️', color: 'bg-orange-500' },
];

const POPULAR_MAKES = [
  { name: 'Toyota', count: 450, logo: '/makes/toyota.svg' },
  { name: 'Nissan', count: 280, logo: '/makes/nissan.svg' },
  { name: 'Honda', count: 195, logo: '/makes/honda.svg' },
  { name: 'Mazda', count: 120, logo: '/makes/mazda.svg' },
  { name: 'Mitsubishi', count: 98, logo: '/makes/mitsubishi.svg' },
  { name: 'Suzuki', count: 85, logo: '/makes/suzuki.svg' },
  { name: 'Hyundai', count: 76, logo: '/makes/hyundai.svg' },
  { name: 'Mercedes', count: 45, logo: '/makes/mercedes.svg' },
];

const BODY_TYPES = [
  { name: 'SUV', icon: '🚙', count: 320 },
  { name: 'Sedan', icon: '🚗', count: 280 },
  { name: 'Hatchback', icon: '🚘', count: 150 },
  { name: 'Pickup', icon: '🛻', count: 95 },
  { name: 'Van', icon: '🚐', count: 65 },
  { name: 'Wagon', icon: '🚃', count: 45 },
];

const WHY_CHOOSE_US = [
  { 
    icon: FaShieldAlt, 
    title: 'Trusted Dealer', 
    description: 'Licensed and verified dealership with transparent pricing'
  },
  { 
    icon: FaCalculator, 
    title: 'Financing Available', 
    description: 'Flexible payment plans from 6 to 60 months'
  },
  { 
    icon: FaCheckCircle, 
    title: 'Local Inspection', 
    description: 'All cars inspected locally before delivery'
  },
  { 
    icon: FaShieldAlt, 
    title: 'Warranty Options', 
    description: '3-6 month warranty on selected vehicles'
  },
  { 
    icon: FaFileAlt, 
    title: 'Fast Paperwork', 
    description: 'We handle RTSA registration and transfers'
  },
  { 
    icon: FaHeadset, 
    title: '24/7 Support', 
    description: 'WhatsApp support available anytime'
  },
];

const HOW_TO_BUY_STEPS = [
  { step: 1, title: 'Choose Your Car', description: 'Browse our stock and find your perfect vehicle', icon: FaSearch },
  { step: 2, title: 'Pay Deposit', description: 'Secure your car with a minimum 30% deposit', icon: FaHandshake },
  { step: 3, title: 'Financing Approval', description: 'Get approved for flexible payment terms', icon: FaCalculator },
  { step: 4, title: 'Registration & Delivery', description: 'We handle paperwork and deliver to you', icon: FaTruck },
];

// Customer Testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: 'James Mwamba',
    location: 'Lusaka',
    rating: 5,
    text: 'Excellent service! I bought my Toyota Harrier from Denuel Auto and the entire process was smooth. The financing options made it affordable.',
    vehicle: '2019 Toyota Harrier',
    avatar: '/avatars/customer-1.jpg',
    date: '2 weeks ago',
  },
  {
    id: 2,
    name: 'Grace Banda',
    location: 'Ndola',
    rating: 5,
    text: 'Very professional team. They helped me with all the RTSA paperwork and even delivered the car to Ndola. Highly recommended!',
    vehicle: '2020 Honda CR-V',
    avatar: '/avatars/customer-2.jpg',
    date: '1 month ago',
  },
  {
    id: 3,
    name: 'Peter Tembo',
    location: 'Kitwe',
    rating: 5,
    text: 'Best car dealer in Zambia! Fair prices, no hidden charges. My Mazda CX-5 is exactly as described. Thank you Denuel Auto!',
    vehicle: '2021 Mazda CX-5',
    avatar: '/avatars/customer-3.jpg',
    date: '3 weeks ago',
  },
  {
    id: 4,
    name: 'Sarah Phiri',
    location: 'Lusaka',
    rating: 4,
    text: 'Good selection of vehicles. The team was helpful in finding the right car within my budget. Will definitely recommend to friends.',
    vehicle: '2018 Nissan X-Trail',
    avatar: '/avatars/customer-4.jpg',
    date: '1 month ago',
  },
];

// Live Stats
const LIVE_STATS = [
  { label: 'Vehicles in Stock', value: 1247, icon: FaCar, suffix: '+' },
  { label: 'Happy Customers', value: 3500, icon: FaUsers, suffix: '+' },
  { label: 'Years Experience', value: 8, icon: FaAward, suffix: '' },
  { label: 'Cities Covered', value: 12, icon: FaTruck, suffix: '' },
];

// Car data interface
interface CarData {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  grade?: string;
  year: number;
  price?: number;
  priceUsd?: number;
  mileage?: number;
  mileageKm?: number;
  images?: string[];
  coverUrl?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  condition?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  status?: string;
  location?: string;
}

export default function BeForwardHomePage({ 
  tenantSlug, 
  tenant, 
  latestCars = [] 
}: BeForwardHomePageProps) {
  const router = useRouter();
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    bodyType: '',
  });
  const [currency, setCurrency] = useState('ZMW');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<CarData[]>([]);
  const [financeCalcOpen, setFinanceCalcOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Exchange rate - should come from tenant settings or API
  const exchangeRate = tenant?.baseCurrency === 'USD' ? 27 : 1;

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);
    
    // Load recently viewed cars
    const viewed = localStorage.getItem(`denuel:recentlyViewed:${tenantSlug}`);
    if (viewed) {
      try {
        setRecentlyViewed(JSON.parse(viewed).slice(0, 4));
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
      }
    }
  }, [tenantSlug]);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = useCallback((carId: string) => {
    setImageErrors(prev => ({ ...prev, [carId]: true }));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/t/${tenantSlug}/stock?${params.toString()}`);
  };

  // Format price based on currency
  const formatPriceValue = useCallback((price: number, isUsd = false) => {
    if (currency === 'ZMW') {
      const zmwPrice = isUsd ? price * exchangeRate : price;
      return `K${zmwPrice.toLocaleString()}`;
    }
    const usdPrice = isUsd ? price : Math.round(price / exchangeRate);
    return `$${usdPrice.toLocaleString()}`;
  }, [currency, exchangeRate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      {/* Hero Search Strip */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {tenant?.heroTitle || 'Find Your Perfect Car in Zambia'}
            </h1>
            <p className="text-blue-200 text-lg">
              {tenant?.heroSubtitle || 'Quality vehicles with financing options starting from K5,000/month'}
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <select
                value={searchFilters.make}
                onChange={(e) => setSearchFilters({...searchFilters, make: e.target.value})}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Make"
              >
                <option value="">All Makes</option>
                {POPULAR_MAKES.map(make => (
                  <option key={make.name} value={make.name}>{make.name}</option>
                ))}
              </select>

              <select
                value={searchFilters.model}
                onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Model"
              >
                <option value="">All Models</option>
              </select>

              <select
                value={searchFilters.yearFrom}
                onChange={(e) => setSearchFilters({...searchFilters, yearFrom: e.target.value})}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Year from"
              >
                <option value="">Year From</option>
                {Array.from({length: 20}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={searchFilters.priceTo}
                onChange={(e) => setSearchFilters({...searchFilters, priceTo: e.target.value})}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Max price"
              >
                <option value="">Max Price</option>
                <option value="100000">Under K100,000</option>
                <option value="150000">Under K150,000</option>
                <option value="200000">Under K200,000</option>
                <option value="300000">Under K300,000</option>
                <option value="500000">Under K500,000</option>
                <option value="1000000">Under K1,000,000</option>
              </select>

              <select
                value={searchFilters.bodyType}
                onChange={(e) => setSearchFilters({...searchFilters, bodyType: e.target.value})}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Body type"
              >
                <option value="">Body Type</option>
                {BODY_TYPES.map(type => (
                  <option key={type.name} value={type.name}>{type.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="col-span-2 md:col-span-1 lg:col-span-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaSearch className="w-4 h-4" />
                Search Cars
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Discount Buckets */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRICE_BUCKETS.map((bucket) => (
              <Link
                key={bucket.slug}
                href={`/t/${tenantSlug}/stock?bucket=${bucket.slug}`}
                className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300"
              >
                <span className="text-3xl mb-2">{bucket.icon}</span>
                <span className="text-sm font-semibold text-gray-800 text-center group-hover:text-blue-600">
                  {bucket.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Banner */}
      <section className="py-6 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {LIVE_STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed - Only show if user has viewed cars */}
      {recentlyViewed.length > 0 && (
        <section className="py-8 bg-amber-50 border-y border-amber-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaClock className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-gray-900">Recently Viewed</h2>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem(`denuel:recentlyViewed:${tenantSlug}`);
                  setRecentlyViewed([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.map((car) => (
                <CarCard 
                  key={car.id || car.stockNo} 
                  car={car} 
                  tenantSlug={tenantSlug}
                  currency={currency}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Stock */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Stock</h2>
              <p className="text-gray-600">Fresh arrivals ready for immediate purchase</p>
            </div>
            <Link 
              href={`/t/${tenantSlug}/stock`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View All <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(latestCars.length > 0 ? latestCars : SAMPLE_CARS).slice(0, 8).map((car: CarData) => (
              <CarCard 
                key={car.id || car.stockNo} 
                car={car} 
                tenantSlug={tenantSlug}
                currency={currency}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Make */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Make</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {POPULAR_MAKES.map((make) => (
              <Link
                key={make.name}
                href={`/t/${tenantSlug}/stock?make=${make.name}`}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors border border-gray-200 group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-lg font-bold text-gray-700 group-hover:text-blue-600">
                    {make.name[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{make.name}</span>
                <span className="text-xs text-gray-500">{make.count} cars</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Body Type */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Body Type</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {BODY_TYPES.map((type) => (
              <Link
                key={type.name}
                href={`/t/${tenantSlug}/stock?bodyType=${type.name}`}
                className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="text-4xl mb-2">{type.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{type.name}</span>
                <span className="text-xs text-gray-500">{type.count} cars</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose {tenant?.name || 'Us'}?</h2>
            <p className="text-gray-600">Your trusted partner for quality vehicles in Zambia</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div key={idx} className="text-center p-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Calculator Section */}
      <section className="py-12 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Instant Finance Calculator</h2>
              <p className="text-green-100 mb-6">
                Calculate your monthly payments instantly. Get pre-approved in minutes with our flexible financing options.
              </p>
              <ul className="space-y-3 mb-6">
                {['Interest rates from 12% p.a.', 'Terms from 6 to 60 months', '30% minimum deposit', 'Same-day approval'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <FaCheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/t/${tenantSlug}/financing`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                <FaCalculator className="w-5 h-5" />
                Apply for Financing
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 text-gray-900">
              <FinanceCalculator currency={currency} exchangeRate={exchangeRate} />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
            <p className="text-gray-600">Real reviews from satisfied customers across Zambia</p>
          </div>
          
          {/* Desktop: Grid view */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          
          {/* Mobile: Carousel view */}
          <div className="md:hidden">
            <TestimonialCard testimonial={TESTIMONIALS[activeTestimonial]} />
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`View testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <FaShieldAlt className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Licensed Dealer</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaAward className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-medium">Top Rated 2024</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaCheckCircle className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Verified Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <FaStar key={i} className="w-4 h-4" />)}
              </div>
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* How to Buy (Zambia Flow) */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">How to Buy Your Car</h2>
            <p className="text-blue-200">Simple 4-step process to get your dream car</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_TO_BUY_STEPS.map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <step.icon className="w-7 h-7 text-blue-600" />
                </div>
                {idx !== 3 && <div className="absolute top-8 left-1/2 w-full h-0.5 bg-blue-700 -z-10 hidden md:block" />}
                <span className="inline-block w-8 h-8 bg-blue-600 rounded-full text-white font-bold mb-2">{step.step}</span>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-blue-200 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link 
              href={`/t/${tenantSlug}/how-to-buy`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Learn More <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Help & Support Cards */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Help & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href={`/t/${tenantSlug}/how-to-buy`} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <FaShoppingCart className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">How to Buy</h3>
              <p className="text-sm text-gray-600">Step-by-step guide to purchasing your car</p>
            </Link>
            <Link href={`/t/${tenantSlug}/financing`} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <FaCalculator className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Financing Options</h3>
              <p className="text-sm text-gray-600">Flexible payment plans to fit your budget</p>
            </Link>
            <Link href={`/t/${tenantSlug}/faq`} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <FaQuestionCircle className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">FAQs</h3>
              <p className="text-sm text-gray-600">Answers to commonly asked questions</p>
            </Link>
            <Link href={`/t/${tenantSlug}/contact`} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <FaHeadset className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">Get in touch with our sales team</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner - Newsletter & Quick Contact */}
      <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-gray-300 mb-4">
                Tell us your requirements and we'll source the perfect car for you. 
                We have connections with dealers across Japan, UK, and South Africa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/t/${tenantSlug}/request-car`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Request a Car
                </Link>
                {tenant?.whatsapp && (
                  <a
                    href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I am looking for a specific car.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp Us
                  </a>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Get Price Drop Alerts</h3>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to get notified when prices drop on your favorite cars
              </p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />

      {/* Floating WhatsApp Button */}
      {tenant?.whatsapp && (
        <a
          href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I am interested in buying a car.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-40"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7" />
        </a>
      )}

      {/* Floating AI Assistant Button */}
      <AiButton
        onClick={() => setShowAiPanel(true)}
        variant="floating"
        size="md"
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav tenantSlug={tenantSlug} whatsapp={tenant?.whatsapp} />
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString()}{suffix}</>;
}

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
      </div>
      <p className="text-gray-700 text-sm flex-1 mb-4">"{testimonial.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
          <p className="text-xs text-gray-500">{testimonial.location} • {testimonial.vehicle}</p>
        </div>
      </div>
    </div>
  );
}

// Finance Calculator Component
function FinanceCalculator({ currency, exchangeRate }: { currency: string; exchangeRate: number }) {
  const [vehiclePrice, setVehiclePrice] = useState(20000);
  const [deposit, setDeposit] = useState(30);
  const [term, setTerm] = useState(36);
  const interestRate = 0.15; // 15% annual

  const depositAmount = (vehiclePrice * deposit) / 100;
  const loanAmount = vehiclePrice - depositAmount;
  const monthlyRate = interestRate / 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
    (Math.pow(1 + monthlyRate, term) - 1);

  const formatCurrency = (amount: number) => {
    if (currency === 'ZMW') {
      return `K${(amount * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-lg">Calculate Your Monthly Payment</h3>
      
      <div>
        <label htmlFor="vehiclePrice" className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle Price: {formatCurrency(vehiclePrice)}
        </label>
        <input
          id="vehiclePrice"
          type="range"
          min={5000}
          max={100000}
          step={1000}
          value={vehiclePrice}
          onChange={(e) => setVehiclePrice(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          aria-label="Vehicle price slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatCurrency(5000)}</span>
          <span>{formatCurrency(100000)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="depositPercent" className="block text-sm font-medium text-gray-700 mb-1">
          Deposit: {deposit}% ({formatCurrency(depositAmount)})
        </label>
        <input
          id="depositPercent"
          type="range"
          min={30}
          max={70}
          step={5}
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          aria-label="Deposit percentage slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>30%</span>
          <span>70%</span>
        </div>
      </div>

      <div>
        <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
          Loan Term: {term} months
        </label>
        <input
          id="loanTerm"
          type="range"
          min={6}
          max={60}
          step={6}
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          aria-label="Loan term slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>6 months</span>
          <span>60 months</span>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 mb-1">Your Estimated Monthly Payment</p>
        <p className="text-3xl font-bold text-green-600">
          {formatCurrency(monthlyPayment)}<span className="text-lg font-normal text-gray-500">/month</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Total: {formatCurrency(monthlyPayment * term + depositAmount)} | Interest: {(interestRate * 100).toFixed(0)}% p.a.
        </p>
      </div>
    </div>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav({ tenantSlug, whatsapp }: { tenantSlug: string; whatsapp?: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 pb-safe">
      <div className="grid grid-cols-5 h-16">
        <Link 
          href={`/t/${tenantSlug}`}
          className="flex flex-col items-center justify-center text-blue-600"
        >
          <FaHome className="w-5 h-5" />
          <span className="text-xs mt-0.5">Home</span>
        </Link>
        <Link 
          href={`/t/${tenantSlug}/stock`}
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <FaSearch className="w-5 h-5" />
          <span className="text-xs mt-0.5">Search</span>
        </Link>
        <Link 
          href={`/t/${tenantSlug}/favorites`}
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <FaHeart className="w-5 h-5" />
          <span className="text-xs mt-0.5">Saved</span>
        </Link>
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! I am interested in buying a car.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-green-600 hover:text-green-700"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span className="text-xs mt-0.5">WhatsApp</span>
          </a>
        ) : (
          <Link 
            href={`/t/${tenantSlug}/contact`}
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <FaPhone className="w-5 h-5" />
            <span className="text-xs mt-0.5">Call</span>
          </Link>
        )}
        <Link 
          href={`/t/${tenantSlug}/login`}
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <FaUser className="w-5 h-5" />
          <span className="text-xs mt-0.5">Account</span>
        </Link>
      </div>
    </nav>
  );
}

// Car Card Component with improved image handling
function CarCard({ car, tenantSlug, currency, compact = false }: { car: CarData; tenantSlug: string; currency: string; compact?: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(car.images?.[0] || car.coverUrl || '/placeholder-car.jpg');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const favs = localStorage.getItem(`favs:${tenantSlug}`);
    if (favs) {
      const parsed = JSON.parse(favs);
      setIsFavorite(parsed.includes(car.id || car.stockNo));
    }
  }, [car.id, car.stockNo, tenantSlug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const carId = car.id || car.stockNo;
    
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== carId);
      localStorage.setItem(key, JSON.stringify(newFavs));
    } else {
      favs.push(carId);
      localStorage.setItem(key, JSON.stringify(favs));
    }
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc('/placeholder-car.jpg');
    }
  };

  // Dynamic exchange rate (should come from context/API in production)
  const exchangeRate = 27;

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') {
      return `K${(price * exchangeRate).toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800',
    'Reserved': 'bg-yellow-100 text-yellow-800',
    'Sold': 'bg-red-100 text-red-800',
    'In-Transit': 'bg-blue-100 text-blue-800',
  };

  return (
    <Link 
      href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}
      className={`group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 ${compact ? 'flex' : ''}`}
    >
      <div className={`relative overflow-hidden bg-gray-100 ${compact ? 'w-24 h-24 flex-shrink-0' : 'aspect-[4/3]'}`}>
        <Image
          src={imgSrc}
          alt={`${car.year} ${car.make} ${car.model} - ${car.condition || 'Used'} car for sale`}
          fill
          sizes={compact ? '96px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAUABhEHEiExQVH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A2PcO7MHtmjDbyU4TzkzRxhYoXlYhFLMfCIxHHPvz51T/2Q=="
        />
        {!compact && (
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart className="w-4 h-4" />
          </button>
        )}
        {!compact && car.status && (
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full shadow-sm ${statusColors[car.status] || 'bg-gray-100 text-gray-800'}`}>
            {car.status}
          </span>
        )}
        {!compact && car.isNew && (
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
            NEW
          </span>
        )}
      </div>
      <div className={compact ? 'p-2 flex-1 min-w-0' : 'p-4'}>
        {!compact && <div className="text-xs text-gray-500 mb-1">Stock# {car.stockNo || car.id}</div>}
        <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${compact ? 'text-sm truncate' : 'mb-1'}`}>
          {car.make} {car.model} {!compact && (car.grade || '')}
        </h3>
        {compact ? (
          <div className="text-xs text-gray-500">{car.year} • {car.mileageKm?.toLocaleString() || '0'} km</div>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
            <span>{car.year}</span>
            <span>•</span>
            <span>{car.mileageKm?.toLocaleString() || '0'} km</span>
            <span>•</span>
            <span>{car.transmission}</span>
          </div>
        )}
        <div className={compact ? '' : 'flex items-center justify-between'}>
          <div className={`font-bold text-blue-600 ${compact ? 'text-sm mt-1' : 'text-lg'}`}>
            {formatPrice(car.priceUsd || car.price || 0)}
          </div>
          {!compact && currency === 'ZMW' && car.priceUsd && (
            <div className="text-xs text-gray-500">≈ ${car.priceUsd.toLocaleString()}</div>
          )}
          {!compact && <span className="text-xs text-gray-500">{car.location || 'Lusaka'}</span>}
        </div>
      </div>
    </Link>
  );
}

// Sample cars for demo
const SAMPLE_CARS = [
  { id: '1', stockNo: 'DA-001', make: 'Toyota', model: 'Harrier', grade: 'Premium', year: 2019, mileageKm: 45000, priceUsd: 18500, transmission: 'AT', status: 'Available', location: 'Lusaka', images: ['/cars/car-1.jpg'] },
  { id: '2', stockNo: 'DA-002', make: 'Honda', model: 'CR-V', grade: 'EX', year: 2020, mileageKm: 32000, priceUsd: 22000, transmission: 'AT', status: 'Available', location: 'Lusaka', images: ['/cars/car-2.jpg'] },
  { id: '3', stockNo: 'DA-003', make: 'Nissan', model: 'X-Trail', grade: '', year: 2018, mileageKm: 58000, priceUsd: 15500, transmission: 'AT', status: 'Reserved', location: 'Ndola', images: ['/cars/car-3.jpg'] },
  { id: '4', stockNo: 'DA-004', make: 'Mazda', model: 'CX-5', grade: 'Touring', year: 2021, mileageKm: 18000, priceUsd: 28000, transmission: 'AT', status: 'Available', location: 'Lusaka', images: ['/cars/car-4.jpg'] },
  { id: '5', stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado', grade: 'TXL', year: 2017, mileageKm: 72000, priceUsd: 35000, transmission: 'AT', status: 'Available', location: 'Kitwe', images: ['/cars/car-5.jpg'] },
  { id: '6', stockNo: 'DA-006', make: 'Mitsubishi', model: 'Outlander', grade: '', year: 2019, mileageKm: 41000, priceUsd: 19000, transmission: 'AT', status: 'In-Transit', location: 'Lusaka', images: ['/cars/car-6.jpg'] },
  { id: '7', stockNo: 'DA-007', make: 'Suzuki', model: 'Vitara', grade: 'GLX', year: 2020, mileageKm: 28000, priceUsd: 16500, transmission: 'AT', status: 'Available', location: 'Lusaka', images: ['/cars/car-7.jpg'] },
  { id: '8', stockNo: 'DA-008', make: 'Hyundai', model: 'Tucson', grade: '', year: 2021, mileageKm: 22000, priceUsd: 24000, transmission: 'AT', status: 'Available', location: 'Livingstone', images: ['/cars/car-8.jpg'] },
];

// Skeleton loader for car cards
function CarCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
