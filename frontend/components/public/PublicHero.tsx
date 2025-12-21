import React, { useState } from 'react';
import { SearchFilters } from './searchTypes';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useRouter } from 'next/router';
import TestimonialsCarousel from './TestimonialsCarousel';

interface Props {
  banner?: string;
  title?: string;
  keyword?: string;
  setKeyword?: (s: string) => void;
  onSearch?: () => void;
  totalCarsCount?: number | null;
  filters?: Partial<SearchFilters>;
  onFiltersChange?: (filters: Partial<SearchFilters>) => void;
}

const PublicHero: React.FC<Props> = ({
  banner,
  title,
  keyword = '',
  setKeyword,
  onSearch,
  totalCarsCount,
  filters = {},
  onFiltersChange
}) => {
  const router = useRouter();
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const doSearch = () => {
    if (onSearch) onSearch();
    // If the caller doesn't provide onSearch, route to browse with query
    if (!onSearch) {
      router.push('/t/' + (router.query.slug || 'store') + '?q=' + encodeURIComponent(keyword || ''));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  // Be Forward style filter options
  const makes = [
    'TOYOTA', 'NISSAN', 'HONDA', 'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI',
    'ISUZU', 'DAIHATSU', 'HINO', 'LEXUS', 'MERCEDES-BENZ', 'BMW', 'VOLKSWAGEN',
    'AUDI', 'PEUGEOT', 'FORD', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'JEEP',
    'CHEVROLET', 'HYUNDAI', 'KIA', 'SSANGYONG', 'RENAULT SAMSUNG'
  ];

  const vehicleTypes = [
    'SUV', 'Sedan', 'Truck', 'Pick up', 'Van', 'Bus', 'Mini Van', 'Hatchback',
    'Coupe', 'Convertible', 'Wagon', 'Mini Bus'
  ];

  const steerings = ['Left', 'Right'];

  const priceRanges = [
    'Under $500', '$500 - $1,000', '$1,000 - $1,500', '$1,500 - $2,000',
    '$2,000 - $2,500', '$2,500 - $4,000', 'Over $4,000'
  ];

  const yearRanges = [
    '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016',
    '2015', '2014', '2013', '2012', '2011 and Older'
  ];

  return (
    <section id="home" className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50 animate-pulse"></div>
      <div className="relative min-h-[80vh] flex items-center justify-center">
        <img src={banner || '/api/placeholder/1400/700'} alt="banner" className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        <div className="relative text-center text-white px-8 max-w-7xl w-full z-10">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 drop-shadow-lg animate-fade-in">{title || 'Find Your Next Car'}</h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in delay-100">Browse our inventory and find great deals on quality vehicles — inspected, certified and ready for export.</p>

          {/* Be Forward Style Search Section */}
          <div className="mt-6 animate-fade-in delay-200">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <FaSearch className="text-blue-600" />
                SEARCH FOR CARS
              </h2>

              {/* Main search filters row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-4">
                <div>
                  <label htmlFor="make-select" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <select
                    id="make-select"
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select vehicle make"
                  >
                    <option value="">Select</option>
                    {makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    id="model-select"
                    value={filters.model || ''}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select vehicle model"
                  >
                    <option value="">Select</option>
                    {/* Model options would be populated based on selected make */}
                    <option value="Corolla">Corolla</option>
                    <option value="Camry">Camry</option>
                    <option value="RAV4">RAV4</option>
                    <option value="Land Cruiser">Land Cruiser</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price-select" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <select
                    id="price-select"
                    value={filters.priceMin && filters.priceMax ? `${filters.priceMin}-${filters.priceMax}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Under $500') {
                        handleFilterChange('priceMin', '0');
                        handleFilterChange('priceMax', '500');
                      } else if (value === 'Over $4,000') {
                        handleFilterChange('priceMin', '4000');
                        handleFilterChange('priceMax', '');
                      } else {
                        const parts = value.replace(/[$,]/g, '').split('-');
                        if (parts.length === 2) {
                          handleFilterChange('priceMin', parts[0].trim());
                          handleFilterChange('priceMax', parts[1].trim());
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select price range"
                  >
                    <option value="">Select</option>
                    {priceRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="body-type-select" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    id="body-type-select"
                    value={filters.bodyType || ''}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select vehicle type"
                  >
                    <option value="">Select</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="steering-select" className="block text-sm font-medium text-gray-700 mb-1">Steering</label>
                  <select
                    id="steering-select"
                    value={filters.steering || ''}
                    onChange={(e) => handleFilterChange('steering', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select steering side"
                  >
                    <option value="">Select</option>
                    {steerings.map(steering => (
                      <option key={steering} value={steering}>{steering}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    id="year-select"
                    value={filters.yearMin && filters.yearMax ? `${filters.yearMin}-${filters.yearMax}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '2011 and Older') {
                        handleFilterChange('yearMin', '0');
                        handleFilterChange('yearMax', '2011');
                      } else {
                        handleFilterChange('yearMin', value);
                        handleFilterChange('yearMax', value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label="Select vehicle year"
                  >
                    <option value="">Select ~ Select</option>
                    {yearRanges.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search button and results count */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-lg font-semibold text-gray-800">
                  {(totalCarsCount ?? 497915).toLocaleString()} items match
                </div>
                <button
                  onClick={doSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search for cars"
                >
                  <FaSearch />
                  SEARCH
                </button>
              </div>

              {/* Advanced filters toggle */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <FaFilter />
                  {isFiltersExpanded ? 'Hide' : 'Show'} Advanced Filters
                </button>
              </div>

              {/* Expanded filters */}
              {isFiltersExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label htmlFor="keyword-input" className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                      <input
                        id="keyword-input"
                        type="text"
                        placeholder="Keyword, make, model, or stock no."
                        value={keyword}
                        onChange={(e) => setKeyword?.(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="min-year-input" className="block text-sm font-medium text-gray-700 mb-1">Min Year</label>
                      <input
                        id="min-year-input"
                        type="number"
                        placeholder="Min Year"
                        value={filters.yearMin || ''}
                        onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="max-year-input" className="block text-sm font-medium text-gray-700 mb-1">Max Year</label>
                      <input
                        id="max-year-input"
                        type="number"
                        placeholder="Max Year"
                        value={filters.yearMax || ''}
                        onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="fuel-type-select" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <select
                        id="fuel-type-select"
                        value={filters.fuelType || ''}
                        onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        aria-label="Select fuel type"
                      >
                        <option value="">Any</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges and stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 animate-fade-in delay-300">
            <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 shadow">
              <span className="text-blue-600"><FaSearch /></span>
              <span className="font-semibold text-gray-800">Inspected Vehicles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 shadow">
              <span className="text-blue-600"><FaSearch /></span>
              <span className="font-semibold text-gray-800">Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 shadow">
              <span className="text-blue-600"><FaSearch /></span>
              <span className="font-semibold text-gray-800">Warranty Options</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 shadow">
              <span className="text-blue-600"><FaSearch /></span>
              <span className="font-semibold text-gray-800">Secure Payment</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 animate-fade-in delay-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{(totalCarsCount ?? 50000).toLocaleString()}+</div>
              <div className="text-white/80 text-sm">Cars Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">200,000+</div>
              <div className="text-white/80 text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">10+</div>
              <div className="text-white/80 text-sm">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">30+</div>
              <div className="text-white/80 text-sm">Countries Served</div>
            </div>
          </div>

          {/* Testimonials carousel */}
          <div className="mt-12 animate-fade-in delay-500">
            <TestimonialsCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicHero;
