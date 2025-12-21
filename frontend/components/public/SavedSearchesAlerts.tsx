import React, { useState } from 'react';
import { FaBell, FaSave } from 'react-icons/fa';

const SavedSearchesAlerts: React.FC = () => {
  const [savedSearches, setSavedSearches] = useState([
    { id: '1', query: 'Toyota Prado under $20k', count: 5, lastUpdated: '2 hours ago' },
    { id: '2', query: 'Honda Fit 2020+', count: 3, lastUpdated: '1 day ago' }
  ]);
  const [email, setEmail] = useState('');

  const saveCurrentSearch = () => {
    // Mock save current search
    const newSearch = {
      id: Date.now().toString(),
      query: 'Current search criteria',
      count: 0,
      lastUpdated: 'Just now'
    };
    setSavedSearches([...savedSearches, newSearch]);
  };

  const subscribeAlerts = () => {
    if (email) {
      alert(`Subscribed ${email} for new car alerts!`);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <FaSave /> Saved Searches & Alerts
      </h3>

      <button
        onClick={saveCurrentSearch}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700"
      >
        Save Current Search
      </button>

      <div className="space-y-2 mb-4">
        {savedSearches.map(search => (
          <div key={search.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <div className="text-sm font-medium">{search.query}</div>
              <div className="text-xs text-gray-500">{search.count} matches • {search.lastUpdated}</div>
            </div>
            <FaBell className="text-gray-400" />
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Get New Car Alerts</h4>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <button
          onClick={subscribeAlerts}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Subscribe for Alerts
        </button>
      </div>
    </div>
  );
};

export default SavedSearchesAlerts;
