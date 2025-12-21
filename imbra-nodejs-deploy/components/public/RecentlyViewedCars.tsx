import React from 'react';

// Example static data for recently viewed cars
const recentlyViewed = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Prado',
    year: 2022,
    priceUsd: 18500,
    image: '/api/placeholder/180/100?prado',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Fit',
    year: 2021,
    priceUsd: 6500,
    image: '/api/placeholder/180/100?fit',
  },
  {
    id: '3',
    make: 'Mitsubishi',
    model: 'Outlander',
    year: 2023,
    priceUsd: 14500,
    image: '/api/placeholder/180/100?outlander',
  },
  {
    id: '4',
    make: 'Nissan',
    model: 'X-Trail',
    year: 2022,
    priceUsd: 12800,
    image: '/api/placeholder/180/100?xtrail',
  }
];

const RecentlyViewedCars: React.FC = () => {
  return (
    <section className="py-8 bg-white border-t">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Viewed Cars</h2>
        <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 py-2">
          {recentlyViewed.map(car => (
            <div key={car.id} className="min-w-[200px] bg-gray-50 rounded-xl shadow p-3 flex flex-col items-center">
              <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-20 object-cover rounded mb-2" />
              <div className="font-semibold text-blue-700 text-sm mb-1">{car.make} {car.model}</div>
              <div className="text-xs text-gray-500 mb-1">{car.year}</div>
              <div className="text-yellow-500 font-bold text-base mb-1">${car.priceUsd.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedCars;
