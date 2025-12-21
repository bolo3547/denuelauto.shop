import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'banner' | 'logo' | 'ad';
  url: string;
  thumbnail: string;
  size: string;
  uploadedAt: string;
  status: 'active' | 'draft' | 'archived';
  dimensions?: string;
  usedIn?: string[];
}

interface AdCampaign {
  id: string;
  name: string;
  type: 'banner' | 'popup' | 'slider' | 'sidebar';
  status: 'active' | 'scheduled' | 'paused' | 'ended';
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  image: string;
  targetPage: string;
}

interface BrandAsset {
  id: string;
  name: string;
  category: 'logo' | 'color' | 'font' | 'template';
  value: string;
  preview?: string;
}

export default function GraphicDesignerPortal() {
  const [activeTab, setActiveTab] = useState('media');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([]);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'banner' | 'logo' | 'ad'>('image');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  
  // New ad form state
  const [newAd, setNewAd] = useState({
    name: '',
    type: 'banner' as 'banner' | 'popup' | 'slider' | 'sidebar',
    startDate: '',
    endDate: '',
    targetPage: 'home',
    image: '',
  });

  // New logo form state
  const [newLogo, setNewLogo] = useState({
    file: null as File | null,
    preview: '',
    type: 'primary' as 'primary' | 'secondary' | 'favicon' | 'watermark',
  });

  useEffect(() => {
    loadMockData();
    loadTenantData();
  }, []);

  const loadTenantData = () => {
    const stored = localStorage.getItem('tenantData');
    if (stored) {
      setTenantData(JSON.parse(stored));
    }
  };

  const loadMockData = () => {
    // Mock media items
    setMediaItems([
      {
        id: '1',
        name: 'Company Logo',
        type: 'logo',
        url: '/uploads/logo-main.png',
        thumbnail: '/api/placeholder/150/150',
        size: '245 KB',
        uploadedAt: '2024-12-01',
        status: 'active',
        dimensions: '500x200',
        usedIn: ['Header', 'Footer', 'Invoices'],
      },
      {
        id: '2',
        name: 'Christmas Sale Banner',
        type: 'banner',
        url: '/uploads/xmas-banner.jpg',
        thumbnail: '/api/placeholder/300/100',
        size: '1.2 MB',
        uploadedAt: '2024-12-05',
        status: 'active',
        dimensions: '1920x600',
        usedIn: ['Homepage Slider'],
      },
      {
        id: '3',
        name: 'Toyota Camry Hero',
        type: 'image',
        url: '/uploads/camry-hero.jpg',
        thumbnail: '/api/placeholder/200/150',
        size: '856 KB',
        uploadedAt: '2024-12-03',
        status: 'active',
        dimensions: '1200x800',
        usedIn: ['Featured Cars'],
      },
      {
        id: '4',
        name: 'End of Year Promo',
        type: 'ad',
        url: '/uploads/eoy-promo.jpg',
        thumbnail: '/api/placeholder/200/200',
        size: '445 KB',
        uploadedAt: '2024-12-04',
        status: 'active',
        dimensions: '400x400',
        usedIn: ['Sidebar Ad'],
      },
      {
        id: '5',
        name: 'Mobile Logo',
        type: 'logo',
        url: '/uploads/logo-mobile.png',
        thumbnail: '/api/placeholder/100/100',
        size: '89 KB',
        uploadedAt: '2024-11-20',
        status: 'active',
        dimensions: '200x200',
        usedIn: ['Mobile Header'],
      },
    ]);

    // Mock ad campaigns
    setAdCampaigns([
      {
        id: '1',
        name: 'Christmas Sale 2024',
        type: 'banner',
        status: 'active',
        startDate: '2024-12-01',
        endDate: '2024-12-25',
        impressions: 15420,
        clicks: 892,
        image: '/api/placeholder/300/100',
        targetPage: 'homepage',
      },
      {
        id: '2',
        name: 'New Arrivals Popup',
        type: 'popup',
        status: 'active',
        startDate: '2024-12-05',
        endDate: '2024-12-31',
        impressions: 8950,
        clicks: 445,
        image: '/api/placeholder/200/200',
        targetPage: 'all',
      },
      {
        id: '3',
        name: 'Finance Special',
        type: 'sidebar',
        status: 'scheduled',
        startDate: '2024-12-15',
        endDate: '2025-01-15',
        impressions: 0,
        clicks: 0,
        image: '/api/placeholder/200/400',
        targetPage: 'inventory',
      },
    ]);

    // Mock brand assets
    setBrandAssets([
      { id: '1', name: 'Primary Logo', category: 'logo', value: '/uploads/logo-main.png', preview: '/api/placeholder/200/80' },
      { id: '2', name: 'Secondary Logo', category: 'logo', value: '/uploads/logo-alt.png', preview: '/api/placeholder/200/80' },
      { id: '3', name: 'Primary Color', category: 'color', value: '#3b82f6' },
      { id: '4', name: 'Secondary Color', category: 'color', value: '#10b981' },
      { id: '5', name: 'Accent Color', category: 'color', value: '#f59e0b' },
      { id: '6', name: 'Heading Font', category: 'font', value: 'Poppins' },
      { id: '7', name: 'Body Font', category: 'font', value: 'Inter' },
    ]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          name: file.name,
          type: uploadType,
          url: reader.result as string,
          thumbnail: reader.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'draft',
          dimensions: 'Auto-detected',
        };
        setMediaItems([newMedia, ...mediaItems]);
        setShowUploadModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogo({ ...newLogo, file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveLogo = () => {
    if (newLogo.preview) {
      // In real app, upload to server and update tenant settings
      const updated = {
        ...tenantData,
        theme: {
          ...tenantData?.theme,
          logo: newLogo.preview,
        },
      };
      localStorage.setItem('tenantData', JSON.stringify(updated));
      setTenantData(updated);
      
      // Add to media library
      const logoMedia: MediaItem = {
        id: Date.now().toString(),
        name: `${newLogo.type} Logo`,
        type: 'logo',
        url: newLogo.preview,
        thumbnail: newLogo.preview,
        size: newLogo.file ? `${(newLogo.file.size / 1024).toFixed(1)} KB` : 'Unknown',
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'active',
        usedIn: [newLogo.type === 'primary' ? 'Header' : 'Other'],
      };
      setMediaItems([logoMedia, ...mediaItems]);
      
      setShowLogoModal(false);
      setNewLogo({ file: null, preview: '', type: 'primary' });
      alert('Logo updated successfully! The website will reflect changes shortly.');
    }
  };

  const createAdCampaign = () => {
    const campaign: AdCampaign = {
      id: Date.now().toString(),
      ...newAd,
      status: new Date(newAd.startDate) > new Date() ? 'scheduled' : 'active',
      impressions: 0,
      clicks: 0,
    };
    setAdCampaigns([campaign, ...adCampaigns]);
    setShowAdModal(false);
    setNewAd({ name: '', type: 'banner', startDate: '', endDate: '', targetPage: 'home', image: '' });
  };

  const toggleAdStatus = (id: string) => {
    setAdCampaigns(adCampaigns.map(ad => 
      ad.id === id ? { ...ad, status: ad.status === 'active' ? 'paused' : 'active' } : ad
    ));
  };

  const deleteMedia = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMediaItems(mediaItems.filter(m => m.id !== id));
    }
  };

  const filteredMedia = mediaItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const stats = {
    totalMedia: mediaItems.length,
    activeAds: adCampaigns.filter(a => a.status === 'active').length,
    totalImpressions: adCampaigns.reduce((sum, a) => sum + a.impressions, 0),
    totalClicks: adCampaigns.reduce((sum, a) => sum + a.clicks, 0),
  };

  return (
    <>
      <Head>
        <title>Graphic Designer Portal | Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                  ← Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-slate-600" />
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎨</span> Graphic Designer Portal
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"
                >
                  <span>🖼️</span> Change Logo
                </button>
                <button
                  onClick={() => setShowAdModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  <span>📢</span> Create Ad
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2"
                >
                  <span>📤</span> Upload Media
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Media', value: stats.totalMedia, icon: '🖼️', color: 'from-blue-500 to-cyan-600' },
              { label: 'Active Ads', value: stats.activeAds, icon: '📢', color: 'from-pink-500 to-fuchsia-600' },
              { label: 'Impressions', value: stats.totalImpressions.toLocaleString(), icon: '👁️', color: 'from-amber-500 to-orange-600' },
              { label: 'Ad Clicks', value: stats.totalClicks.toLocaleString(), icon: '🖱️', color: 'from-green-500 to-emerald-600' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'media', label: 'Media Library', icon: '🖼️' },
              { key: 'ads', label: 'Ad Campaigns', icon: '📢' },
              { key: 'banners', label: 'Banner Manager', icon: '🎯' },
              { key: 'brand', label: 'Brand Assets', icon: '✨' },
              { key: 'templates', label: 'Templates', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Media Library Tab */}
          {activeTab === 'media' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Media Library</h2>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="logo">Logos</option>
                    <option value="banner">Banners</option>
                    <option value="ad">Ads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    className="group relative bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600 hover:border-pink-500 transition-all cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <div className="aspect-square bg-slate-800 flex items-center justify-center">
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.type === 'logo' ? 'bg-purple-500/20 text-purple-400' :
                          item.type === 'banner' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'ad' ? 'bg-pink-500/20 text-pink-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-slate-500 text-xs">{item.size}</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <span>👁️</span>
                      </button>
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <span>✏️</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Campaigns Tab */}
          {activeTab === 'ads' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Ad Campaigns</h2>
              <div className="space-y-4">
                {adCampaigns.map(ad => (
                  <div key={ad.id} className="flex items-center gap-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                    <img src={ad.image} alt={ad.name} className="w-24 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-medium">{ad.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ad.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          ad.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          ad.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {ad.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          {ad.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {ad.startDate} → {ad.endDate} • Target: {ad.targetPage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{ad.impressions.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">impressions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{ad.clicks.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">clicks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">
                        {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-slate-400 text-sm">CTR</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          ad.status === 'active'
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {ad.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        <span>✏️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banner Manager Tab */}
          {activeTab === 'banners' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Website Banners</h2>
              <div className="grid grid-cols-1 gap-6">
                {/* Homepage Slider */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Homepage Slider</h3>
                    <button className="px-3 py-1.5 bg-pink-500/20 text-pink-400 rounded-lg text-sm hover:bg-pink-500/30 transition-colors">
                      + Add Slide
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {mediaItems.filter(m => m.type === 'banner').slice(0, 3).map((banner, idx) => (
                      <div key={idx} className="relative aspect-[3/1] bg-slate-800 rounded-lg overflow-hidden group">
                        <img src={banner.thumbnail} alt={banner.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm">Edit</button>
                          <button className="px-3 py-1.5 bg-red-500/20 rounded-lg text-red-400 text-sm">Remove</button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                          Slide {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Ads */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Sidebar Advertisements</h3>
                    <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                      + Add Ad
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {mediaItems.filter(m => m.type === 'ad').map((ad, idx) => (
                      <div key={idx} className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden group">
                        <img src={ad.thumbnail} alt={ad.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popup Ads */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Popup Promotions</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">Status:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-pink-500 rounded-full peer peer-checked:bg-pink-500 transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-48 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                      <span className="text-slate-500">Popup Preview</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-slate-400 text-sm">Show popup on:</label>
                        <select className="w-full mt-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white">
                          <option>All Pages</option>
                          <option>Homepage Only</option>
                          <option>Inventory Pages</option>
                          <option>On Exit Intent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Delay (seconds):</label>
                        <input type="number" defaultValue={3} className="w-full mt-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brand Assets Tab */}
          {activeTab === 'brand' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Brand Assets</h2>
              
              {/* Logos Section */}
              <div className="mb-8">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span>🖼️</span> Logos
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {brandAssets.filter(a => a.category === 'logo').map(asset => (
                    <div key={asset.id} className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 text-center">
                      <div className="h-20 flex items-center justify-center mb-3 bg-slate-800 rounded-lg">
                        {asset.preview && <img src={asset.preview} alt={asset.name} className="max-h-full" />}
                      </div>
                      <p className="text-white text-sm font-medium">{asset.name}</p>
                      <button className="mt-2 text-pink-400 text-sm hover:text-pink-300">Replace</button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowLogoModal(true)}
                    className="p-4 bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-600 hover:border-pink-500 transition-colors flex flex-col items-center justify-center"
                  >
                    <span className="text-3xl mb-2">➕</span>
                    <span className="text-slate-400 text-sm">Add Logo</span>
                  </button>
                </div>
              </div>

              {/* Colors Section */}
              <div className="mb-8">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span>🎨</span> Brand Colors
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {brandAssets.filter(a => a.category === 'color').map(asset => (
                    <div key={asset.id} className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-slate-600"
                        style={{ backgroundColor: asset.value }}
                      />
                      <p className="text-white text-sm font-medium">{asset.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{asset.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonts Section */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span>🔤</span> Typography
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {brandAssets.filter(a => a.category === 'font').map(asset => (
                    <div key={asset.id} className="p-6 bg-slate-700/50 rounded-xl border border-slate-600">
                      <p className="text-slate-400 text-sm mb-2">{asset.name}</p>
                      <p className="text-white text-2xl" style={{ fontFamily: asset.value }}>
                        {asset.value}
                      </p>
                      <p className="text-slate-500 text-sm mt-2" style={{ fontFamily: asset.value }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Design Templates</h2>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: 'Social Media Post', size: '1080x1080', icon: '📱' },
                  { name: 'Website Banner', size: '1920x600', icon: '🖥️' },
                  { name: 'Email Header', size: '600x200', icon: '📧' },
                  { name: 'Car Listing Card', size: '400x300', icon: '🚗' },
                  { name: 'Promotional Flyer', size: 'A4', icon: '📄' },
                  { name: 'Business Card', size: '3.5x2 in', icon: '💼' },
                ].map((template, idx) => (
                  <div key={idx} className="p-6 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-pink-500 transition-colors cursor-pointer group">
                    <div className="text-4xl mb-4">{template.icon}</div>
                    <h3 className="text-white font-medium">{template.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{template.size}</p>
                    <button className="mt-4 w-full py-2 bg-pink-500/20 text-pink-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Upload Media</h3>
              
              <div className="mb-4">
                <label className="text-slate-400 text-sm">Media Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="image">Image</option>
                  <option value="banner">Banner</option>
                  <option value="logo">Logo</option>
                  <option value="ad">Advertisement</option>
                </select>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors"
              >
                <span className="text-4xl mb-3 block">📤</span>
                <p className="text-white font-medium">Click to upload or drag & drop</p>
                <p className="text-slate-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logo Modal */}
        {showLogoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4">🖼️ Change Website Logo</h3>
              
              <div className="mb-4">
                <label className="text-slate-400 text-sm">Logo Type</label>
                <select
                  value={newLogo.type}
                  onChange={(e) => setNewLogo({ ...newLogo, type: e.target.value as any })}
                  className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="primary">Primary Logo (Header)</option>
                  <option value="secondary">Secondary Logo (Footer)</option>
                  <option value="favicon">Favicon</option>
                  <option value="watermark">Watermark</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-slate-400 text-sm block mb-2">Current Logo</label>
                <div className="p-4 bg-slate-700 rounded-lg flex items-center justify-center">
                  {tenantData?.theme?.logo ? (
                    <img src={tenantData.theme.logo} alt="Current Logo" className="max-h-20" />
                  ) : (
                    <span className="text-slate-500">No logo set</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-slate-400 text-sm block mb-2">New Logo</label>
                <div
                  onClick={() => document.getElementById('logo-input')?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-pink-500 transition-colors"
                >
                  {newLogo.preview ? (
                    <img src={newLogo.preview} alt="New Logo Preview" className="max-h-24 mx-auto" />
                  ) : (
                    <>
                      <span className="text-3xl mb-2 block">📤</span>
                      <p className="text-white">Click to upload new logo</p>
                      <p className="text-slate-400 text-sm">Recommended: PNG with transparency</p>
                    </>
                  )}
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                <p className="text-amber-400 text-sm">
                  ⚠️ The logo will be updated across your entire website including headers, footers, invoices, and emails.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowLogoModal(false); setNewLogo({ file: null, preview: '', type: 'primary' }); }}
                  className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLogo}
                  disabled={!newLogo.preview}
                  className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Update Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ad Campaign Modal */}
        {showAdModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4">📢 Create Ad Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm">Campaign Name</label>
                  <input
                    type="text"
                    value={newAd.name}
                    onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                    placeholder="e.g., Summer Sale 2024"
                    className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm">Ad Type</label>
                    <select
                      value={newAd.type}
                      onChange={(e) => setNewAd({ ...newAd, type: e.target.value as any })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="banner">Banner</option>
                      <option value="popup">Popup</option>
                      <option value="slider">Slider</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">Target Page</label>
                    <select
                      value={newAd.targetPage}
                      onChange={(e) => setNewAd({ ...newAd, targetPage: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="home">Homepage</option>
                      <option value="inventory">Inventory</option>
                      <option value="all">All Pages</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm">Start Date</label>
                    <input
                      type="date"
                      value={newAd.startDate}
                      onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">End Date</label>
                    <input
                      type="date"
                      value={newAd.endDate}
                      onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Ad Image</label>
                  <div className="mt-1 border-2 border-dashed border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <span className="text-2xl">🖼️</span>
                    <p className="text-slate-400 text-sm mt-1">Click to upload ad image</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAdModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createAdCampaign}
                  disabled={!newAd.name || !newAd.startDate || !newAd.endDate}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Detail Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedMedia(null)}>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-6">
                <div className="w-64 h-64 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={selectedMedia.thumbnail} alt={selectedMedia.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedMedia.name}</h3>
                  <div className="mt-4 space-y-2">
                    <p className="text-slate-400"><span className="text-white">Type:</span> {selectedMedia.type}</p>
                    <p className="text-slate-400"><span className="text-white">Size:</span> {selectedMedia.size}</p>
                    <p className="text-slate-400"><span className="text-white">Dimensions:</span> {selectedMedia.dimensions}</p>
                    <p className="text-slate-400"><span className="text-white">Uploaded:</span> {selectedMedia.uploadedAt}</p>
                    <p className="text-slate-400"><span className="text-white">Status:</span> {selectedMedia.status}</p>
                    {selectedMedia.usedIn && (
                      <p className="text-slate-400"><span className="text-white">Used in:</span> {selectedMedia.usedIn.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                      Download
                    </button>
                    <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                      Edit
                    </button>
                    <button 
                      onClick={() => { deleteMedia(selectedMedia.id); setSelectedMedia(null); }}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
