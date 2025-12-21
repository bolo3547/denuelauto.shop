'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DealerCar } from '../../types/dealerCar';
import FavoriteButton from '../FavoriteButton';
import CompareButton from '../CompareButton';
import AddToContainerButton from '../AddToContainerButton';
import FinancingCalculator from '../FinancingCalculator';
import VirtualTour from '../VirtualTour';
import { Calculator, Eye } from 'lucide-react';

export default function CarCardDealer({ car, onCompareUpdate }: { car: DealerCar, onCompareUpdate?: () => void }){
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const price = car.currency === 'USD' ? `USD ${car.price_usd?.toLocaleString()}` : `K ${car.price_local_zmw?.toLocaleString()}`;
  return (
    <>
      <article className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-44 w-full bg-gray-100">
        {car.images?.[0] ? (
          <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No Image</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-1">Stock: <strong>{car.stockNo}</strong></div>
        <h3 className="font-semibold text-lg">{car.year} {car.make} {car.model} {car.grade && <span className="text-sm font-normal"> - {car.grade}</span>}</h3>
        <div className="mt-2 text-sm text-gray-600">{car.engine_cc}cc | {car.mileage_km.toLocaleString()} km | {car.transmission} | {car.fuel}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-bold">{price}</div>
          <div className="flex items-center gap-2">
            <FavoriteButton carId={car.id} />
            <CompareButton carId={car.id} onUpdate={onCompareUpdate} />
            <button onClick={() => setShowTour(true)} className="p-2 bg-purple-100 hover:bg-purple-200 rounded" title="Virtual Tour">
              <Eye className="w-4 h-4 text-purple-600" />
            </button>
            <button onClick={() => setShowCalculator(true)} className="p-2 bg-green-100 hover:bg-green-200 rounded" title="Calculate Financing">
              <Calculator className="w-4 h-4 text-green-600" />
            </button>
            <AddToContainerButton carId={car.id} />
          </div>
        </div>
      </div>
    </article>
    {showCalculator && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <FinancingCalculator price={car.price_usd || 0} />
      </div>
    )}
    {showTour && (
      <VirtualTour car={car} onClose={() => setShowTour(false)} />
    )}
    </>
  );
}
