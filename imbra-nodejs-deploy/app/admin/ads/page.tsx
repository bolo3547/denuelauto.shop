'use client';

import { useState } from 'react';

interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([
    {
      id: '1',
      title: 'Special Financing Available',
      content: 'Get 0% financing on selected models for the next 30 days!',
      targetUrl: '/contact',
      isActive: true,
      startDate: '2025-11-26',
      endDate: '2025-12-26',
      impressions: 1250,
      clicks: 45,
    },
    {
      id: '2',
      title: 'Trade-in Your Old Car',
      content: 'Get the best value for your trade-in. Free appraisal!',
      targetUrl: '/contact',
      isActive: false,
      startDate: '2025-11-20',
      endDate: '2025-12-20',
      impressions: 890,
      clicks: 23,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    content: '',
    imageUrl: '',
    targetUrl: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateAd = () => {
    const ad: Ad = {
      id: Date.now().toString(),
      ...newAd,
      isActive: true,
      impressions: 0,
      clicks: 0,
    };
    setAds([...ads, ad]);
    setNewAd({
      title: '',
      content: '',
      imageUrl: '',
      targetUrl: '',
      startDate: '',
      endDate: '',
    });
    setShowCreateForm(false);
  };

  const toggleAdStatus = (id: string) => {
    setAds(ads.map(ad =>
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    ));
  };

  const deleteAd = (id: string) => {
    setAds(ads.filter(ad => ad.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-600">Create and manage your website advertisements</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Ad
        </button>
      </div>

      {/* Create Ad Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Create New Advertisement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ad title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <input
                type="text"
                value={newAd.targetUrl}
                onChange={(e) => setNewAd({ ...newAd, targetUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="/contact"
                title="Target URL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newAd.content}
                onChange={(e) => setNewAd({ ...newAd, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Ad content/description"
                title="Ad content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="text"
                value={newAd.imageUrl}
                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
                title="Image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newAd.startDate}
                onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newAd.endDate}
                onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="End date"
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
              onClick={handleCreateAd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Ad
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Advertisements</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {ads.map((ad) => (
            <div key={ad.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{ad.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{ad.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Target: {ad.targetUrl}</span>
                    <span>Impressions: {ad.impressions.toLocaleString()}</span>
                    <span>Clicks: {ad.clicks.toLocaleString()}</span>
                    <span>CTR: {((ad.clicks / ad.impressions) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {ad.startDate} to {ad.endDate}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAdStatus(ad.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      ad.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {ad.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteAd(ad.id)}
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