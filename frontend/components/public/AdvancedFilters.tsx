import React, { useState } from 'react';
import { FaFilter, FaSlidersH } from 'react-icons/fa';

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFilterChange, currentFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between text-left font-semibold text-gray-700 mb-3"
      >
        <span className="flex items-center gap-2">
          <FaSlidersH /> Advanced Filters
        </span>
        <span>{showAdvanced ? '−' : '+'}</span>
      </button>

      {showAdvanced && (
        <div className="space-y-4">
          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturing Year</label>
            <div className="flex gap-2">
              <select
                value={currentFilters.yearMin || ''}
                onChange={(e) => handleFilterChange('yearMin', e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-2 border rounded"
              >
                <option value="">Min Year</option>
                {Array.from({ length: 20 }, (_, i) => 2025 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={currentFilters.yearMax || ''}
                onChange={(e) => handleFilterChange('yearMax', e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-2 border rounded"
              >
                <option value="">Max Year</option>
                {Array.from({ length: 20 }, (_, i) => 2025 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
            <select
              value={currentFilters.mileage || ''}
              onChange={(e) => handleFilterChange('mileage', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Any Mileage</option>
              <option value="low">Low (0-50,000 km)</option>
              <option value="medium">Medium (50,000-100,000 km)</option>
              <option value="high">High (100,000+ km)</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
            <div className="flex flex-wrap gap-2">
              {['Automatic', 'Manual', 'CVT'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFilters.transmission?.includes(type) || false}
                    onChange={(e) => {
                      const current = currentFilters.transmission || [];
                      const updated = e.target.checked
                        ? [...current, type]
                        : current.filter((t: string) => t !== type);
                      handleFilterChange('transmission', updated.length ? updated : null);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
            <div className="flex flex-wrap gap-2">
              {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFilters.fuelType?.includes(type) || false}
                    onChange={(e) => {
                      const current = currentFilters.fuelType || [];
                      const updated = e.target.checked
                        ? [...current, type]
                        : current.filter((t: string) => t !== type);
                      handleFilterChange('fuelType', updated.length ? updated : null);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFilters.bodyType?.includes(type) || false}
                    onChange={(e) => {
                      const current = currentFilters.bodyType || [];
                      const updated = e.target.checked
                        ? [...current, type]
                        : current.filter((t: string) => t !== type);
                      handleFilterChange('bodyType', updated.length ? updated : null);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => onFilterChange({})}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
