"use client";
import React, { useState, useEffect } from 'react';
import { FaFire, FaCoins, FaStar, FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  location: string;
  mileage: number;
  soldCount?: number;
  views?: number;
  likes?: number;
}

interface PointsReward {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: string;
  endDate?: string;
  expiry?: string;
}

interface FeaturedSectionsProps {
  tenantSlug: string;
  onCarSelect?: (car: Car) => void;
}

const FeaturedSections: React.FC<FeaturedSectionsProps> = ({ tenantSlug, onCarSelect }) => {
  const [topSellers, setTopSellers] = useState<Car[]>([]);
  const [pointsRewards, setPointsRewards] = useState<PointsReward[]>([]);
  const [popularCars, setPopularCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    setTimeout(() => {
      setTopSellers([
        {
          id: 1,
          make: 'TOYOTA',
          model: 'PRADO',
          year: 2018,
          price: 18500,
          image: '/api/placeholder/300/200',
          location: 'Japan',
          mileage: 65000,
          soldCount: 45
        },
        {
          id: 2,
          make: 'NISSAN',
          model: 'PATROL',
          year: 2019,
          price: 22500,
          image: '/api/placeholder/300/200',
          location: 'UAE',
          mileage: 45000,
          soldCount: 38
        },
        {
          id: 3,
          make: 'MITSUBISHI',
          model: 'PAJERO',
          year: 2017,
          price: 16800,
          image: '/api/placeholder/300/200',
          location: 'Japan',
          mileage: 78000,
          soldCount: 32
        }
      ]);

      setPointsRewards([
        {
          id: 1,
          title: 'Earn 500 BF Points',
          description: 'Purchase any SUV this month',
          points: 500,
          icon: '🚗',
          expiry: '2024-02-28'
        },
        {
          id: 2,
          title: 'Double Points Weekend',
          description: 'Earn 2x points on all purchases',
          points: 1000,
          icon: '🎯',
          expiry: '2024-01-28'
        },
        {
          id: 3,
          title: 'Referral Bonus',
          description: 'Get 200 points when your friend buys',
          points: 200,
          icon: '👥',
          expiry: '2024-12-31'
        }
      ]);

      setPopularCars([
        {
          id: 4,
          make: 'HONDA',
          model: 'CR-V',
          year: 2020,
          price: 15800,
          image: '/api/placeholder/300/200',
          location: 'Singapore',
          mileage: 35000,
          views: 1250,
          likes: 89
        },
        {
          id: 5,
          make: 'MAZDA',
          model: 'CX-5',
          year: 2019,
          price: 14200,
          image: '/api/placeholder/300/200',
          location: 'Japan',
          mileage: 52000,
          views: 980,
          likes: 67
        },
        {
          id: 6,
          make: 'SUBARU',
          model: 'FORESTER',
          year: 2018,
          price: 13500,
          image: '/api/placeholder/300/200',
          location: 'Thailand',
          mileage: 48000,
          views: 875,
          likes: 54
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [tenantSlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="border rounded-lg p-4">
                    <div className="h-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Sellers Section */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center gap-3">
            <FaFire className="text-2xl" />
            <div>
              <h3 className="text-xl font-bold">Top Sellers This Month</h3>
              <p className="text-orange-100">Most popular vehicles in demand</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSellers.map((car) => (
              <div
                key={car.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onCarSelect?.(car)}
              >
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    HOT
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg">{car.make} {car.model}</h4>
                  <p className="text-gray-600">{car.year} • {car.mileage.toLocaleString()} km</p>
                  <p className="text-sm text-gray-500">{car.location}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-blue-600">{formatPrice(car.price)}</span>
                    <span className="text-sm text-orange-600 font-semibold">
                      {car.soldCount} sold
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Rewards Section */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <FaCoins className="text-2xl" />
            <div>
              <h3 className="text-xl font-bold">BF Points Rewards</h3>
              <p className="text-yellow-100">Earn points and unlock exclusive rewards</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pointsRewards.map((reward) => (
              <div key={reward.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{reward.icon}</div>
                  <h4 className="font-bold text-lg">{reward.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{reward.description}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    +{reward.points} Points
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Expires: {reward.expiry ? new Date(reward.expiry).toLocaleDateString() : 'N/A'}
                  </div>
                  <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Cars Section */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center gap-3">
            <FaStar className="text-2xl" />
            <div>
              <h3 className="text-xl font-bold">Popular This Week</h3>
              <p className="text-blue-100">Most viewed and liked vehicles</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCars.map((car) => (
              <div
                key={car.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onCarSelect?.(car)}
              >
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">
                    POPULAR
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg">{car.make} {car.model}</h4>
                  <p className="text-gray-600">{car.year} • {car.mileage.toLocaleString()} km</p>
                  <p className="text-sm text-gray-500">{car.location}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-blue-600">{formatPrice(car.price)}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaEye />
                        {car.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart />
                        {car.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSections;