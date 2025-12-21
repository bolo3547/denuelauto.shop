'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaSave,
  FaUpload,
  FaImage,
  FaQuoteLeft,
  FaStar,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaGlobe,
  FaPalette,
  FaCheck,
  FaSpinner,
  FaEye
} from 'react-icons/fa';

interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
}

interface CustomerReview {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  isActive: boolean;
}

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'reviews' | 'homepage'>('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Branding state
  const [branding, setBranding] = useState<BrandingSettings>({
    siteName: 'Denuel Auto',
    tagline: 'Your Trusted Car Dealership Partner',
    logoUrl: '',
    logoLightUrl: '',
    logoDarkUrl: '',
    faviconUrl: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#FFD700',
    heroTitle: 'The Operating System for Modern Car Dealerships',
    heroSubtitle: 'Denuel Auto combines inventory, sales, finance, HR, and marketing into one platform.'
  });

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>([
    {
      id: '1',
      name: 'Linda K.',
      role: 'GM, Multi-branch dealer',
      quote: 'We cut onboarding time in half and finally see live stock across all yards.',
      rating: 5,
      avatarUrl: '',
      isActive: true
    },
    {
      id: '2',
      name: 'Tapiwa M.',
      role: 'Sales Director',
      quote: 'Agents close faster with MoMo receipts and approval flows baked in.',
      rating: 5,
      avatarUrl: '',
      isActive: true
    },
    {
      id: '3',
      name: 'Aisha N.',
      role: 'Head of Finance',
      quote: 'Commission and payout tracking is now automatic—no more spreadsheets.',
      rating: 5,
      avatarUrl: '',
      isActive: true
    }
  ]);

  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const reviewImageRef = useRef<HTMLInputElement>(null);

  // Load branding on mount
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch('/api/super-admin/branding');
        if (response.ok) {
          const data = await response.json();
          if (data.branding) {
            setBranding(prev => ({ ...prev, ...data.branding }));
          }
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        }
      } catch (error) {
        console.log('Using default branding');
      } finally {
        setLoading(false);
      }
    };
    loadBranding();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save branding settings
      const response = await fetch('/api/super-admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding, reviews })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon' | 'avatar') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/super-admin/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const { url } = await response.json();
        return url;
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    
    // Return a mock URL for demo
    return URL.createObjectURL(file);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file, 'logo');
      setBranding({ ...branding, logoUrl: url, logoLightUrl: url });
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file, 'favicon');
      setBranding({ ...branding, faviconUrl: url });
    }
  };

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingReview) {
      const url = await handleImageUpload(file, 'avatar');
      setEditingReview({ ...editingReview, avatarUrl: url });
    }
  };

  const addNewReview = () => {
    setEditingReview({
      id: Date.now().toString(),
      name: '',
      role: '',
      quote: '',
      rating: 5,
      avatarUrl: '',
      isActive: true
    });
    setShowReviewModal(true);
  };

  const saveReview = () => {
    if (!editingReview) return;
    
    const existingIndex = reviews.findIndex(r => r.id === editingReview.id);
    if (existingIndex >= 0) {
      const updated = [...reviews];
      updated[existingIndex] = editingReview;
      setReviews(updated);
    } else {
      setReviews([...reviews, editingReview]);
    }
    setShowReviewModal(false);
    setEditingReview(null);
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const toggleReviewActive = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding & Homepage</h1>
          <p className="text-gray-600 mt-1">Customize the Denuel Auto website appearance</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="/" 
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaEye className="w-4 h-4 mr-2" />
            Preview Site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
            ) : saveSuccess ? (
              <FaCheck className="w-4 h-4 mr-2" />
            ) : (
              <FaSave className="w-4 h-4 mr-2" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'branding', label: 'Branding', icon: FaPalette },
              { id: 'homepage', label: 'Homepage', icon: FaGlobe },
              { id: 'reviews', label: 'Customer Reviews', icon: FaQuoteLeft }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-8">
              {/* Site Identity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={branding.siteName}
                      onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Denuel Auto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={branding.tagline}
                      onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Trusted Car Export Partner"
                    />
                  </div>
                </div>
              </div>

              {/* Logo & Favicon */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo & Favicon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      {branding.logoUrl ? (
                        <div className="relative inline-block">
                          <img 
                            src={branding.logoUrl} 
                            alt="Logo" 
                            className="max-h-24 mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x80?text=Logo';
                            }}
                          />
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className="absolute -top-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Click to upload logo</p>
                        </div>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <FaUpload className="w-4 h-4 inline mr-2" />
                        Upload Logo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 200x80px, PNG or SVG</p>
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      {branding.faviconUrl ? (
                        <div className="relative inline-block">
                          <img 
                            src={branding.faviconUrl} 
                            alt="Favicon" 
                            className="w-16 h-16 mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Icon';
                            }}
                          />
                          <button
                            onClick={() => faviconInputRef.current?.click()}
                            className="absolute -top-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Click to upload favicon</p>
                        </div>
                      )}
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => faviconInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <FaUpload className="w-4 h-4 inline mr-2" />
                        Upload Favicon
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 32x32px or 64x64px, ICO or PNG</p>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="#0F3D91"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="#FFD700"
                      />
                    </div>
                  </div>
                </div>
                {/* Color Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="flex gap-3">
                    <div 
                      className="px-6 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Primary Button
                    </div>
                    <div 
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: branding.secondaryColor, color: '#000' }}
                    >
                      Secondary Button
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Homepage Tab */}
          {activeTab === 'homepage' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      id="heroTitle"
                      value={branding.heroTitle}
                      onChange={(e) => setBranding({ ...branding, heroTitle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="The Operating System for Modern Car Dealerships"
                    />
                  </div>
                  <div>
                    <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <textarea
                      id="heroSubtitle"
                      value={branding.heroSubtitle}
                      onChange={(e) => setBranding({ ...branding, heroSubtitle: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Denuel Auto combines inventory, sales, finance, HR, and marketing into one platform."
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
                      <div className="text-center text-white">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          {branding.logoUrl ? (
                            <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
                          ) : (
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold">{branding.siteName.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                            </div>
                          )}
                          <span className="text-xl font-semibold">{branding.siteName}</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-2">{branding.heroTitle || 'Your Hero Title'}</h4>
                        <p className="opacity-90 max-w-xl mx-auto">{branding.heroSubtitle || 'Your hero subtitle will appear here'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <p className="text-sm text-gray-500">Manage testimonials displayed on the homepage</p>
                </div>
                <button
                  onClick={addNewReview}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className={`bg-white border rounded-xl p-5 ${
                      review.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {review.avatarUrl ? (
                          <img 
                            src={review.avatarUrl} 
                            alt={review.name}
                            className="w-14 h-14 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {review.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            <p className="text-sm text-gray-500">{review.role}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">&quot;{review.quote}&quot;</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReviewActive(review.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            review.isActive 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={review.isActive ? 'Active - Click to hide' : 'Hidden - Click to show'}
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingReview(review);
                            setShowReviewModal(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaQuoteLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">No reviews yet</h4>
                    <p className="text-gray-500 mt-1">Add customer testimonials to display on the homepage</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Edit Modal */}
      {showReviewModal && editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {reviews.find(r => r.id === editingReview.id) ? 'Edit Review' : 'Add New Review'}
              </h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setEditingReview(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer Photo */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {editingReview.avatarUrl ? (
                    <img 
                      src={editingReview.avatarUrl} 
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={reviewImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReviewImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => reviewImageRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    <FaUpload className="w-4 h-4 inline mr-2" />
                    Upload Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Optional customer photo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    id="reviewName"
                    value={editingReview.name}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Linda K."
                  />
                </div>
                <div>
                  <label htmlFor="reviewRole" className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                  <input
                    type="text"
                    id="reviewRole"
                    value={editingReview.role}
                    onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sales Director"
                  />
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: star })}
                      className="p-1"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <FaStar 
                        className={`w-8 h-8 ${star <= editingReview.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="reviewQuote" className="block text-sm font-medium text-gray-700 mb-1">Review Quote</label>
                <textarea
                  id="reviewQuote"
                  value={editingReview.quote}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Write the customer's testimonial..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingReview.isActive}
                  onChange={(e) => setEditingReview({ ...editingReview, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Display this review on the homepage
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setEditingReview(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReview}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
