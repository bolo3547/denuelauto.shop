'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaCar, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaSort,
  FaFileImport,
  FaFileExport,
  FaBell,
  FaWrench,
  FaBarcode,
  FaCalendarAlt,
  FaGasPump,
  FaCog,
  FaChartLine
} from 'react-icons/fa';

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  price: number;
  status: 'available' | 'sold' | 'reserved' | 'maintenance';
  condition: 'new' | 'used' | 'certified';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  bodyType: string;
  engine: string;
  location: string;
  dateAdded: string;
  lastService?: string;
  nextService?: string;
  images: string[];
  views: number;
  inquiries: number;
  alerts?: string[];
}

interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  serviceProvider: string;
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'service_due' | 'high_mileage' | 'price_alert';
  message: string;
  vehicleId?: string;
  severity: 'low' | 'medium' | 'high';
  created: string;
}

export default function InventoryManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVinDecoder, setShowVinDecoder] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadVehicles();
    loadServiceRecords();
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchTerm, statusFilter, makeFilter, conditionFilter, sortBy, sortOrder]);

  const loadVehicles = async () => {
    try {
      // Mock data - replace with actual API
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          vin: '1HGBH41JXMN109186',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Silver',
          mileage: 25000,
          price: 28000,
          status: 'available',
          condition: 'used',
          fuelType: 'gasoline',
          transmission: 'automatic',
          bodyType: 'Sedan',
          engine: '2.5L I4',
          location: 'Lot A-15',
          dateAdded: '2024-01-15',
          lastService: '2024-01-10',
          nextService: '2024-07-10',
          images: ['/images/camry1.jpg', '/images/camry2.jpg'],
          views: 45,
          inquiries: 8,
          alerts: ['Service Due Soon']
        },
        {
          id: '2',
          vin: '2C3CDZAG9HH123456',
          make: 'Honda',
          model: 'Accord',
          year: 2019,
          color: 'Black',
          mileage: 35000,
          price: 25000,
          status: 'reserved',
          condition: 'certified',
          fuelType: 'gasoline',
          transmission: 'automatic',
          bodyType: 'Sedan',
          engine: '1.5L Turbo',
          location: 'Lot B-08',
          dateAdded: '2024-01-20',
          lastService: '2024-02-01',
          nextService: '2024-08-01',
          images: ['/images/accord1.jpg'],
          views: 62,
          inquiries: 12
        },
        {
          id: '3',
          vin: '5NPE24AF4FH123789',
          make: 'Hyundai',
          model: 'Elantra',
          year: 2021,
          color: 'White',
          mileage: 15000,
          price: 22000,
          status: 'maintenance',
          condition: 'used',
          fuelType: 'gasoline',
          transmission: 'manual',
          bodyType: 'Sedan',
          engine: '2.0L I4',
          location: 'Service Bay 2',
          dateAdded: '2024-02-01',
          images: ['/images/elantra1.jpg'],
          views: 23,
          inquiries: 3,
          alerts: ['In Maintenance', 'High Mileage for Year']
        }
      ];

      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRecords = async () => {
    const mockRecords: ServiceRecord[] = [
      {
        id: '1',
        vehicleId: '1',
        date: '2024-01-10',
        type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        cost: 45,
        serviceProvider: 'AutoCare Plus'
      },
      {
        id: '2',
        vehicleId: '2',
        date: '2024-02-01',
        type: 'Brake Service',
        description: 'Brake pad replacement and rotor resurfacing',
        cost: 320,
        serviceProvider: 'Brake Masters'
      }
    ];
    setServiceRecords(mockRecords);
  };

  const loadAlerts = async () => {
    const mockAlerts: InventoryAlert[] = [
      {
        id: '1',
        type: 'service_due',
        message: 'Toyota Camry (VIN: 1HGBH41JXMN109186) is due for service',
        vehicleId: '1',
        severity: 'medium',
        created: '2024-02-10'
      },
      {
        id: '2',
        type: 'low_stock',
        message: 'Only 3 Honda vehicles in stock',
        severity: 'high',
        created: '2024-02-11'
      }
    ];
    setAlerts(mockAlerts);
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    // Make filter
    if (makeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.make === makeFilter);
    }

    // Condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.condition === conditionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'mileage':
          aValue = a.mileage;
          bValue = b.mileage;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        default:
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVehicles(filtered);
  };

  const decodeVin = async (vin: string) => {
    // Mock VIN decoder - replace with actual API
    return {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      engine: '2.5L I4',
      bodyType: 'Sedan',
      fuelType: 'gasoline',
      transmission: 'automatic'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-emerald-100 text-emerald-800';
      case 'certified':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueMakes = [...new Set(vehicles.map(v => v.make))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Manager</h1>
            <p className="text-gray-600">Manage your vehicle inventory, service records, and alerts</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBulkImport(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <FaFileImport className="w-4 h-4" />
              <span>Bulk Import</span>
            </button>
            
            <button
              onClick={() => setShowVinDecoder(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <FaBarcode className="w-4 h-4" />
              <span>VIN Decoder</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <FaPlus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <FaBell className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-gray-900">Active Alerts ({alerts.length})</h3>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-50 border border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
              <FaCar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {vehicles.filter(v => v.status === 'available').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Service</p>
                <p className="text-2xl font-bold text-red-600">
                  {vehicles.filter(v => v.status === 'maintenance').length}
                </p>
              </div>
              <FaWrench className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${vehicles.reduce((sum, v) => sum + v.price, 0).toLocaleString()}
                </p>
              </div>
              <FaChartLine className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center space-x-4 space-y-2">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by make, model, VIN, or year..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Make Filter */}
          <select
            aria-label="Filter by make"
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Makes</option>
            {uniqueMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            aria-label="Filter by condition"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="certified">Certified</option>
            <option value="used">Used</option>
          </select>

          {/* Sort */}
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="dateAdded">Date Added</option>
            <option value="price">Price</option>
            <option value="mileage">Mileage</option>
            <option value="year">Year</option>
            <option value="views">Views</option>
          </select>

          <button
            aria-label="Toggle sort order"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaSort className="w-4 h-4 text-gray-500" />
          </button>

          {/* Export */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaFileExport className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Vehicle Image */}
            <div className="h-48 bg-gray-200 relative">
              {vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaCar className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Alerts Badge */}
              {vehicle.alerts && vehicle.alerts.length > 0 && (
                <div className="absolute top-2 right-2">
                  <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {vehicle.alerts.length}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(vehicle.condition)}`}>
                  {vehicle.condition}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${vehicle.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mileage:</span>
                  <span>{vehicle.mileage.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span>{vehicle.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Views:</span>
                  <span>{vehicle.views} • {vehicle.inquiries} inquiries</span>
                </div>
              </div>

              {/* Service Info */}
              {vehicle.nextService && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Service due: {new Date(vehicle.nextService).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {vehicle.alerts && vehicle.alerts.length > 0 && (
                <div className="space-y-1 mb-4">
                  {vehicle.alerts.map((alert, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                      <span className="text-xs text-red-700">{alert}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  <FaEye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
                  <FaEdit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                  <FaWrench className="w-3 h-3" />
                  <span>Service</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <FaCar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}