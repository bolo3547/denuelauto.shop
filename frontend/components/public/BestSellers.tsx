import React from 'react';
import { FaStar } from 'react-icons/fa';
import { bestSellers } from './bestSellersData';

const BestSellers: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {bestSellers.map((car, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center">
              <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-28 object-cover rounded mb-3" />
              <div className="font-semibold text-lg text-blue-700 mb-1">{car.make} {car.model}</div>
              <div className="text-sm text-gray-500 mb-2">{car.year}</div>
              <div className="text-yellow-500 font-bold text-xl mb-1">${car.priceUsd.toLocaleString()}</div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < car.rating ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <div className="text-xs text-gray-400">Sold: {car.sold}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
