import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { FaCar, FaPlus, FaEdit, FaTrash, FaUpload, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import AddCarForm from '../../components/AddCarForm';
import { ingestCarMedia } from '../../services/media';
import { makeApiUrl } from '@/lib/config/api';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  priceUsd?: number;
  priceLocalZmw?: number;
  status?: string;
  publishToPublic: boolean;
  images?: string[];
  createdAt: string;
}

export default function InventoryManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(makeApiUrl('/api/cars'), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setCars(data.map((c: Record<string, unknown>) => ({
        id: typeof c.id === 'string' ? c.id : '',
        stockNo: typeof c.stockNo === 'string' ? c.stockNo : '',
        make: typeof c.make === 'string' ? c.make : '',
        model: typeof c.model === 'string' ? c.model : '',
        year: typeof c.year === 'number' ? c.year : 0,
        priceUsd: c.priceUsd ? Number(c.priceUsd) : 0,
        priceLocalZmw: c.priceLocalZmw ? Number(c.priceLocalZmw) : 0,
        status: typeof c.status === 'string' ? c.status : 'available',
        publishToPublic: typeof c.publishToPublic === 'boolean' ? c.publishToPublic : false,
        images: Array.isArray(c.images) ? (c.images as string[]) : [],
        createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString()
      })));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to load inventory');
        console.error(err);
      } else {
        setError('Failed to load inventory');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.stockNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const togglePublish = async (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    try {
      const res = await fetch(makeApiUrl(`/api/cars/${carId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ publishToPublic: !car.publishToPublic })
      });
      if (!res.ok) throw new Error('Failed to update');
      setCars(cars.map(c => c.id === carId ? { ...c, publishToPublic: !c.publishToPublic } : c));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle publish status');
    }
  };

  const duplicateCar = async (carId: string) => {
    const originalCar = cars.find(c => c.id === carId);
    if (!originalCar) return;
    try {
      const res = await fetch(makeApiUrl('/api/cars'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          stockNo: `${originalCar.stockNo}_COPY`,
          make: originalCar.make,
          model: originalCar.model,
          year: originalCar.year,
          priceUsd: originalCar.priceUsd,
          priceLocalZmw: originalCar.priceLocalZmw,
          publishToPublic: false
        })
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      await fetchCars();
    } catch (err) {
      console.error(err);
      alert('Failed to duplicate car');
    }
  };

  const deleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      const res = await fetch(makeApiUrl(`/api/cars/${carId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      setCars(cars.filter(c => c.id !== carId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete car');
    }
  };

  interface NewCarData {
    stockNo: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    priceUsd?: string;
    priceLocalZmw?: string;
    publishToPublic: boolean;
    publishToExport?: boolean;
    images?: File[];
  }
  
    const handleSaveCar = async (carData: NewCarData) => {
    try {
      const res = await fetch(makeApiUrl('/api/cars'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          stockNo: carData.stockNo,
          vin: carData.vin || undefined,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          priceUsd: parseFloat(carData.priceUsd || '0'),
          priceLocalZmw: parseFloat(carData.priceLocalZmw || '0'),
          publishToPublic: carData.publishToPublic,
          publishToExport: carData.publishToExport
        })
      });
      if (!res.ok) throw new Error('Failed to create car');
      const newCar = await res.json();

      // Ingest uploaded media if any
      if (carData.images && carData.images.length > 0) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
        // Upload files and get URLs
        const uploadUrls: string[] = [];
        for (let i = 0; i < carData.images.length; i++) {
          // Replace this with your actual upload logic
          // Example: const url = await uploadFileAndGetUrl(carData.images[i]);
          // For now, throw if not implemented
          throw new Error('File upload logic not implemented. Please implement file upload and get URL.');
          // uploadUrls.push(url);
        }
        await ingestCarMedia(newCar.id, uploadUrls, token);
      }

      await fetchCars();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save car:', error);
      alert('Failed to save car. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Loading / Error states */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
          <button onClick={fetchCars} className="ml-4 underline">Retry</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
            <FaUpload /> Bulk Import
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FaPlus /> Add New Car
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Inventory</h3>
          <p className="text-2xl font-bold text-blue-600">{cars.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Published</h3>
          <p className="text-2xl font-bold text-green-600">{cars.filter(c => c.publishToPublic).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Available</h3>
          <p className="text-2xl font-bold text-purple-600">{cars.filter(c => c.status === 'available').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Sold</h3>
          <p className="text-2xl font-bold text-orange-600">{cars.filter(c => c.status === 'sold').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by make, model, or stock number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (ZMW)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <FaCar className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          Added {new Date(car.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {car.stockNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(car.priceLocalZmw || car.priceUsd || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      car.status === 'available' ? 'bg-green-100 text-green-800' :
                      car.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      title={car.publishToPublic ? "Unpublish car" : "Publish car"}
                      onClick={() => togglePublish(car.id)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                        car.publishToPublic 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {car.publishToPublic ? <FaEye /> : <FaEyeSlash />}
                      {car.publishToPublic ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        title="Edit"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        title="Duplicate"
                        onClick={() => duplicateCar(car.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCopy />
                      </button>
                      <button 
                        type="button"
                        title="Delete"
                        onClick={() => deleteCar(car.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <FaCar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cars found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first car to the inventory.'
            }
          </p>
        </div>
      )}

      {/* Add Car Form Modal */}
      {showAddForm && (
        <AddCarForm
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveCar}
        />
      )}
    </div>
  );
}