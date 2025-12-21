'use client';

import { useState } from 'react';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'header' | 'sidebar' | 'footer' | 'homepage';
  isActive: boolean;
  displayOrder: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Welcome to Enuel Motors',
      imageUrl: '/banners/welcome-banner.jpg',
      linkUrl: '/cars',
      position: 'header',
      isActive: true,
      displayOrder: 1,
      startDate: '2025-11-26',
      endDate: '2025-12-31',
      impressions: 2500,
      clicks: 120,
    },
    {
      id: '2',
      title: 'Special Offers',
      imageUrl: '/banners/special-offers.jpg',
      linkUrl: '/contact',
      position: 'sidebar',
      isActive: true,
      displayOrder: 2,
      startDate: '2025-11-26',
      endDate: '2025-12-15',
      impressions: 1800,
      clicks: 85,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'header' as Banner['position'],
    displayOrder: 1,
    startDate: '',
    endDate: '',
  });

  const handleCreateBanner = () => {
    const banner: Banner = {
      id: Date.now().toString(),
      ...newBanner,
      isActive: true,
      impressions: 0,
      clicks: 0,
    };
    setBanners([...banners, banner]);
    setNewBanner({
      title: '',
      imageUrl: '',
      linkUrl: '',
      position: 'header',
      displayOrder: 1,
      startDate: '',
      endDate: '',
    });
    setShowCreateForm(false);
  };

  const toggleBannerStatus = (id: string) => {
    setBanners(banners.map(banner =>
      banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
    ));
  };

  const deleteBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const updateDisplayOrder = (id: string, newOrder: number) => {
    setBanners(banners.map(banner =>
      banner.id === id ? { ...banner, displayOrder: newOrder } : banner
    ));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600">Create and manage website banners</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Banner
        </button>
      </div>

      {/* Create Banner Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Create New Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="banner-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                id="banner-title"
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Banner title"
              />
            </div>
            <div>
              <label htmlFor="banner-position" className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                id="banner-position"
                value={newBanner.position}
                onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value as Banner['position'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="header">Header</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
                <option value="homepage">Homepage</option>
              </select>
            </div>
            <div>
              <label htmlFor="banner-image" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                id="banner-image"
                type="text"
                value={newBanner.imageUrl}
                onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div>
              <label htmlFor="banner-link" className="block text-sm font-medium text-gray-700 mb-2">Link URL (optional)</label>
              <input
                id="banner-link"
                type="text"
                value={newBanner.linkUrl}
                onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="/cars"
              />
            </div>
            <div>
              <label htmlFor="banner-order" className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                id="banner-order"
                type="number"
                value={newBanner.displayOrder}
                onChange={(e) => setNewBanner({ ...newBanner, displayOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="banner-start" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                id="banner-start"
                type="date"
                value={newBanner.startDate}
                onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="banner-end" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                id="banner-end"
                type="date"
                value={newBanner.endDate}
                onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBanner}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Banner
            </button>
          </div>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Banners</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {banners.map((banner) => (
            <div key={banner.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{banner.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {banner.position}
                    </span>
                  </div>
                  <div className="mt-2">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-32 h-16 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-banner.jpg';
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {banner.linkUrl && <span>Link: {banner.linkUrl}</span>}
                    <span>Order: {banner.displayOrder}</span>
                    <span>Impressions: {banner.impressions.toLocaleString()}</span>
                    <span>Clicks: {banner.clicks.toLocaleString()}</span>
                    <span>CTR: {((banner.clicks / banner.impressions) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {banner.startDate} to {banner.endDate}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleBannerStatus(banner.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      banner.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {banner.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}