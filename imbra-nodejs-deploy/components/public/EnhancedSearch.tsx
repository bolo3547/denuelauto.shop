import React, { useState, useEffect } from 'react';
import { SearchFilters } from './searchTypes';
import { FaSearch, FaBell, FaSave, FaTrash, FaFilter, FaTimes } from 'react-icons/fa';

interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<SearchFilters>;
  createdAt: Date;
  alertEnabled: boolean;
  lastNotified?: Date;
}

interface EnhancedSearchProps {
  currentFilters: Partial<SearchFilters>;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  tenantSlug: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  currentFilters,
  onFiltersChange,
  onSearch,
  tenantSlug
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [enableAlerts, setEnableAlerts] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    under5k: false,
    under10k: false,
    under15k: false,
    lowMileage: false,
    recentModels: false,
    fuelEfficient: false
  });

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`savedSearches_${tenantSlug}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((search: any) => ({
          ...search,
          createdAt: new Date(search.createdAt)
        }));
        setSavedSearches(parsed);
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, [tenantSlug]);

  // Save searches to localStorage
  const saveSearchesToStorage = (searches: SavedSearch[]) => {
    localStorage.setItem(`savedSearches_${tenantSlug}`, JSON.stringify(searches));
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date(),
      alertEnabled: enableAlerts
    };

    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    saveSearchesToStorage(updatedSearches);

    setSearchName('');
    setEnableAlerts(false);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    onFiltersChange(search.filters);
    setShowSavedSearches(false);
  };

  const handleDeleteSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    saveSearchesToStorage(updatedSearches);
  };

  const handleQuickFilterToggle = (filterKey: string) => {
    const newQuickFilters = { ...quickFilters, [filterKey]: !quickFilters[filterKey as keyof typeof quickFilters] };

    let newFilters = { ...currentFilters };

    switch (filterKey) {
      case 'under5k':
        newFilters.priceMax = newQuickFilters.under5k ? '5000' : undefined;
        break;
      case 'under10k':
        newFilters.priceMax = newQuickFilters.under10k ? '10000' : undefined;
        break;
      case 'under15k':
        newFilters.priceMax = newQuickFilters.under15k ? '15000' : undefined;
        break;
      case 'lowMileage':
        newFilters.maxMileage = newQuickFilters.lowMileage ? '50000' : undefined;
        break;
      case 'recentModels':
        newFilters.yearMin = newQuickFilters.recentModels ? String(new Date().getFullYear() - 3) : undefined;
        break;
      case 'fuelEfficient':
        newFilters.fuelType = newQuickFilters.fuelEfficient ? 'Hybrid' : undefined;
        break;
    }

    setQuickFilters(newQuickFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(currentFilters).some(value =>
    value !== null && value !== undefined && value !== ''
  );

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaSearch className="text-blue-600" />
          Enhanced Search
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            <FaSave /> Saved Searches ({savedSearches.length})
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'under5k', label: 'Under $5,000' },
            { key: 'under10k', label: 'Under $10,000' },
            { key: 'under15k', label: 'Under $15,000' },
            { key: 'lowMileage', label: 'Low Mileage (<50k)' },
            { key: 'recentModels', label: 'Recent Models (3yrs)' },
            { key: 'fuelEfficient', label: 'Fuel Efficient' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleQuickFilterToggle(key)}
              className={`px-3 py-1 text-sm rounded-full border ${
                quickFilters[key as keyof typeof quickFilters]
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Current Search */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Save This Search:</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search name (e.g., 'Toyota under 10k')"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
              />
              Email alerts
            </label>
            <button
              onClick={handleSaveSearch}
              disabled={!searchName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved Searches Panel */}
      {showSavedSearches && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Your Saved Searches:</h4>
            <button
              type="button"
              title="Close saved searches"
              onClick={() => setShowSavedSearches(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          {savedSearches.length === 0 ? (
            <p className="text-sm text-gray-500">No saved searches yet. Save your current search above!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{search.name}</div>
                    <div className="text-xs text-gray-600">
                      {Object.entries(search.filters)
                        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ') || 'No filters'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Saved {search.createdAt.toLocaleDateString()}
                      {search.alertEnabled && <span className="ml-2 text-blue-600">🔔 Alerts enabled</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadSearch(search)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      title="Delete saved search"
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Actions */}
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="text-sm text-gray-600">
          {hasActiveFilters ? 'Active filters applied' : 'No filters applied'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFiltersChange({})}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Clear All
          </button>
          <button
            onClick={onSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Search Cars
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearch;
