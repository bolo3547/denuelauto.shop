"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye,
  FaImage, FaVideo, FaUpload, FaSave, FaTimes, FaCheck,
  FaCar, FaChevronDown, FaHistory, FaCopy, FaExternalLinkAlt
} from 'react-icons/fa';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  grade?: string;
  year: number;
  mileageKm: number;
  engineCc: number;
  transmission: string;
  fuel: string;
  steering: string;
  drive?: string;
  seats?: number;
  doors?: number;
  priceLocal?: number;
  priceUsd?: number;
  currency: 'ZMW' | 'USD';
  location: string;
  images: string[];
  videoUrl?: string;
  status: 'Available' | 'Reserved' | 'Sold' | 'In-Transit';
  bodyType?: string;
  color?: string;
  vin?: string;
  features?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InventoryManagerProps {
  tenantSlug: string;
  initialCars?: Car[];
}

const SAMPLE_CARS: Car[] = [
  {
    id: '1', stockNo: 'DA-001', make: 'Toyota', model: 'Harrier', grade: 'Premium', year: 2019,
    mileageKm: 45000, engineCc: 2000, transmission: 'Automatic', fuel: 'Petrol', steering: 'Right',
    priceUsd: 18500, priceLocal: 499500, currency: 'ZMW', location: 'Lusaka Main', status: 'Available',
    bodyType: 'SUV', color: 'White Pearl', images: ['/cars/car-1.jpg'], vin: 'JTMBD33V495123456'
  },
  {
    id: '2', stockNo: 'DA-002', make: 'Honda', model: 'CR-V', grade: 'EX', year: 2020,
    mileageKm: 32000, engineCc: 1500, transmission: 'Automatic', fuel: 'Petrol', steering: 'Right',
    priceUsd: 22000, priceLocal: 594000, currency: 'ZMW', location: 'Lusaka Main', status: 'Reserved',
    bodyType: 'SUV', color: 'Silver', images: ['/cars/car-2.jpg'], vin: 'JHLRW1H50LA012345'
  },
  {
    id: '3', stockNo: 'DA-003', make: 'Nissan', model: 'X-Trail', year: 2018,
    mileageKm: 58000, engineCc: 2500, transmission: 'Automatic', fuel: 'Petrol', steering: 'Right',
    priceUsd: 15500, priceLocal: 418500, currency: 'ZMW', location: 'Ndola Branch', status: 'Available',
    bodyType: 'SUV', color: 'Black', images: ['/cars/car-3.jpg'], vin: 'JN1TBNT32Z0123456'
  },
  {
    id: '4', stockNo: 'DA-004', make: 'Mazda', model: 'CX-5', grade: 'Touring', year: 2021,
    mileageKm: 18000, engineCc: 2200, transmission: 'Automatic', fuel: 'Diesel', steering: 'Right',
    priceUsd: 28000, priceLocal: 756000, currency: 'ZMW', location: 'Lusaka Main', status: 'Available',
    bodyType: 'SUV', color: 'Soul Red', images: ['/cars/car-4.jpg'], vin: 'JM3KFBDM1M0123456'
  },
  {
    id: '5', stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado', grade: 'TXL', year: 2017,
    mileageKm: 72000, engineCc: 2700, transmission: 'Automatic', fuel: 'Petrol', steering: 'Right',
    priceUsd: 35000, priceLocal: 945000, currency: 'ZMW', location: 'Kitwe Branch', status: 'Sold',
    bodyType: 'SUV', color: 'White', images: ['/cars/car-5.jpg'], vin: 'JTEBH3FJ5HK123456'
  },
];

