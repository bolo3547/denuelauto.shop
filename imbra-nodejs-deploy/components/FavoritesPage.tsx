// components/FavoritesPage.tsx
import React from 'react';
import { Heart, X } from 'lucide-react';
import { TenantTheme, Car } from '../types/dealer';
import { cars } from '../lib/dealerConstants';
import { useFavorites } from '../hooks/useFavorites';

interface FavoritesPageProps {
  tenantTheme: TenantTheme;
  navigate: (route: string) => void;
}

export default function FavoritesPage({ tenantTheme, navigate }: FavoritesPageProps) {
  const { favorites, removeFavorite } = useFavorites();
  // favorites could be a list of ids or full car objects (server returns car objects). Normalize
  const favoriteCars = Array.isArray(favorites) && favorites.length && (favorites[0] as any).id
    ? (favorites as any[]).map(f => f).filter(Boolean)
    : cars.filter(car => (favorites as any[]).includes(car.id));

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

  if (favoriteCars.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Favorites Yet</h1>
        <p className="text-gray-600 mb-6">Start browsing our inventory and add cars to your favorites to see them here.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Browse Cars
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-gray-600">You have {favoriteCars.length} favorite{favoriteCars.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteCars.map(car => (
          <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{car.year} {car.make} {car.model} {car.grade}</h3>
                <button aria-label="Remove favorite" onClick={() => removeFavorite(car.id)} className="text-red-500 hover:text-red-700" title="Remove favorite">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">Stock: {car.stockNo}</p>
              <p className="text-sm text-gray-600 mb-2">{car.transmission} • {car.engineCc}cc • {car.fuel} • {car.steering}</p>
              <p className="text-sm text-gray-600 mb-2">{car.mileageKm.toLocaleString()} km • {car.location}</p>
              <div className="flex justify-between items-center">
                {renderPrice(car)}
                <button onClick={() => navigate(`/car/${car.id}`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}