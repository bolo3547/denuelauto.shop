"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaSearch, FaHeart, FaFilter, FaTh, FaList, FaSort, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaExchangeAlt, FaTimes, FaCheck
} from 'react-icons/fa';
import BeForwardHeader from './BeForwardHeader';
import BeForwardFooter from './BeForwardFooter';

interface StockListingPageProps {
  tenantSlug: string;
  tenant?: any;
  initialCars?: any[];
  totalCount?: number;
}

const MAKES = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Suzuki', 'Hyundai', 'Mercedes', 'BMW', 'Volkswagen'];
const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Pickup', 'Van', 'Wagon', 'Coupe', 'Convertible'];
const TRANSMISSIONS = ['AT', 'MT', 'CVT'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const YEARS = Array.from({ length: 25 }, (_, i) => 2024 - i);

export default function StockListingPage({ tenantSlug, tenant, initialCars = [], totalCount = 0 }: StockListingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [currency, setCurrency] = useState('ZMW');
  const [sortBy, setSortBy] = useState('newest');

  // Filter states
  const [filters, setFilters] = useState({
    make: searchParams?.get('make') || '',
    model: searchParams?.get('model') || '',
    yearFrom: searchParams?.get('yearFrom') || '',
    yearTo: searchParams?.get('yearTo') || '',
    priceFrom: searchParams?.get('priceFrom') || '',
    priceTo: searchParams?.get('priceTo') || '',
    mileageFrom: searchParams?.get('mileageFrom') || '',
    mileageTo: searchParams?.get('mileageTo') || '',
    bodyType: searchParams?.get('bodyType') || '',
    transmission: searchParams?.get('transmission') || '',
    fuel: searchParams?.get('fuel') || '',
    status: searchParams?.get('status') || '',
    stockNo: searchParams?.get('stockNo') || '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedCompare = localStorage.getItem(`compare:${tenantSlug}`);
    if (savedCompare) setCompareList(JSON.parse(savedCompare));
  }, [tenantSlug]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...(initialCars.length > 0 ? initialCars : SAMPLE_CARS)];

    if (filters.make) result = result.filter(c => c.make.toLowerCase() === filters.make.toLowerCase());
    if (filters.model) result = result.filter(c => c.model.toLowerCase().includes(filters.model.toLowerCase()));
    if (filters.yearFrom) result = result.filter(c => c.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) result = result.filter(c => c.year <= parseInt(filters.yearTo));
    if (filters.priceFrom) result = result.filter(c => (c.priceUsd || 0) >= parseInt(filters.priceFrom));
    if (filters.priceTo) result = result.filter(c => (c.priceUsd || 0) <= parseInt(filters.priceTo));
    if (filters.bodyType) result = result.filter(c => c.bodyType === filters.bodyType);
    if (filters.transmission) result = result.filter(c => c.transmission === filters.transmission);
    if (filters.fuel) result = result.filter(c => c.fuel === filters.fuel);
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.stockNo) result = result.filter(c => c.stockNo?.toLowerCase().includes(filters.stockNo.toLowerCase()));

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0)); break;
      case 'price-high': result.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0)); break;
      case 'year-new': result.sort((a, b) => b.year - a.year); break;
      case 'year-old': result.sort((a, b) => a.year - b.year); break;
      case 'mileage-low': result.sort((a, b) => (a.mileageKm || 0) - (b.mileageKm || 0)); break;
      default: break;
    }

    return result;
  }, [initialCars, filters, sortBy]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      make: '', model: '', yearFrom: '', yearTo: '', priceFrom: '', priceTo: '',
      mileageFrom: '', mileageTo: '', bodyType: '', transmission: '', fuel: '', status: '', stockNo: ''
    });
    setCurrentPage(1);
  };

  const toggleCompare = (carId: string) => {
    const newList = compareList.includes(carId)
      ? compareList.filter(id => id !== carId)
      : [...compareList, carId].slice(0, 4);
    setCompareList(newList);
    localStorage.setItem(`compare:${tenantSlug}`, JSON.stringify(newList));
  };

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link href={`/t/${tenantSlug}`} className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Stock List</li>
          </ol>
        </nav>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'w-72' : 'w-0'} flex-shrink-0 transition-all overflow-hidden`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Stock Number Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock No.</label>
                <input
                  type="text"
                  value={filters.stockNo}
                  onChange={(e) => handleFilterChange('stockNo', e.target.value)}
                  placeholder="e.g. DA-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Make */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Makes</option>
                  {MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
              </div>

              {/* Model */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  placeholder="Enter model"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Year Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">From</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select
                    value={filters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">To</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.priceFrom}
                    onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                    placeholder="Min"
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={filters.priceTo}
                    onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                    placeholder="Max"
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Body Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                <select
                  value={filters.bodyType}
                  onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Fuel Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  value={filters.fuel}
                  onChange={(e) => handleFilterChange('fuel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="In-Transit">In Transit</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <FaFilter className="w-4 h-4" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">{activeFilterCount}</span>
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    <strong>{filteredCars.length}</strong> vehicles found
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="year-new">Year: Newest</option>
                    <option value="year-old">Year: Oldest</option>
                    <option value="mileage-low">Mileage: Lowest</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      aria-label="Grid view"
                    >
                      <FaTh className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      aria-label="List view"
                    >
                      <FaList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Compare Bar */}
            {compareList.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaExchangeAlt className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {compareList.length} car(s) selected for comparison
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/t/${tenantSlug}/compare?ids=${compareList.join(',')}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Compare Now
                    </Link>
                    <button
                      onClick={() => { setCompareList([]); localStorage.removeItem(`compare:${tenantSlug}`); }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cars Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedCars.map(car => (
                  <CarGridCard
                    key={car.id || car.stockNo}
                    car={car}
                    tenantSlug={tenantSlug}
                    currency={currency}
                    isComparing={compareList.includes(car.id || car.stockNo)}
                    onToggleCompare={() => toggleCompare(car.id || car.stockNo)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCars.map(car => (
                  <CarListCard
                    key={car.id || car.stockNo}
                    car={car}
                    tenantSlug={tenantSlug}
                    currency={currency}
                    isComparing={compareList.includes(car.id || car.stockNo)}
                    onToggleCompare={() => toggleCompare(car.id || car.stockNo)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />
    </div>
  );
}

// Grid Card Component
function CarGridCard({ car, tenantSlug, currency, isComparing, onToggleCompare }: any) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem(`favs:${tenantSlug}`) || '[]');
    setIsFavorite(favs.includes(car.id || car.stockNo));
  }, [car.id, car.stockNo, tenantSlug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const carId = car.id || car.stockNo;
    const newFavs = isFavorite ? favs.filter((id: string) => id !== carId) : [...favs, carId];
    localStorage.setItem(key, JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800',
    'Reserved': 'bg-yellow-100 text-yellow-800',
    'Sold': 'bg-red-100 text-red-800',
    'In-Transit': 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group">
      <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={car.images?.[0] || '/placeholder-car.jpg'}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
            }`}
          >
            <FaHeart className="w-4 h-4" />
          </button>
          {car.status && (
            <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded ${statusColors[car.status]}`}>
              {car.status}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-1">#{car.stockNo || car.id}</div>
        <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
            {car.make} {car.model} {car.grade || ''}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-1 text-xs text-gray-600 my-2">
          <span>{car.year}</span>
          <span>•</span>
          <span>{car.mileageKm?.toLocaleString() || 0}km</span>
          <span>•</span>
          <span>{car.transmission}</span>
          <span>•</span>
          <span>{car.fuel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">{formatPrice(car.priceUsd || 0)}</div>
          <button
            onClick={(e) => { e.preventDefault(); onToggleCompare(); }}
            className={`p-2 rounded border ${isComparing ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            title={isComparing ? 'Remove from compare' : 'Add to compare'}
          >
            {isComparing ? <FaCheck className="w-3 h-3" /> : <FaExchangeAlt className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// List Card Component
function CarListCard({ car, tenantSlug, currency, isComparing, onToggleCompare }: any) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem(`favs:${tenantSlug}`) || '[]');
    setIsFavorite(favs.includes(car.id || car.stockNo));
  }, [car.id, car.stockNo, tenantSlug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const carId = car.id || car.stockNo;
    const newFavs = isFavorite ? favs.filter((id: string) => id !== carId) : [...favs, carId];
    localStorage.setItem(key, JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
      <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`} className="w-64 flex-shrink-0">
        <img src={car.images?.[0] || '/placeholder-car.jpg'} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
      </Link>
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Stock# {car.stockNo || car.id}</div>
            <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {car.make} {car.model} {car.grade || ''}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">{formatPrice(car.priceUsd || 0)}</div>
            {currency === 'ZMW' && <div className="text-xs text-gray-500">≈ ${car.priceUsd?.toLocaleString()}</div>}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 my-3">
          <div><span className="text-gray-400">Year:</span> {car.year}</div>
          <div><span className="text-gray-400">Mileage:</span> {car.mileageKm?.toLocaleString()}km</div>
          <div><span className="text-gray-400">Trans:</span> {car.transmission}</div>
          <div><span className="text-gray-400">Fuel:</span> {car.fuel}</div>
        </div>
        <div className="flex items-center gap-3 mt-auto">
          <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            View Details
          </Link>
          <button onClick={toggleFavorite} className={`p-2 rounded-lg border ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500'}`}>
            <FaHeart className="w-4 h-4" />
          </button>
          <button onClick={onToggleCompare} className={`p-2 rounded-lg border ${isComparing ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-500'}`}>
            <FaExchangeAlt className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sample cars
const SAMPLE_CARS = [
  { id: '1', stockNo: 'DA-001', make: 'Toyota', model: 'Harrier', grade: 'Premium', year: 2019, mileageKm: 45000, priceUsd: 18500, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Available', location: 'Lusaka', images: ['/cars/car-1.jpg'] },
  { id: '2', stockNo: 'DA-002', make: 'Honda', model: 'CR-V', grade: 'EX', year: 2020, mileageKm: 32000, priceUsd: 22000, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Available', location: 'Lusaka', images: ['/cars/car-2.jpg'] },
  { id: '3', stockNo: 'DA-003', make: 'Nissan', model: 'X-Trail', grade: '', year: 2018, mileageKm: 58000, priceUsd: 15500, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Reserved', location: 'Ndola', images: ['/cars/car-3.jpg'] },
  { id: '4', stockNo: 'DA-004', make: 'Mazda', model: 'CX-5', grade: 'Touring', year: 2021, mileageKm: 18000, priceUsd: 28000, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Available', location: 'Lusaka', images: ['/cars/car-4.jpg'] },
  { id: '5', stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado', grade: 'TXL', year: 2017, mileageKm: 72000, priceUsd: 35000, transmission: 'AT', fuel: 'Diesel', bodyType: 'SUV', status: 'Available', location: 'Kitwe', images: ['/cars/car-5.jpg'] },
  { id: '6', stockNo: 'DA-006', make: 'Mitsubishi', model: 'Outlander', grade: '', year: 2019, mileageKm: 41000, priceUsd: 19000, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'In-Transit', location: 'Lusaka', images: ['/cars/car-6.jpg'] },
  { id: '7', stockNo: 'DA-007', make: 'Suzuki', model: 'Vitara', grade: 'GLX', year: 2020, mileageKm: 28000, priceUsd: 16500, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Available', location: 'Lusaka', images: ['/cars/car-7.jpg'] },
  { id: '8', stockNo: 'DA-008', make: 'Hyundai', model: 'Tucson', grade: '', year: 2021, mileageKm: 22000, priceUsd: 24000, transmission: 'AT', fuel: 'Petrol', bodyType: 'SUV', status: 'Available', location: 'Livingstone', images: ['/cars/car-8.jpg'] },
  { id: '9', stockNo: 'DA-009', make: 'Toyota', model: 'Corolla', grade: 'XLi', year: 2020, mileageKm: 35000, priceUsd: 14000, transmission: 'AT', fuel: 'Petrol', bodyType: 'Sedan', status: 'Available', location: 'Lusaka', images: ['/cars/car-9.jpg'] },
  { id: '10', stockNo: 'DA-010', make: 'Honda', model: 'Fit', grade: 'RS', year: 2019, mileageKm: 42000, priceUsd: 9500, transmission: 'AT', fuel: 'Petrol', bodyType: 'Hatchback', status: 'Available', location: 'Lusaka', images: ['/cars/car-10.jpg'] },
  { id: '11', stockNo: 'DA-011', make: 'Toyota', model: 'Hilux', grade: 'SR5', year: 2018, mileageKm: 68000, priceUsd: 26000, transmission: 'AT', fuel: 'Diesel', bodyType: 'Pickup', status: 'Available', location: 'Ndola', images: ['/cars/car-11.jpg'] },
  { id: '12', stockNo: 'DA-012', make: 'Nissan', model: 'Navara', grade: '', year: 2019, mileageKm: 55000, priceUsd: 23000, transmission: 'AT', fuel: 'Diesel', bodyType: 'Pickup', status: 'Available', location: 'Lusaka', images: ['/cars/car-12.jpg'] },
];
