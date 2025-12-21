import React, { useState, useEffect } from 'react';
import { FaUser, FaHeart, FaSearch, FaShoppingCart, FaHistory, FaCog, FaSignOutAlt, FaEye, FaTrash } from 'react-icons/fa';

interface UserDashboardProps {
  buyer: any;
  onLogout: () => void;
  favorites: any[];
  onRemoveFromFavorites: (carId: string) => void;
  onCarClick: (car: Car) => void;
  recentSearches: string[];
  onClearRecentSearches: () => void;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  image: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  buyer,
  onLogout,
  favorites,
  onRemoveFromFavorites,
  onCarClick,
  recentSearches,
  onClearRecentSearches
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'searches' | 'settings'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'favorites', label: 'Favorites', icon: FaHeart },
    { id: 'searches', label: 'Recent Searches', icon: FaSearch },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Welcome back, {buyer?.firstName || 'User'}!</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaHeart className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
            <div className="text-sm text-gray-600">Saved Cars</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaSearch className="text-2xl text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{recentSearches.length}</div>
            <div className="text-sm text-gray-600">Recent Searches</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaShoppingCart className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Inquiries Made</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('favorites')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <FaHeart className="text-red-500 mb-2" />
            <div className="font-medium">View Saved Cars</div>
            <div className="text-sm text-gray-600">Access your favorite vehicles</div>
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <FaHistory className="text-blue-500 mb-2" />
            <div className="font-medium">Recent Searches</div>
            <div className="text-sm text-gray-600">Continue where you left off</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Favorite Cars ({favorites.length})</h3>
        {favorites.length > 0 && (
          <button
            onClick={() => favorites.forEach(fav => onRemoveFromFavorites(fav.id))}
            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-2"
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No favorite cars yet</h4>
          <p className="text-gray-600 mb-4">Start browsing and save cars you're interested in!</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((car) => (
            <div key={car.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img
                src={car.image}
                alt={`${car.make} ${car.model}`}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => onCarClick(car)}
              />
              <div className="p-4">
                <h4 className="font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => onCarClick(car)}>
                  {car.make} {car.model} {car.year}
                </h4>
                <div className="text-xl font-bold text-blue-600 mb-3">
                  ${car.priceUsd.toLocaleString()}
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => onCarClick(car)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <FaEye /> View Details
                  </button>
                  <button
                    onClick={() => onRemoveFromFavorites(car.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSearches = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Searches</h3>
        {recentSearches.length > 0 && (
          <button
            onClick={onClearRecentSearches}
            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-2"
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {recentSearches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent searches</h4>
          <p className="text-gray-600">Your search history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentSearches.map((search, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <FaSearch className="text-gray-400" />
                <span className="font-medium">{search}</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm border border-blue-600 rounded">
                Search Again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                New car matches for saved searches
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                Price drops on favorite cars
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Weekly newsletter
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select className="border rounded px-3 py-2 w-full max-w-xs">
              <option value="USD">USD ($)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select className="border rounded px-3 py-2 w-full max-w-xs">
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'favorites' && renderFavorites()}
            {activeTab === 'searches' && renderSearches()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
