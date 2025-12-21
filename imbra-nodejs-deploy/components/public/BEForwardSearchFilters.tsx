"use client";
import React, { useState } from 'react';
import { SearchFilters } from './searchTypes';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface BEForwardSearchFiltersProps {
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  initialFilters?: Partial<SearchFilters>;
  tenantSlug?: string;
}

const BEForwardSearchFilters: React.FC<BEForwardSearchFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  tenantSlug
}) => {
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    make: '',
    model: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    bodyType: '',
    steering: '',
    fuelType: '',
    transmission: '',
    stockCountry: '',
    color: '',
    minMileage: '',
    maxMileage: '',
    ...initialFilters
  });

  const makes = [
    'TOYOTA', 'NISSAN', 'HONDA', 'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI',
    'ISUZU', 'DAIHATSU', 'HINO', 'LEXUS', 'MERCEDES-BENZ', 'BMW', 'VOLKSWAGEN',
    'AUDI', 'PEUGEOT', 'FORD', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'JEEP',
    'CHEVROLET', 'HYUNDAI', 'KIA', 'SSANGYONG', 'RENAULT SAMSUNG'
  ];
  const [isExpanded, setIsExpanded] = useState(false);

  // Professional blue theme makes data

  const vehicleTypes = [
    'SUV', 'Sedan', 'Truck', 'Pick up', 'Van', 'Bus', 'Mini Van', 'Hatchback',
    'Coupe', 'Convertible', 'Wagon', 'Mini Bus', 'Machinery', 'Forklift', 'Tractor', 'Motorcycle'
  ];

  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const steerings = ['Left', 'Right'];
  const stockCountries = ['Japan', 'Korea', 'Thailand', 'United Kingdom', 'Singapore', 'UAE'];
  const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Green', 'Brown', 'Yellow', 'Orange'];

  const priceRanges = [
    'Under $500', '$500 - $1,000', '$1,000 - $1,500', '$1,500 - $2,000',
    '$2,000 - $2,500', '$2,500 - $4,000', 'Over $4,000'
  ];

  const yearRanges = [
    '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016',
    '2015', '2014', '2013', '2012', '2011 and Older'
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: Partial<SearchFilters> = {
      make: '',
      model: '',
      priceMin: '',
      priceMax: '',
      yearMin: '',
      yearMax: '',
      bodyType: '',
      steering: '',
      fuelType: '',
      transmission: '',
      stockCountry: '',
      color: '',
      minMileage: '',
      maxMileage: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFilter className="text-blue-600" />
            <span className="font-semibold text-gray-900">Advanced Search</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <button
            type="button"
            title={isExpanded ? "Close advanced search" : "Open advanced search"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <FaTimes /> : <FaSearch />}
          </button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search make, model, stock no. — e.g. TOYOTA PRADO"
            value={filters.make || ''}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            className="flex-1 border rounded-l-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            title="Search"
            onClick={() => onFiltersChange(filters)}
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            <FaSearch aria-label="Search" />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Row 1: Make, Model, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="make-select" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select
                id="make-select"
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Makes</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="model-input" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                id="model-input"
                type="text"
                placeholder="e.g. Corolla, Prado"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="price-select" className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                id="price-select"
                value={`${filters.priceMin}-${filters.priceMax}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-');
                  handleFilterChange('priceMin', min || '');
                  handleFilterChange('priceMax', max || '');
                }}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range} value={range.replace(/[^0-9-]/g, '')}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Year, Type, Steering */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">Year Range</legend>
                <div className="flex gap-2">
                  <select
                    id="year-min-select"
                    aria-label="Minimum Year"
                    value={filters.yearMin}
                    onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                    className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Min Year</option>
                    {yearRanges.map(year => (
                      <option key={year} value={year.replace(/\D/g, '')}>{year}</option>
                    ))}
                  </select>
                  <span className="self-center">-</span>
                  <select
                    id="year-max-select"
                    aria-label="Maximum Year"
                    value={filters.yearMax}
                    onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                    className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Max Year</option>
                    {yearRanges.map(year => (
                      <option key={year} value={year.replace(/\D/g, '')}>{year}</option>
                    ))}
                  </select>
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="body-type-select" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                id="body-type-select"
                value={filters.bodyType}
                onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="steering-select" className="block text-sm font-medium text-gray-700 mb-1">Steering</label>
              <select
                id="steering-select"
                value={filters.steering}
                onChange={(e) => handleFilterChange('steering', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {steerings.map(steering => (
                  <option key={steering} value={steering}>{steering} Hand Drive</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Fuel, Transmission, Stock Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="fuel-select" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                id="fuel-select"
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Fuel Types</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transmission-select" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                id="transmission-select"
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Transmissions</option>
                {transmissions.map(transmission => (
                  <option key={transmission} value={transmission}>{transmission}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">Stock Country</label>
              <select
                id="country-select"
                value={filters.stockCountry}
                onChange={(e) => handleFilterChange('stockCountry', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {stockCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Color, Mileage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="color-select" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                id="color-select"
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Colors</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">Mileage Range</legend>
                <div className="flex gap-2">
                  <input
                    id="mileage-min-input"
                    type="number"
                    placeholder="Min km"
                    value={filters.minMileage}
                    onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                    className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="self-center">-</span>
                  <input
                    id="mileage-max-input"
                    type="number"
                    placeholder="Max km"
                    value={filters.maxMileage}
                    onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                    className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </fieldset>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => onFiltersChange(filters)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BEForwardSearchFilters;