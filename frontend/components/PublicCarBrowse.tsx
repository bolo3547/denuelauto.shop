import React, { useState, useEffect } from 'react';
import { SearchFilters } from './public/searchTypes';
import { 
  FaSearch, FaFilter, FaHeart, FaEye, FaShare, FaWhatsapp, 
  FaStar, FaMapMarkerAlt, FaDollarSign, FaCar, FaGasPump,
  FaCogs, FaPalette, FaCalendar, FaTachometerAlt, FaChevronLeft,
  FaChevronRight, FaGripHorizontal, FaList, FaSort, FaBookmark
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { trackEvent } from '../utils/analytics';
import { useRouter } from 'next/router';
const CarDetails = dynamic(() => import('./CarDetails'), { ssr: false });

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  description?: string;
  images: string[] | Array<{ url: string }>;
  features: string[];
  isFavorited?: boolean;
  viewCount?: number;
  isFeatured?: boolean;
  createdAt: string;
}

// Use shared SearchFilters interface

interface PublicCarBrowseProps {
  tenantSlug: string;
  onCarSelect?: (car: Car) => void;
  buyerId?: string;
  externalFilters?: Partial<SearchFilters>;
}

export default function PublicCarBrowse({ tenantSlug, onCarSelect, buyerId, externalFilters }: PublicCarBrowseProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewCarId, setQuickViewCarId] = useState<string | null>(null);
  const router = useRouter();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    make: '',
    model: '',
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: '',
    minMileage: '',
    maxMileage: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [availableFilters, setAvailableFilters] = useState({
    makes: [] as Array<{value: string, count: number}>,
    models: [] as Array<{value: string, count: number}>
  });

  // Helper to serialize multi-select arrays into comma separated values for API
  const serializeMulti = (values: string[] | undefined) => (values && values.length ? values.join(',') : '');

  useEffect(() => {
    loadCars();
  }, [filters, pagination.page]);

  // If parent provides externalFilters, merge them into internal filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({ ...prev, ...externalFilters }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [externalFilters]);

  const loadCars = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        tenantSlug,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });
      // Add multi-selects as comma-separated parameters
      if ((filters as any).bodyTypes && (filters as any).bodyTypes.length) {
        queryParams.set('bodyTypes', serializeMulti((filters as any).bodyTypes));
      }
      if ((filters as any).colors && (filters as any).colors.length) {
        queryParams.set('colors', serializeMulti((filters as any).colors));
      }

      const response = await fetch(`/api/public/cars/browse?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setCars(data.cars);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
        setAvailableFilters(data.filters);
      } else {
        console.error('Failed to load cars:', data.error);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleMultiFilterToggle = (key: 'bodyTypes' | 'colors', value: string) => {
    setFilters(prev => {
      const arr = (prev as any)[key] as string[] | undefined || [];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next } as any;
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    trackEvent('filter:toggle', { key, value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      minMileage: '',
      maxMileage: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      color: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const toggleFavorite = async (carId: string) => {
    if (!buyerId) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const response = await fetch(`/api/buyers/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('buyerToken')}`
        },
        body: JSON.stringify({ buyerId, carId })
      });

      if (response.ok) {
        setCars(prev => prev.map(car => 
          car.id === carId 
            ? { ...car, isFavorited: !car.isFavorited }
            : car
        ));
        trackEvent('favorite', { carId, buyerId });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="min-h-screen bg-gray-50" role="region" aria-label="Car Browse Results">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make, model, or stock number..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick View Modal (client-rendered CarDetails) */}
            {quickViewCarId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" role="dialog" aria-modal="true">
                <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
                  <div className="p-4 flex justify-end">
                    <button onClick={() => setQuickViewCarId(null)} aria-label="Close" className="p-2 rounded hover:bg-gray-100">Close</button>
                  </div>
                  <CarDetails carId={quickViewCarId} tenantSlug={tenantSlug} buyerId={buyerId} onClose={() => setQuickViewCarId(null)} />
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
                className="border rounded-lg px-3 py-3 bg-white min-w-32"
                aria-label="Filter by make"
              >
                <option value="">All Makes</option>
                {availableFilters.makes.map(make => (
                  <option key={make.value} value={make.value}>
                    {make.value} ({make.count})
                  </option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="border rounded-lg px-3 py-3 bg-white"
                aria-label="Sort results by"
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="year">Year: Newest</option>
                <option value="mileage">Mileage: Lowest</option>
              </select>
              <button
                aria-label="Toggle sort order"
                title="Toggle sort order"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                className="border rounded-lg px-3 py-3 bg-white ml-2"
              >
                {filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Range
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.yearMin}
                        onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.yearMax}
                        onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (USD)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minMileage}
                        onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxMileage}
                        onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                        className="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={filters.fuelType}
                      onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      aria-label="Filter by fuel type"
                    >
                      <option value="">All Types</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission
                    </label>
                    <select
                      value={filters.transmission}
                      onChange={(e) => handleFilterChange('transmission', e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      aria-label="Filter by transmission"
                    >
                      <option value="">All Types</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['SUV','Sedan','Hatchback','Coupe','Truck','Van'].map(bt => (
                      <button
                        key={bt}
                        onClick={() => handleMultiFilterToggle('bodyTypes', bt)}
                        className={`px-3 py-1 rounded border ${((filters as any).bodyTypes || []).includes(bt) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        aria-pressed={((filters as any).bodyTypes || []).includes(bt)}
                        aria-label={`Filter by ${bt}`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Black','White','Silver','Red','Blue','Green','Yellow'].map(c => (
                      <button
                        key={c}
                        onClick={() => handleMultiFilterToggle('colors', c)}
                        className={`px-3 py-1 rounded border ${((filters as any).colors || []).includes(c) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        aria-pressed={((filters as any).colors || []).includes(c)}
                        aria-label={`Filter by color ${c}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Showing {cars.length} of {pagination.total} cars
            {filters.search && ` for "${filters.search}"`}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="Grid view"
            >
              <FaGripHorizontal />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="List view"
            >
              <FaList />
            </button>
            <select
              aria-label="Results per page"
              className="border rounded px-2 py-1 ml-2"
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
            >
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cars Grid/List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <FaCar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  viewMode={viewMode}
                  onToggleFavorite={() => toggleFavorite(car.id)}
                  onViewDetails={() => { 
                    if (onCarSelect) {
                      onCarSelect(car);
                    } else {
                      router.push(`/t/${tenantSlug}/public/cars/${car.id}`); 
                      trackEvent('view:detail', { carId: car.id });
                    }
                  }}
                  onCarSelect={onCarSelect}
                  formatCurrency={formatCurrency}
                  buyerId={buyerId}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = pagination.page <= 3 
                      ? i + 1 
                      : Math.max(1, pagination.page - 2) + i;
                    
                    if (pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-3 py-2 rounded ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Car Card Component
interface CarCardProps {
  car: Car;
  viewMode: 'grid' | 'list';
  onToggleFavorite: () => void;
  onViewDetails: () => void;
  onCarSelect?: (car: Car) => void;
  formatCurrency: (amount: number) => string;
  buyerId?: string;
}

function CarCard({ car, viewMode, onToggleFavorite, onViewDetails, onCarSelect, formatCurrency, buyerId }: CarCardProps) {
  const isNew = car.createdAt ? ((Date.now() - new Date(car.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)) : false;
  if (viewMode === 'list') {
    const isNew = car.createdAt ? ((Date.now() - new Date(car.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)) : false;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <img
              src={(Array.isArray(car.images) ? (car.images as any)[0]?.url ?? car.images[0] : car.images[0]) || '/api/placeholder/300/200'}
              alt={`${car.make} ${car.model}`}
              className="w-48 h-32 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">
                {car.make} {car.model} {car.year}
              </h3>
              <div className="flex items-center gap-2">
                {isNew && <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">New</span>}
                {car.isFeatured && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-900 rounded">Featured</span>}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(car.price)}
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {car.description || `${car.make} ${car.model} ${car.year} - Stock: ${car.stockNo}`}
            </p>
            
            <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <FaTachometerAlt className="text-gray-400" />
                <span>{car.mileage?.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGasPump className="text-gray-400" />
                <span>{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCogs className="text-gray-400" />
                <span>{car.transmission}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>{car.location}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={onViewDetails}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaEye /> View Details
                </button>
                <button aria-label="WhatsApp Dealer" className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                  <FaWhatsapp />
                </button>
                <button aria-label="Share vehicle" className="bg-gray-100 text-gray-600 px-3 py-2 rounded hover:bg-gray-200">
                  <FaShare />
                </button>
              </div>
              
              {buyerId && (
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-full ${
                    car.isFavorited 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-400 hover:text-red-600'
                  }`}
                >
                  <FaHeart className={car.isFavorited ? 'fill-current' : ''} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative group" aria-labelledby={`car-${car.id}`}>
        <img
          src={(Array.isArray(car.images) ? (car.images as any)[0]?.url ?? car.images[0] : car.images[0]) || '/api/placeholder/300/200'}
          alt={`${car.make} ${car.model}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        
        {buyerId && (
          <button
            onClick={onToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full ${
              car.isFavorited 
                ? 'bg-red-100 text-red-600' 
                : 'bg-white text-gray-400 hover:text-red-600'
            }`}
            aria-label={car.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart className={car.isFavorited ? 'fill-current' : ''} />
          </button>
        )}
        
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          {car.stockNo}
        </div>
        
        {car.viewCount && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <FaEye /> {car.viewCount}
          </div>
        )}
        {/* Featured badge */}
        {car.isFeatured && (
          <div className="absolute top-3 right-16 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium">
            Featured
          </div>
        )}
        {/* New badge */}
        {isNew && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            New
          </div>
        )}

        {/* Quick action overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-25 pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            <button onClick={onViewDetails} aria-label={`Quick view ${car.make} ${car.model}`} className="bg-white text-gray-900 px-3 py-2 rounded">Quick View</button>
            <button onClick={onToggleFavorite} aria-label={car.isFavorited ? 'Remove favorite' : 'Add to favorites'} className="bg-white text-red-600 px-3 py-2 rounded"><FaHeart /></button>
            <button aria-label="Compare" className="bg-white text-gray-900 px-3 py-2 rounded">Compare</button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">
          {car.make} {car.model} {car.year}
        </h3>
        
        <div className="text-2xl font-bold text-blue-600 mb-3">
          {formatCurrency(car.price)}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>Mileage:</span>
            <span>{car.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex justify-between">
            <span>Fuel:</span>
            <span>{car.fuelType}</span>
          </div>
          <div className="flex justify-between">
            <span>Transmission:</span>
            <span>{car.transmission}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span>{car.location}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onViewDetails}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FaEye /> View Details
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            <FaWhatsapp />
          </button>
          <button className="bg-gray-100 text-gray-600 py-2 px-4 rounded hover:bg-gray-200">
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
}
