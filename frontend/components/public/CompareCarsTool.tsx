import React, { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';

// Example car data for comparison
const sampleCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Prado',
    year: 2022,
    priceUsd: 18500,
    mileage: 45000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    image: '/api/placeholder/200/120?prado',
    rating: 5,
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Fit',
    year: 2021,
    priceUsd: 6500,
    mileage: 32000,
    fuel: 'Petrol',
    transmission: 'Manual',
    image: '/api/placeholder/200/120?fit',
    rating: 4,
  },
  {
    id: '3',
    make: 'Mitsubishi',
    model: 'Outlander',
    year: 2023,
    priceUsd: 14500,
    mileage: 15000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: '/api/placeholder/200/120?outlander',
    rating: 5,
  },
];

const CompareCarsTool: React.FC = () => {
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCar = (id: string) => {
    setSelectedCars(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const comparedCars = sampleCars.filter(car => selectedCars.includes(car.id));

  return (
    <section className="py-8 bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Compare Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {sampleCars.map(car => (
            <div key={car.id} className="bg-white rounded-xl shadow p-4">
              <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-24 object-cover rounded mb-2" />
              <div className="font-semibold text-blue-700 mb-1">{car.make} {car.model}</div>
              <div className="text-sm text-gray-500 mb-2">{car.year} • ${car.priceUsd.toLocaleString()}</div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCars.includes(car.id)}
                  onChange={() => toggleCar(car.id)}
                  disabled={!selectedCars.includes(car.id) && selectedCars.length >= 3}
                />
                <span className="text-sm">Compare</span>
              </label>
            </div>
          ))}
        </div>
        {selectedCars.length > 0 && (
          <button
            onClick={() => setShowCompare(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Compare Selected ({selectedCars.length})
          </button>
        )}

        {showCompare && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Car Comparison</h3>
                <button onClick={() => setShowCompare(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparedCars.map(car => (
                    <div key={car.id} className="border rounded-lg p-4">
                      <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-32 object-cover rounded mb-2" />
                      <h4 className="font-semibold text-blue-700 mb-2">{car.make} {car.model}</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Year:</strong> {car.year}</div>
                        <div><strong>Price:</strong> ${car.priceUsd.toLocaleString()}</div>
                        <div><strong>Mileage:</strong> {car.mileage.toLocaleString()} km</div>
                        <div><strong>Fuel:</strong> {car.fuel}</div>
                        <div><strong>Transmission:</strong> {car.transmission}</div>
                        <div className="flex items-center gap-1">
                          <strong>Rating:</strong>
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < car.rating ? 'text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompareCarsTool;
