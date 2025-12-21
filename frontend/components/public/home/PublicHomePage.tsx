'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaSearch, FaArrowRight, FaChevronRight, FaStar, FaHeart,
  FaBalanceScale, FaWhatsapp, FaShieldAlt, FaTruck, FaCalculator,
  FaFileAlt, FaHeadset, FaCheckCircle, FaClock, FaHandshake,
  FaPhone, FaEnvelope, FaQuestionCircle, FaCreditCard, FaMapMarkerAlt,
  FaCar, FaEye
} from 'react-icons/fa';
import { useTenantTheme } from '../tenant';
import CarCard from '../cards/CarCard';
import PromoBucketsGrid from './sections/PromoBucketsGrid';
import ShopByMake from './sections/ShopByMake';
import ShopByBodyType from './sections/ShopByBodyType';
import RecentlyViewedCars from './sections/RecentlyViewedCars';
import WhyChooseUs from './sections/WhyChooseUs';
import HowToBuySteps from './sections/HowToBuySteps';
import HelpCards from './sections/HelpCards';
import TestimonialsSection from './sections/TestimonialsSection';

// =====================================================
// TYPES
// =====================================================
interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel: string;
  bodyType?: string;
  images: string[];
  location?: string;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface PublicHomePageProps {
  tenantSlug: string;
  newArrivals?: Car[];
  featuredCars?: Car[];
}

// =====================================================
// HERO SEARCH SECTION
// =====================================================
function HeroSearchSection({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const { settings, currency } = useTenantTheme();
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    transmission: '',
    stockNo: '',
  });

  const popularMakes = settings.homepageConfig?.featuredMakes || [
    'Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Suzuki', 'Hyundai', 'Mercedes-Benz'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('currency', currency);
    router.push(`/t/${tenantSlug}/stock?${params.toString()}`);
  };

  const handleStockNoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.stockNo) {
      router.push(`/t/${tenantSlug}/stock/${filters.stockNo}`);
    }
  };

  // Year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  // Price options (in local currency)
  const priceOptions = currency === 'ZMW' 
    ? [50000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000]
    : [2000, 5000, 10000, 15000, 20000, 30000, 50000, 100000];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 md:py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {settings.seo?.title || `Find Your Perfect Car in ${settings.defaultCountry || 'Zambia'}`}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            {settings.seo?.description || 'Quality used vehicles with financing options. Browse our extensive stock today.'}
          </p>
        </div>

        {/* Main Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Make */}
            <select
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value, model: '' })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-gray-700"
              aria-label="Select make"
            >
              <option value="">All Makes</option>
              {popularMakes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Model */}
            <select
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-gray-700"
              aria-label="Select model"
              disabled={!filters.make}
            >
              <option value="">All Models</option>
              {/* Models would be populated based on selected make */}
            </select>

            {/* Year From */}
            <select
              value={filters.yearFrom}
              onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-gray-700"
              aria-label="Year from"
            >
              <option value="">Year From</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Price To */}
            <select
              value={filters.priceTo}
              onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-gray-700"
              aria-label="Max price"
            >
              <option value="">Max Price</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  {currency === 'ZMW' ? `K${price.toLocaleString()}` : `$${price.toLocaleString()}`}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="col-span-2 md:col-span-1 bg-[var(--accent)] hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <FaSearch />
              <span>Search Stock</span>
            </button>
          </div>

          {/* Secondary Filters Row */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Transmission */}
              <select
                value={filters.transmission}
                onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[var(--accent)]"
                aria-label="Transmission"
              >
                <option value="">Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>

              {/* Quick Filters */}
              <Link
                href={`/t/${tenantSlug}/stock?sort=newest`}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                ✨ New Arrivals
              </Link>
              <Link
                href={`/t/${tenantSlug}/stock?featured=true`}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                🔥 Best Deals
              </Link>
            </div>

            {/* Stock Number Search */}
            <form onSubmit={handleStockNoSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={filters.stockNo}
                onChange={(e) => setFilters({ ...filters, stockNo: e.target.value.toUpperCase() })}
                placeholder="Stock No."
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent)]"
                aria-label="Stock number"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                aria-label="Search by stock number"
              >
                Go
              </button>
            </form>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-center">
          <div className="text-white">
            <span className="text-2xl md:text-3xl font-bold text-[var(--accent)]">1,200+</span>
            <p className="text-gray-400 text-sm">Vehicles in Stock</p>
          </div>
          <div className="text-white">
            <span className="text-2xl md:text-3xl font-bold text-[var(--accent)]">500+</span>
            <p className="text-gray-400 text-sm">Happy Customers</p>
          </div>
          <div className="text-white">
            <span className="text-2xl md:text-3xl font-bold text-[var(--accent)]">5+ Years</span>
            <p className="text-gray-400 text-sm">In Business</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// NEW ARRIVALS SECTION
// =====================================================
function NewArrivalsSection({ tenantSlug, cars }: { tenantSlug: string; cars: Car[] }) {
  if (!cars || cars.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">✨ New Arrivals</h2>
            <p className="text-gray-600 mt-1">Fresh stock just added to our inventory</p>
          </div>
          <Link
            href={`/t/${tenantSlug}/stock?sort=newest`}
            className="flex items-center gap-2 text-[var(--accent)] hover:underline font-medium"
          >
            View All <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {cars.slice(0, 12).map((car) => (
            <CarCard key={car.id} car={car} tenantSlug={tenantSlug} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// MAIN HOMEPAGE COMPONENT
// =====================================================
export default function PublicHomePage({
  tenantSlug,
  newArrivals = [],
  featuredCars = [],
}: PublicHomePageProps) {
  const { settings } = useTenantTheme();
  const enabledSections = settings.homepageConfig?.enabledSections || [
    'hero', 'promo-buckets', 'new-arrivals', 'shop-by-make', 'shop-by-body',
    'recently-viewed', 'why-choose-us', 'how-to-buy', 'help-cards', 'testimonials'
  ];

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSearchSection key="hero" tenantSlug={tenantSlug} />;
      case 'promo-buckets':
        return <PromoBucketsGrid key="promo-buckets" tenantSlug={tenantSlug} />;
      case 'new-arrivals':
        return <NewArrivalsSection key="new-arrivals" tenantSlug={tenantSlug} cars={newArrivals} />;
      case 'shop-by-make':
        return <ShopByMake key="shop-by-make" tenantSlug={tenantSlug} />;
      case 'shop-by-body':
        return <ShopByBodyType key="shop-by-body" tenantSlug={tenantSlug} />;
      case 'recently-viewed':
        return <RecentlyViewedCars key="recently-viewed" tenantSlug={tenantSlug} />;
      case 'why-choose-us':
        return <WhyChooseUs key="why-choose-us" />;
      case 'how-to-buy':
        return <HowToBuySteps key="how-to-buy" />;
      case 'help-cards':
        return <HelpCards key="help-cards" />;
      case 'testimonials':
        return <TestimonialsSection key="testimonials" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {enabledSections.map(renderSection)}
    </div>
  );
}
