'use client';

import { useState } from 'react';
import { cars as initialCars } from '@/components/dealer-types';
import { Car } from '@/components/dealer-types';

export default function AdminInventoryPage() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: 'Petrol',
    transmission: 'AT',
    status: 'Available',
    images: ['https://via.placeholder.com/400x300?text=New+Car'],
    description: '',
    features: [],
  });

  const handleAddCar = () => {
    if (newCar.make && newCar.model && newCar.price) {
      const car: Car = {
        id: Date.now().toString(),
        stockNo: `EMZ-${Date.now()}`,
        make: newCar.make,
        model: newCar.model,
        year: newCar.year || new Date().getFullYear(),
        mileage: newCar.mileage || 0,
        mileageKm: newCar.mileage || 0,
        engineCc: 2000,
        engineSize: '2000cc',
        transmission: newCar.transmission || 'AT',
        fuelType: newCar.fuelType || 'Petrol',
        fuel: newCar.fuelType || 'Petrol',
        steering: 'RHD',
        price: newCar.price,
        priceLocal: (newCar.price || 0) * 20,
        priceUsd: newCar.price,
        currency: 'ZMW',
        location: 'Lusaka Yard',
        portOption: 'Dar es Salaam',
        bodyType: 'Sedan',
        color: 'White',
        images: newCar.images || ['https://via.placeholder.com/400x300?text=New+Car'],
        status: newCar.status as 'Available' | 'Reserved' | 'Sold',
        description: newCar.description || '',
        features: newCar.features || [],
      };
      setCars([...cars, car]);
      setNewCar({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        fuelType: 'Petrol',
        transmission: 'AT',
        status: 'Available',
        images: ['https://via.placeholder.com/400x300?text=New+Car'],
        description: '',
        features: [],
      });
      setShowAddForm(false);
    }
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setNewCar(car);
    setShowAddForm(true);
  };

  const handleUpdateCar = () => {
    if (editingCar && newCar.make && newCar.model && newCar.price) {
      const updatedCar: Car = {
        ...editingCar,
        ...newCar,
        mileageKm: newCar.mileage || 0,
        fuel: newCar.fuelType || 'Petrol',
        priceLocal: (newCar.price || 0) * 20,
        priceUsd: newCar.price,
      };
      setCars(cars.map(c => c.id === editingCar.id ? updatedCar : c));
      setEditingCar(null);
      setNewCar({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        fuelType: 'Petrol',
        transmission: 'AT',
        status: 'Available',
        images: ['https://via.placeholder.com/400x300?text=New+Car'],
        description: '',
        features: [],
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteCar = (carId: string) => {
    if (confirm('Are you sure you want to delete this car?')) {
      setCars(cars.filter(c => c.id !== carId));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your car inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : '+ Add New Car'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingCar ? 'Edit Car' : 'Add New Car'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={newCar.make || ''}
                onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={newCar.model || ''}
                onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Camry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={newCar.year || ''}
                onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <input
                type="number"
                value={newCar.price || ''}
                onChange={(e) => setNewCar({ ...newCar, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Price in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <input
                type="number"
                value={newCar.mileage || ''}
                onChange={(e) => setNewCar({ ...newCar, mileage: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Mileage (km)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                value={newCar.fuelType || 'Petrol'}
                onChange={(e) => setNewCar({ ...newCar, fuelType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Fuel Type"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                value={newCar.transmission || 'AT'}
                onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Transmission"
              >
                <option value="AT">Automatic</option>
                <option value="MT">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newCar.status || 'Available'}
                onChange={(e) => setNewCar({ ...newCar, status: e.target.value as 'Available' | 'Reserved' | 'Sold' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Status"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newCar.description || ''}
              onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              title="Description"
              rows={3}
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={editingCar ? handleUpdateCar : handleAddCar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingCar ? 'Update Car' : 'Add Car'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingCar(null);
                setNewCar({
                  make: '',
                  model: '',
                  year: new Date().getFullYear(),
                  price: 0,
                  mileage: 0,
                  fuelType: 'Petrol',
                  transmission: 'AT',
                  status: 'Available',
                  images: ['https://via.placeholder.com/400x300?text=New+Car'],
                  description: '',
                  features: [],
                });
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cars Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {car.year} {car.make} {car.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {car.mileage.toLocaleString()} miles
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${car.price.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    car.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : car.status === 'Reserved'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {car.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditCar(car)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCar(car.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}