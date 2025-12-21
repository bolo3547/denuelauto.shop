import React, { useState, useEffect } from 'react';
import { FaHeart, FaTimes, FaShare, FaEye, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  image: string;
  mileage?: number;
  fuel?: string;
  transmission?: string;
}

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Car[];
  onRemoveFromFavorites: (carId: string) => void;
  onCarClick: (car: Car) => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFromFavorites,
  onCarClick
}) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'make'>('date');

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.priceUsd - a.priceUsd;
      case 'make':
        return a.make.localeCompare(b.make);
      default:
        return 0; // Keep original order for 'date'
    }
  });

  const handleShareWishlist = () => {
    const url = window.location.href;
    navigator.share?.({
      title: 'My Car Wishlist',
      text: `Check out my saved cars (${favorites.length} items)`,
      url: url
    }) || navigator.clipboard.writeText(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHeart className="text-red-500" />
              My Wishlist ({favorites.length})
            </h2>
            <p className="text-gray-600">Your saved cars</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShareWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaShare /> Share
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'make')}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="date">Date Added</option>
              <option value="price">Price (High to Low)</option>
              <option value="make">Make (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <FaHeart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start browsing cars and save your favorites!</p>
              <button
                onClick={() => {
                  onClose();
                  router.push('/browse');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {sortedFavorites.map((car) => (
                <div key={car.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => onCarClick(car)}
                    />
                    <button
                      onClick={() => onRemoveFromFavorites(car.id)}
                      className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full text-red-600 hover:bg-red-50"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => onCarClick(car)}>
                      {car.make} {car.model} {car.year}
                    </h3>

                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      ${car.priceUsd.toLocaleString()}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      {car.mileage && <div>Mileage: {car.mileage.toLocaleString()} km</div>}
                      {car.fuel && <div>Fuel: {car.fuel}</div>}
                      {car.transmission && <div>Transmission: {car.transmission}</div>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onCarClick(car)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <FaEye /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total value: <span className="font-semibold text-gray-900">
                  ${favorites.reduce((sum, car) => sum + car.priceUsd, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Could implement compare functionality
                    console.log('Compare selected cars');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  disabled={favorites.length < 2}
                >
                  Compare ({favorites.length})
                </button>
                <button
                  onClick={() => {
                    // Could implement contact about multiple cars
                    console.log('Contact about wishlist');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Inquire About All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal;