export default function InventoryManager({ tenantSlug, initialCars = SAMPLE_CARS }: InventoryManagerProps) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [filteredCars, setFilteredCars] = useState<Car[]>(initialCars);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filter cars based on search and filters
  useEffect(() => {
    let filtered = cars;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car =>
        car.stockNo.toLowerCase().includes(query) ||
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.vin?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(car => car.status === statusFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(car => car.location === locationFilter);
    }
    
    setFilteredCars(filtered);
  }, [cars, searchQuery, statusFilter, locationFilter]);

  const handleStatusChange = (carId: string, newStatus: Car['status']) => {
    setCars(prev => prev.map(car =>
      car.id === carId ? { ...car, status: newStatus } : car
    ));
  };

  const handleDelete = (carId: string) => {
    if (confirm('Are you sure you want to delete this car?')) {
      setCars(prev => prev.filter(car => car.id !== carId));
    }
  };

  const handleBulkStatusChange = (newStatus: Car['status']) => {
    setCars(prev => prev.map(car =>
      selectedCars.includes(car.id) ? { ...car, status: newStatus } : car
    ));
    setSelectedCars([]);
  };

  const toggleSelectCar = (carId: string) => {
    setSelectedCars(prev =>
      prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCars.length === filteredCars.length) {
      setSelectedCars([]);
    } else {
      setSelectedCars(filteredCars.map(car => car.id));
    }
  };

  const formatMoney = (amount: number, currency: string = 'ZMW') => {
    if (currency === 'ZMW') {
      return `K${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-700',
    'Reserved': 'bg-yellow-100 text-yellow-700',
    'Sold': 'bg-blue-100 text-blue-700',
    'In-Transit': 'bg-purple-100 text-purple-700',
  };

  const locations = [...new Set(cars.map(car => car.location))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your vehicle stock</p>
        </div>
        <Link
          href={`/t/${tenantSlug}/admin/inventory/add`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add New Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Stock</p>
          <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-700">{cars.filter(c => c.status === 'Available').length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-yellow-600">Reserved</p>
          <p className="text-2xl font-bold text-yellow-700">{cars.filter(c => c.status === 'Reserved').length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-blue-600">Sold</p>
          <p className="text-2xl font-bold text-blue-700">{cars.filter(c => c.status === 'Sold').length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by stock no, make, model, or VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="In-Transit">In-Transit</option>
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              aria-label="Table view"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              aria-label="Grid view"
            >
              ⊞
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCars.length > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">{selectedCars.length} selected</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as Car['status']);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 border rounded text-sm"
              aria-label="Bulk status change"
            >
              <option value="">Change Status To...</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
              <option value="In-Transit">In-Transit</option>
            </select>
            <button
              onClick={() => setSelectedCars([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Cars Table */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCars.length === filteredCars.length && filteredCars.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vehicle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mileage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCars.includes(car.id)}
                        onChange={() => toggleSelectCar(car.id)}
                        className="rounded"
                        aria-label={`Select ${car.stockNo}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-600">{car.stockNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {car.images[0] ? (
                            <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaCar />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{car.make} {car.model}</p>
                          <p className="text-xs text-gray-500">{car.grade || ''} • {car.transmission} • {car.fuel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{car.year}</td>
                    <td className="px-4 py-3 text-sm">{car.mileageKm.toLocaleString()} km</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{formatMoney(car.priceLocal || 0, 'ZMW')}</p>
                        <p className="text-xs text-gray-500">${car.priceUsd?.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{car.location}</td>
                    <td className="px-4 py-3">
                      <select
                        value={car.status}
                        onChange={(e) => handleStatusChange(car.id, e.target.value as Car['status'])}
                        className={`px-2 py-1 text-xs font-medium rounded ${statusColors[car.status]}`}
                        aria-label="Change status"
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                        <option value="In-Transit">In-Transit</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/t/${tenantSlug}/stock/${car.stockNo}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View public"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/t/${tenantSlug}/admin/inventory/${car.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <FaCar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cars found matching your criteria</p>
            </div>
          )}
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3]">
                {car.images[0] ? (
                  <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaCar className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded ${statusColors[car.status]}`}>
                  {car.status}
                </span>
                <input
                  type="checkbox"
                  checked={selectedCars.includes(car.id)}
                  onChange={() => toggleSelectCar(car.id)}
                  className="absolute top-2 right-2 w-5 h-5 rounded"
                  aria-label={`Select ${car.stockNo}`}
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">Stock# {car.stockNo}</div>
                <h3 className="font-semibold text-gray-900">{car.make} {car.model} {car.grade || ''}</h3>
                <div className="flex gap-2 text-xs text-gray-600 mt-1">
                  <span>{car.year}</span>
                  <span>•</span>
                  <span>{car.mileageKm.toLocaleString()} km</span>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-blue-600">{formatMoney(car.priceLocal || 0, 'ZMW')}</p>
                  <p className="text-xs text-gray-500">${car.priceUsd?.toLocaleString()}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/t/${tenantSlug}/admin/inventory/${car.id}/edit`}
                    className="flex-1 px-3 py-1.5 text-sm text-center bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/t/${tenantSlug}/stock/${car.stockNo}`}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
