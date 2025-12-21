"use client";

// components/DealerHomePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Heart, Search, Truck, Shield, Award } from 'lucide-react';
import { TenantTheme, Car } from '../types/dealer';
import { cars, featuredCars, testimonials } from '../lib/dealerConstants';
import { useFavorites } from '../hooks/useFavorites';
import DealerFooter from './DealerFooter';


interface DealerHomePageProps {
  tenantTheme: TenantTheme;
  navigate: (route: string) => void;
}

export default function DealerHomePage({ tenantTheme, navigate }: DealerHomePageProps) {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minYear: '',
    maxYear: '',
    maxPrice: '',
    transmission: '',
    fuel: '',
    status: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const categories = [
    { name: 'SUV', filter: 'SUV' },
    { name: 'Sedan', filter: 'Sedan' },
    { name: 'Hatchback', filter: 'Hatchback' },
    { name: 'Wagon', filter: 'Wagon' },
    { name: 'Coupe', filter: 'Coupe' }
  ];

  // Rotate categories every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (filters.make && !car.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.minYear && car.year < parseInt(filters.minYear)) return false;
      if (filters.maxYear && car.year > parseInt(filters.maxYear)) return false;
      if (filters.maxPrice && car.priceUsd && car.priceUsd > parseInt(filters.maxPrice)) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.status && car.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
    return (
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">FOB ${car.priceUsd?.toLocaleString()}</div>
        <div className="text-sm text-gray-600">≈ {tenantTheme.baseCurrency} {car.priceLocal?.toLocaleString()}</div>
      </div>
    );
  };

  const tone = (tenantTheme?.brandTone || 'professional') as string;
  const heroCTA = tone === 'formal' ? 'Explore Inventory' : tone === 'friendly' ? 'Find Your Car' : 'View All Stock';

  return (
    <div className="bg-white">
      {/* Hero Section - Clean Japanese Style */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{tenantTheme.heroTitle}</h1>
            <p className="text-lg text-gray-600 mb-8">{tenantTheme.heroSubtitle}</p>
            <button
              onClick={() => navigate('/stock')}
              className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition-colors font-medium"
            >
              {heroCTA}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Search - Minimal Design */}
      <section className="py-8 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Search</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                aria-label="Car Make"
                title="Car Make"
                value={filters.make}
                onChange={e => handleFilterChange('make', e.target.value)}
                className="border p-2 rounded text-sm"
              >
                <option value="">All Makes</option>
                {[...new Set(cars.map(c => c.make))].map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              <select
                aria-label="Car Model"
                title="Car Model"
                value={filters.model}
                onChange={e => handleFilterChange('model', e.target.value)}
                className="border p-2 rounded text-sm"
              >
                <option value="">All Models</option>
                {[...new Set(cars.map(c => c.model))].map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Min Year"
                value={filters.minYear}
                onChange={e => handleFilterChange('minYear', e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max Price (USD)"
                value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)}
                className="border p-2 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Body Type & Brand */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Browse by Body Type */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Browse by Body Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {['SUV', 'Sedan', 'Hatchback', 'Wagon', 'Coupe', 'Convertible'].map(bodyType => (
                  <button
                    key={bodyType}
                    onClick={() => navigate(`/stock?bodyType=${bodyType}`)}
                    className="bg-white border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">{bodyType}</div>
                    <div className="text-sm text-gray-600">
                      {cars.filter(car => car.bodyType === bodyType).length} vehicles
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Brand */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Browse by Brand</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Toyota', 'Honda', 'Nissan', 'Mitsubishi', 'Mazda', 'Subaru'].map(brand => (
                  <button
                    key={brand}
                    onClick={() => navigate(`/stock?make=${brand}`)}
                    className="bg-white border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">{brand}</div>
                    <div className="text-sm text-gray-600">
                      {cars.filter(car => car.make === brand).length} vehicles
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tags */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Low Mileage', 'One Owner', 'Certified', 'Under $10,000', 'Automatic', '4WD',
              'Navigation', 'Sunroof', 'Leather Seats', 'Backup Camera', 'Bluetooth', 'Heated Seats'
            ].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/stock?tag=${encodeURIComponent(tag)}`)}
                className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top Viewed Models & Recommended */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Viewed Models */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-900">Top Viewed Models</h3>
              <div className="space-y-4">
                {cars.slice(0, 5).map((car, index) => (
                  <div key={car.id} className="flex items-center bg-white rounded-lg p-4 border">
                    <div className="flex-shrink-0 mr-4">
                      <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-16 h-12 object-cover rounded" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{car.make} {car.model}</h4>
                      <p className="text-sm text-gray-600">{car.year} • {car.mileageKm.toLocaleString()} km</p>
                      <p className="text-sm font-medium text-blue-600">FOB ${car.priceUsd?.toLocaleString()}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended for You */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-900">Recommended for You</h3>
              <div className="space-y-4">
                {cars.slice(2, 7).map(car => (
                  <div key={car.id} className="flex items-center bg-white rounded-lg p-4 border">
                    <div className="flex-shrink-0 mr-4">
                      <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-16 h-12 object-cover rounded" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{car.make} {car.model}</h4>
                      <p className="text-sm text-gray-600">{car.year} • {car.mileageKm.toLocaleString()} km</p>
                      <p className="text-sm font-medium text-green-600">FOB ${car.priceUsd?.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/car/${car.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Special Deals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cars.filter(car => car.priceUsd && car.priceUsd < 15000).slice(0, 3).map(car => (
              <div key={car.id} className="bg-red-50 border-2 border-red-200 rounded-lg p-6 relative">
                <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-lg text-sm font-bold">
                  DEAL
                </div>
                <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-32 object-cover rounded mb-4" />
                <h3 className="font-bold text-lg mb-2">{car.make} {car.model}</h3>
                <p className="text-gray-600 text-sm mb-2">{car.year} • {car.mileageKm.toLocaleString()} km</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl font-bold text-red-600">FOB ${car.priceUsd?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 line-through">Was ${(car.priceUsd! + 2000).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers by Category */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Best Sellers by Category</h2>
          <div className="bg-white rounded-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Top {categories[currentCategoryIndex].name}s</h3>
              <div className="flex justify-center space-x-2">
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setCurrentCategoryIndex(index)}
                    className={`px-4 py-2 rounded ${
                      index === currentCategoryIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cars.filter(car => car.bodyType === categories[currentCategoryIndex].filter).slice(0, 3).map((car, index) => (
                <div key={car.id} className="flex items-center bg-gray-50 rounded-lg p-4">
                  <div className="flex-shrink-0 mr-4">
                    <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-16 h-12 object-cover rounded mr-4" />
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900">{car.make} {car.model}</h4>
                    <p className="text-sm text-gray-600">{car.year} • {car.mileageKm.toLocaleString()} km</p>
                    <p className="text-sm font-bold text-blue-600">FOB ${car.priceUsd?.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 ml-4"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars - Japanese Style Table */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Vehicles</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Photo</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Stock No.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Year</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Mileage</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">FOB Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featuredCars.map(car => (
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
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">
                      {renderPrice(car)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(car.id)}
                          className={`p-1 ${isFavorite(car.id) ? 'text-red-500' : 'text-gray-400'}`}
                          aria-label={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}
                          title={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => navigate(`/car/${car.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Available Vehicles - Japanese Style Table */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Available Vehicles ({filteredCars.length})</h2>
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
                {filteredCars.slice(0, 10).map(car => (
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
                      {renderPrice(car)}
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
                          aria-label={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}
                          title={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => navigate(`/car/${car.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/stock')}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              View All Vehicles ({filteredCars.length})
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Japanese Style */}
      {tenantTheme.sections.showWhyChooseUs && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">Why Choose {tenantTheme.name}?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center border rounded-lg p-6">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">All vehicles are thoroughly inspected and certified before export.</p>
              </div>
              <div className="text-center border rounded-lg p-6">
                <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Reliable Shipping</h3>
                <p className="text-gray-600 text-sm">Safe and timely delivery to your preferred port worldwide.</p>
              </div>
              <div className="text-center border rounded-lg p-6">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trusted Exporter</h3>
                <p className="text-gray-600 text-sm">Licensed and experienced in international car export business.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - Clean Style */}
      {tenantTheme.sections.showTestimonials && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">Customer Testimonials</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white border rounded-lg p-6">
                  <p className="text-gray-700 mb-4 text-sm">"{testimonial.message}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <DealerFooter theme={tenantTheme} />
    </div>
  );
}