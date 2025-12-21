'use client';

import React, { useState } from 'react';
import { X, Check, Star } from 'lucide-react';
import { Car } from '../types/dealer';

interface CarComparisonProps {
  cars: Car[];
  onClose: () => void;
}

export default function CarComparison({ cars, onClose }: CarComparisonProps) {
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);

  const addToComparison = (car: Car) => {
    if (selectedCars.length < 4 && !selectedCars.find(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeFromComparison = (carId: string) => {
    setSelectedCars(selectedCars.filter(c => c.id !== carId));
  };

  const clearComparison = () => {
    setSelectedCars([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Compare Cars</h2>
          <button onClick={onClose} aria-label="Close comparison" title="Close comparison" className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex">
          {/* Car Selection Panel */}
          <div className="w-80 border-r p-4 overflow-y-auto max-h-[70vh]">
            <h3 className="font-semibold mb-4">Select Cars to Compare ({selectedCars.length}/4)</h3>
            <div className="space-y-2">
              {cars.map(car => {
                const isSelected = selectedCars.find(c => c.id === car.id);
                return (
                  <div key={car.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => isSelected ? removeFromComparison(car.id) : addToComparison(car)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{car.year} {car.make} {car.model}</div>
                        <div className="text-sm text-gray-600">${car.priceUsd?.toLocaleString()}</div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedCars.length > 0 && (
              <button onClick={clearComparison} className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Clear All
              </button>
            )}
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-x-auto">
            {selectedCars.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Select cars to compare
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedCars.map(car => (
                    <div key={car.id} className="border rounded-lg p-4">
                      <div className="relative mb-4">
                        <img src={car.images[0] || '/placeholder-car.jpg'} alt={`${car.make} ${car.model}`} className="w-full h-32 object-cover rounded" />
                        <button onClick={() => removeFromComparison(car.id)} aria-label="Remove from comparison" title="Remove from comparison" className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg">{car.year} {car.make} {car.model}</h3>
                      <div className="text-2xl font-bold text-green-600 mb-2">${car.priceUsd?.toLocaleString()}</div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Mileage:</strong> {car.mileageKm.toLocaleString()} km</div>
                        <div><strong>Engine:</strong> {car.engineCc}cc</div>
                        <div><strong>Transmission:</strong> {car.transmission}</div>
                        <div><strong>Fuel:</strong> {car.fuel}</div>
                        <div><strong>Steering:</strong> {car.steering}</div>
                        <div><strong>Body Type:</strong> {car.bodyType || 'N/A'}</div>
                        <div><strong>Color:</strong> {car.color || 'N/A'}</div>
                        <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                          car.status === 'Available' ? 'bg-green-100 text-green-800' :
                          car.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>{car.status}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}