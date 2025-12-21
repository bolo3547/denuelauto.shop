// components/StockPage.tsx
import React, { useState, useMemo } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { TenantTheme, Car } from '../types/dealer';
import { cars } from '../lib/dealerConstants';
import { useFavorites } from '../hooks/useFavorites';
import TradeInCalculator from './TradeInCalculator';
import CustomerReviews from './CustomerReviews';
import MarketComparison from './MarketComparison';
import MaintenanceCostPredictor from './MaintenanceCostPredictor';
import LiveVideoConsultation from './LiveVideoConsultation';

interface StockPageProps {
  tenantTheme: TenantTheme;
  navigate: (route: string) => void;
}

export default function StockPage({ tenantTheme, navigate }: StockPageProps) {
  const tone = (tenantTheme?.brandTone || 'professional') as string;
  const detailsLabel = tone === 'formal' ? 'View Details' : tone === 'friendly' ? 'Take a Look' : 'Details';
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minYear: '',
    maxPrice: '',
    transmission: '',
    fuel: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [selectedCarForFeatures, setSelectedCarForFeatures] = useState<Car | null>(null);
  const itemsPerPage = 12;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (filters.make && !car.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.minYear && car.year < parseInt(filters.minYear)) return false;
      if (filters.maxPrice && car.priceUsd && car.priceUsd > parseInt(filters.maxPrice)) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.status && car.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleFavorite = (carId: string) => {
    if (isFavorite(carId)) {
      removeFavorite(carId);
    } else {
      addFavorite(carId);
    }
  };

  const renderPrice = (car: Car) => {
    if (!tenantTheme.listing.showPrices) {
      return <button className="text-blue-600 hover:underline">Get price</button>;
    }
    if (car.currency === 'USD') {
      return <span className="font-bold text-green-600">USD {car.priceUsd?.toLocaleString()}</span>;
    } else {
      return <span className="font-bold text-green-600">{tenantTheme.baseCurrency} {car.priceLocal?.toLocaleString()}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <select
                  title="Make"
                  value={filters.make}
                  onChange={e => handleFilterChange('make', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Makes</option>
                  {[...new Set(cars.map(c => c.make))].map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select
                  title="Model"
                  value={filters.model}
                  onChange={e => handleFilterChange('model', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Models</option>
                  {[...new Set(cars.map(c => c.model))].map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Year</label>
                <input
                  type="number"
                  value={filters.minYear}
                  onChange={e => handleFilterChange('minYear', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter minimum year"
                  title="Minimum Year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Price (USD)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter maximum price"
                  title="Maximum Price"
                />
              </div>
              <div>
                <label htmlFor="transmission-select" className="block text-sm font-medium mb-1">Transmission</label>
                <select
                  id="transmission-select"
                  value={filters.transmission}
                  onChange={e => handleFilterChange('transmission', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option>AT</option>
                  <option>MT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel</label>
                <select
                  title="Fuel"
                  value={filters.fuel}
                  onChange={e => handleFilterChange('fuel', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option>Petrol</option>
                  <option>Diesel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  title="Status"
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option>Available</option>
                  <option>Reserved</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="lg:w-3/4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Our Stock</h1>
            <p className="text-gray-600">Showing {paginatedCars.length} of {filteredCars.length} vehicles</p>
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Tools
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Photo</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Stock No.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Year</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Mileage</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Engine</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Trans.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">FOB Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-20 h-15 object-cover" />
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{car.stockNo}</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <div className="font-medium">{car.make} {car.model}</div>
                        <div className="text-sm text-gray-600">{car.grade}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{car.year}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{car.mileageKm.toLocaleString()} km</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{car.engineCc}cc</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{car.transmission}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">FOB ${car.priceUsd?.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">≈ {tenantTheme.baseCurrency} {car.priceLocal?.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        car.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(car.id)}
                          className={`p-1 ${isFavorite(car.id) ? 'text-red-500' : 'text-gray-400'}`}
                          title={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => navigate(`/car/${car.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          {detailsLabel}
                        </button>
                        <button
                          onClick={() => setSelectedCarForFeatures(car)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                          title="Analyze Car"
                        >
                          Analyze
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advanced Features Section */}
          {showAdvancedFeatures && (
            <div className="mb-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <TradeInCalculator />
                <LiveVideoConsultation />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <CustomerReviews />
                {selectedCarForFeatures && (
                  <div className="space-y-6">
                    <MarketComparison
                      carPrice={selectedCarForFeatures.priceUsd || 0}
                      carMake={selectedCarForFeatures.make}
                      carModel={selectedCarForFeatures.model}
                      carYear={selectedCarForFeatures.year}
                    />
                    <MaintenanceCostPredictor
                      carMake={selectedCarForFeatures.make}
                      carModel={selectedCarForFeatures.model}
                      carYear={selectedCarForFeatures.year}
                      currentMileage={selectedCarForFeatures.mileageKm}
                    />
                  </div>
                )}
              </div>

              {!selectedCarForFeatures && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Select a Car for Detailed Analysis</h3>
                  <p className="text-blue-700">
                    Click "Analyze" on any car above to see market comparison and maintenance cost predictions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}