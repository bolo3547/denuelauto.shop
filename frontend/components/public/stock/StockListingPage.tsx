'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaFilter,
  FaTh,
  FaList,
  FaSortAmountDown,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaBell,
  FaSpinner,
} from 'react-icons/fa';
import { useTenantTheme } from '../tenant';
import CarCard from '../cards/CarCard';

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
  originalPrice?: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel: string;
  engineSize?: string;
  bodyType?: string;
  color?: string;
  images: string[];
  location?: string;
  isNew?: boolean;
  isHot?: boolean;
  isPriceDrop?: boolean;
  discountPercent?: number;
}

interface FilterState {
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
  transmission: string;
  fuel: string;
  bodyType: string;
  color: string;
  driveType: string;
  steering: string;
  country: string;
}

interface StockListingPageProps {
  tenantSlug: string;
  initialCars?: Car[];
  initialTotal?: number;
}

// =====================================================
// FILTER SIDEBAR
// =====================================================
function FilterSidebar({
  filters,
  setFilters,
  onApply,
  onClear,
  isOpen,
  onClose,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { settings, currency } = useTenantTheme();

  const makes: string[] = settings.homepageConfig?.featuredMakes ?? [
    'Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Suzuki', 
    'Subaru', 'Hyundai', 'Mercedes-Benz', 'BMW', 'Audi', 'Ford'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  
  const priceOptions = currency === 'ZMW'
    ? [25000, 50000, 75000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000]
    : [1000, 2500, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 100000];

  const mileageOptions = [10000, 30000, 50000, 75000, 100000, 150000, 200000];

  const bodyTypes = ['SUV', 'Sedan', 'Hatchback', 'Pickup/Truck', 'Van', 'Wagon', 'Coupe', 'Convertible'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Pearl', 'Other'];
  const driveTypes = ['2WD', '4WD', 'AWD'];
  const steeringOptions = ['Right Hand', 'Left Hand'];

  const formatPrice = (price: number) => {
    return currency === 'ZMW' ? `K${price.toLocaleString()}` : `$${price.toLocaleString()}`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-80 bg-white lg:bg-transparent 
                   z-50 lg:z-auto overflow-y-auto transform transition-transform duration-300
                   ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-4 lg:p-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-bold">Filters</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close filters"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            {/* Make */}
            <FilterSection title="Make">
              <select
                aria-label="Filter by make"
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value, model: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Makes</option>
                {makes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </FilterSection>

            {/* Model */}
            <FilterSection title="Model">
              <select
                aria-label="Filter by model"
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                disabled={!filters.make}
              >
                <option value="">All Models</option>
              </select>
            </FilterSection>

            {/* Year Range */}
            <FilterSection title="Year">
              <div className="flex gap-2">
                <select
                  aria-label="Filter by minimum year"
                  value={filters.yearFrom}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">From</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter by maximum year"
                  value={filters.yearTo}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">To</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title={`Price (${currency})`}>
              <div className="flex gap-2">
                <select
                  aria-label="Filter by minimum price"
                  value={filters.priceFrom}
                  onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">Min</option>
                  {priceOptions.map((price) => (
                    <option key={price} value={price}>{formatPrice(price)}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter by maximum price"
                  value={filters.priceTo}
                  onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">Max</option>
                  {priceOptions.map((price) => (
                    <option key={price} value={price}>{formatPrice(price)}</option>
                  ))}
                </select>
              </div>
            </FilterSection>

            {/* Mileage Range */}
            <FilterSection title="Mileage (km)">
              <div className="flex gap-2">
                <select
                  aria-label="Filter by minimum mileage"
                  value={filters.mileageFrom}
                  onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">Min</option>
                  {mileageOptions.map((km) => (
                    <option key={km} value={km}>{km.toLocaleString()}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter by maximum mileage"
                  value={filters.mileageTo}
                  onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                >
                  <option value="">Max</option>
                  {mileageOptions.map((km) => (
                    <option key={km} value={km}>{km.toLocaleString()}</option>
                  ))}
                </select>
              </div>
            </FilterSection>

            {/* Body Type */}
            <FilterSection title="Body Type">
              <select
                aria-label="Filter by body type"
                value={filters.bodyType}
                onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Types</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </FilterSection>

            {/* Transmission */}
            <FilterSection title="Transmission">
              <div className="flex flex-wrap gap-2">
                {transmissions.map((trans) => (
                  <button
                    type="button"
                    key={trans}
                    onClick={() => setFilters({ 
                      ...filters, 
                      transmission: filters.transmission === trans ? '' : trans 
                    })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filters.transmission === trans
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]'
                    }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Fuel Type */}
            <FilterSection title="Fuel Type">
              <div className="flex flex-wrap gap-2">
                {fuelTypes.map((fuel) => (
                  <button
                    type="button"
                    key={fuel}
                    onClick={() => setFilters({ 
                      ...filters, 
                      fuel: filters.fuel === fuel ? '' : fuel 
                    })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filters.fuel === fuel
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]'
                    }`}
                  >
                    {fuel}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Color */}
            <FilterSection title="Color" collapsible defaultOpen={false}>
              <select
                aria-label="Filter by color"
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Colors</option>
                {colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </FilterSection>

            {/* Drive Type */}
            <FilterSection title="Drive Type" collapsible defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {driveTypes.map((drive) => (
                  <button
                    type="button"
                    key={drive}
                    onClick={() => setFilters({ 
                      ...filters, 
                      driveType: filters.driveType === drive ? '' : drive 
                    })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filters.driveType === drive
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]'
                    }`}
                  >
                    {drive}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Steering */}
            <FilterSection title="Steering" collapsible defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {steeringOptions.map((steering) => (
                  <button
                    type="button"
                    key={steering}
                    onClick={() => setFilters({ 
                      ...filters, 
                      steering: filters.steering === steering ? '' : steering 
                    })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filters.steering === steering
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]'
                    }`}
                  >
                    {steering}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={onApply}
              className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={onClear}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-gray-800 ${
          collapsible ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
        }`}
      >
        {title}
        {collapsible && (
          <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      {(!collapsible || isOpen) && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN STOCK LISTING PAGE
// =====================================================
export default function StockListingPage({
  tenantSlug,
  initialCars = [],
  initialTotal = 0,
}: StockListingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = useTenantTheme();

  const [cars, setCars] = useState<Car[]>(initialCars);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 24;

  const [filters, setFilters] = useState<FilterState>({
    make: searchParams?.get('make') || '',
    model: searchParams?.get('model') || '',
    yearFrom: searchParams?.get('yearFrom') || '',
    yearTo: searchParams?.get('yearTo') || '',
    priceFrom: searchParams?.get('priceFrom') || '',
    priceTo: searchParams?.get('priceTo') || '',
    mileageFrom: searchParams?.get('mileageFrom') || '',
    mileageTo: searchParams?.get('mileageTo') || '',
    transmission: searchParams?.get('transmission') || '',
    fuel: searchParams?.get('fuel') || '',
    bodyType: searchParams?.get('bodyType') || '',
    color: searchParams?.get('color') || '',
    driveType: searchParams?.get('driveType') || '',
    steering: searchParams?.get('steering') || '',
    country: searchParams?.get('country') || '',
  });

  // Fetch cars when filters change
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());
        params.set('sort', sortBy);
        params.set('currency', currency);

        const res = await fetch(`/api/t/${tenantSlug}/stock?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCars(data.cars || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, currentPage, sortBy, currency, tenantSlug]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setSidebarOpen(false);
    // Update URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/t/${tenantSlug}/stock?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      make: '', model: '', yearFrom: '', yearTo: '',
      priceFrom: '', priceTo: '', mileageFrom: '', mileageTo: '',
      transmission: '', fuel: '', bodyType: '', color: '',
      driveType: '', steering: '', country: '',
    });
    setCurrentPage(1);
    router.push(`/t/${tenantSlug}/stock`);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {filters.make ? `${filters.make} ${filters.model || ''}`.trim() : 'All Vehicles'}
              </h1>
              <p className="text-gray-600 mt-1">
                {total.toLocaleString()} vehicles found
                {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/t/${tenantSlug}/account/saved-searches/new`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <FaBell />
                Save Search
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 
                           rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaFilter />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[var(--accent)] text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <FaSortAmountDown className="text-gray-400" />
                  <select
                    aria-label="Sort vehicles"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="mileage-low">Mileage: Low to High</option>
                    <option value="year-new">Year: Newest</option>
                    <option value="year-old">Year: Oldest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    aria-label="Show vehicles in grid view"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-[var(--accent)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FaTh />
                  </button>
                  <button
                    type="button"
                    aria-label="Show vehicles in list view"
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setFilters({ ...filters, [key]: '' })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] 
                               rounded-full text-sm hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      {key}: {value}
                      <FaTimes className="text-xs" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-gray-600 hover:text-red-600 text-sm underline"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-[var(--accent)]" />
              </div>
            ) : cars.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FaSearch className="mx-auto text-5xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria to find more vehicles.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Car Grid/List */
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
                }>
                  {cars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      tenantSlug={tenantSlug}
                      compact={viewMode === 'list'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed 
                               hover:bg-gray-50 transition-colors"
                      aria-label="Go to previous page"
                    >
                      <FaChevronLeft />
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          type="button"
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg border transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          aria-label={`Go to page ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed 
                               hover:bg-gray-50 transition-colors"
                      aria-label="Go to next page"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
