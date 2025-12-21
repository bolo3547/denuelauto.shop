"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaUser, FaHeart, FaSearch, FaBell, FaFileAlt, FaHistory,
  FaCog, FaSignOutAlt, FaCar, FaEnvelope, FaPhone, FaEdit,
  FaTrash, FaChevronRight, FaExchangeAlt, FaCalendarAlt
} from 'react-icons/fa';
import BeForwardHeader from './BeForwardHeader';
import BeForwardFooter from './BeForwardFooter';

interface CustomerDashboardProps {
  tenantSlug: string;
  tenant?: any;
  user?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    memberSince?: string;
  };
}

export default function CustomerDashboard({ tenantSlug, tenant, user }: CustomerDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [currency, setCurrency] = useState('ZMW');

  useEffect(() => {
    // Load currency preference
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);

    // Load favorites from localStorage (in real app, fetch from API)
    const favIds = JSON.parse(localStorage.getItem(`favs:${tenantSlug}`) || '[]');
    // Mock favorites data
    const mockFavorites = SAMPLE_CARS.filter(car => favIds.includes(car.id || car.stockNo));
    setFavorites(mockFavorites);

    // Mock saved searches
    setSavedSearches([
      { id: '1', name: 'Toyota SUVs under K400K', filters: { make: 'Toyota', bodyType: 'SUV', maxPrice: 400000 }, alerts: true, createdAt: '2024-12-01' },
      { id: '2', name: 'Honda Sedans 2019+', filters: { make: 'Honda', bodyType: 'Sedan', minYear: 2019 }, alerts: false, createdAt: '2024-11-15' },
    ]);

    // Mock inquiries
    setInquiries([
      { id: '1', car: { stockNo: 'DA-001', make: 'Toyota', model: 'Harrier' }, status: 'replied', date: '2024-12-10', message: 'Is this car still available?' },
      { id: '2', car: { stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado' }, status: 'pending', date: '2024-12-08', message: 'Can I arrange a test drive?' },
    ]);
  }, [tenantSlug]);

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const removeFavorite = (carId: string) => {
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const newFavs = favs.filter((id: string) => id !== carId);
    localStorage.setItem(key, JSON.stringify(newFavs));
    setFavorites(favorites.filter(car => (car.id || car.stockNo) !== carId));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteSavedSearch = (searchId: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== searchId));
  };

  const toggleSearchAlerts = (searchId: string) => {
    setSavedSearches(savedSearches.map(s =>
      s.id === searchId ? { ...s, alerts: !s.alerts } : s
    ));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'favorites', label: 'Favorites', icon: FaHeart, count: favorites.length },
    { id: 'searches', label: 'Saved Searches', icon: FaSearch, count: savedSearches.length },
    { id: 'inquiries', label: 'My Inquiries', icon: FaEnvelope, count: inquiries.length },
    { id: 'quotations', label: 'Quotations', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FaUser className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user?.name || 'Guest User'}</h2>
                  <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                </div>
              </div>
              {user?.memberSince && (
                <p className="text-xs text-gray-400 mt-3">Member since {user.memberSince}</p>
              )}
            </div>

            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => router.push(`/t/${tenantSlug}/login`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}!</h1>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FaHeart className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                        <p className="text-sm text-gray-500">Favorites</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaSearch className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
                        <p className="text-sm text-gray-500">Saved Searches</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaEnvelope className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
                        <p className="text-sm text-gray-500">Inquiries</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaBell className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{savedSearches.filter(s => s.alerts).length}</p>
                        <p className="text-sm text-gray-500">Active Alerts</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Favorites */}
                {favorites.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Favorites</h3>
                      <button onClick={() => setActiveTab('favorites')} className="text-sm text-blue-600 hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {favorites.slice(0, 3).map((car) => (
                        <Link
                          key={car.id || car.stockNo}
                          href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}
                          className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <img src={car.images?.[0] || '/placeholder-car.jpg'} alt="" className="w-20 h-16 object-cover rounded" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{car.make} {car.model}</p>
                            <p className="text-xs text-gray-500">{car.year} • {car.mileageKm?.toLocaleString()}km</p>
                            <p className="text-blue-600 font-semibold text-sm">{formatPrice(car.priceUsd || 0)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Inquiries */}
                {inquiries.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
                      <button onClick={() => setActiveTab('inquiries')} className="text-sm text-blue-600 hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3">
                      {inquiries.slice(0, 3).map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{inquiry.car.make} {inquiry.car.model}</p>
                            <p className="text-xs text-gray-500">Stock# {inquiry.car.stockNo} • {inquiry.date}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            inquiry.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {inquiry.status === 'replied' ? 'Replied' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                  <span className="text-sm text-gray-500">{favorites.length} cars saved</span>
                </div>

                {favorites.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-500 mb-4">Start browsing and save cars you like!</p>
                    <Link href={`/t/${tenantSlug}/stock`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                      Browse Stock
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((car) => (
                      <div key={car.id || car.stockNo} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4">
                        <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`} className="w-40 h-28 flex-shrink-0">
                          <img src={car.images?.[0] || '/placeholder-car.jpg'} alt="" className="w-full h-full object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                              {car.make} {car.model} {car.grade || ''}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">Stock# {car.stockNo || car.id} • {car.year} • {car.mileageKm?.toLocaleString()}km</p>
                          <p className="text-lg font-bold text-blue-600 mt-2">{formatPrice(car.priceUsd || 0)}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/t/${tenantSlug}/stock/${car.stockNo || car.id}`}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => removeFavorite(car.id || car.stockNo)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FaTrash className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Searches Tab */}
            {activeTab === 'searches' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
                  <Link
                    href={`/t/${tenantSlug}/stock`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    New Search
                  </Link>
                </div>

                {savedSearches.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
                    <p className="text-gray-500 mb-4">Save your searches to get notified when new cars match!</p>
                    <Link href={`/t/${tenantSlug}/stock`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                      Start Searching
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{search.name}</h3>
                            <p className="text-sm text-gray-500">Created {search.createdAt}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(search.filters).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSearchAlerts(search.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                search.alerts
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <FaBell className="w-4 h-4" />
                              {search.alerts ? 'Alerts On' : 'Alerts Off'}
                            </button>
                            <Link
                              href={`/t/${tenantSlug}/stock?${new URLSearchParams(search.filters as any).toString()}`}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Run Search
                            </Link>
                            <button
                              onClick={() => deleteSavedSearch(search.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>

                {inquiries.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FaEnvelope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                    <p className="text-gray-500">Send an inquiry about a car you're interested in!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FaCar className="w-5 h-5 text-gray-400" />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {inquiry.car.make} {inquiry.car.model}
                              </h3>
                              <p className="text-sm text-gray-500">Stock# {inquiry.car.stockNo}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            inquiry.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {inquiry.status === 'replied' ? 'Replied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{inquiry.message}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" /> {inquiry.date}
                          </span>
                          <Link
                            href={`/t/${tenantSlug}/stock/${inquiry.car.stockNo}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Car →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quotations Tab */}
            {activeTab === 'quotations' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Quotations</h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
                  <p className="text-gray-500">Request a quotation for any car you're interested in.</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          defaultValue={user?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ''}
                        placeholder="+260 97 XXX XXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save Changes
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">Email me when new cars match my saved searches</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">Email me when a dealer replies to my inquiry</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">Send me promotional offers and deals</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />
    </div>
  );
}

// Sample cars for demo
const SAMPLE_CARS = [
  { id: '1', stockNo: 'DA-001', make: 'Toyota', model: 'Harrier', grade: 'Premium', year: 2019, mileageKm: 45000, priceUsd: 18500, images: ['/cars/car-1.jpg'] },
  { id: '2', stockNo: 'DA-002', make: 'Honda', model: 'CR-V', grade: 'EX', year: 2020, mileageKm: 32000, priceUsd: 22000, images: ['/cars/car-2.jpg'] },
  { id: '5', stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado', grade: 'TXL', year: 2017, mileageKm: 72000, priceUsd: 35000, images: ['/cars/car-5.jpg'] },
];
