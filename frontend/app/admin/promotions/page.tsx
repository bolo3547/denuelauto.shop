'use client';

import { useState } from 'react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue: number;
  applicableTo: 'all' | 'specific' | 'category';
  targetItems: string[]; // car IDs or categories
  minimumPurchase?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUsage?: number;
  code?: string;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'Black Friday Sale',
      description: '20% off on all vehicles',
      discountType: 'percentage',
      discountValue: 20,
      applicableTo: 'all',
      targetItems: [],
      isActive: true,
      startDate: '2025-11-26',
      endDate: '2025-12-02',
      usageCount: 15,
      maxUsage: 100,
      code: 'BLACKFRIDAY2025',
    },
    {
      id: '2',
      title: 'SUV Special',
      description: '$2000 off on all SUVs',
      discountType: 'fixed',
      discountValue: 2000,
      applicableTo: 'category',
      targetItems: ['SUV'],
      minimumPurchase: 15000,
      isActive: true,
      startDate: '2025-11-26',
      endDate: '2025-12-31',
      usageCount: 8,
      maxUsage: 50,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    discountType: 'percentage' as Promotion['discountType'],
    discountValue: 0,
    applicableTo: 'all' as Promotion['applicableTo'],
    targetItems: [] as string[],
    minimumPurchase: 0,
    startDate: '',
    endDate: '',
    maxUsage: 0,
    code: '',
  });

  const handleCreatePromotion = () => {
    const promotion: Promotion = {
      id: Date.now().toString(),
      ...newPromotion,
      isActive: true,
      usageCount: 0,
    };
    setPromotions([...promotions, promotion]);
    setNewPromotion({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      applicableTo: 'all',
      targetItems: [],
      minimumPurchase: 0,
      startDate: '',
      endDate: '',
      maxUsage: 0,
      code: '',
    });
    setShowCreateForm(false);
  };

  const togglePromotionStatus = (id: string) => {
    setPromotions(promotions.map(promo =>
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ));
  };

  const deletePromotion = (id: string) => {
    setPromotions(promotions.filter(promo => promo.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotion Management</h1>
          <p className="text-gray-600">Create and manage promotional campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Promotion
        </button>
      </div>

      {/* Create Promotion Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Create New Promotion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="promotion-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                  id="promotion-title"
                type="text"
                value={newPromotion.title}
                onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Promotion title"
              />
            </div>
            <div>
                <label htmlFor="promotion-discount-type" className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
              <select
                  id="promotion-discount-type"
                value={newPromotion.discountType}
                onChange={(e) => setNewPromotion({ ...newPromotion, discountType: e.target.value as Promotion['discountType'] })}
                title="Discount type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="free">Free Item/Service</option>
              </select>
            </div>
            <div>
                <label htmlFor="promotion-discount-value" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value {newPromotion.discountType === 'percentage' ? '(%)' : '($)'}
                </label>
              <input
                  id="promotion-discount-value"
                type="number"
                value={newPromotion.discountValue}
                onChange={(e) => setNewPromotion({ ...newPromotion, discountValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step={newPromotion.discountType === 'percentage' ? '1' : '0.01'}
                title="Discount value"
              />
            </div>
            <div>
                <label htmlFor="promotion-applicable-to" className="block text-sm font-medium text-gray-700 mb-2">Applicable To</label>
              <select
                  id="promotion-applicable-to"
                value={newPromotion.applicableTo}
                onChange={(e) => setNewPromotion({ ...newPromotion, applicableTo: e.target.value as Promotion['applicableTo'] })}
                title="Applicable to"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Items</option>
                <option value="category">Specific Categories</option>
                <option value="specific">Specific Items</option>
              </select>
            </div>
            <div>
                <label htmlFor="promotion-minimum-purchase" className="block text-sm font-medium text-gray-700 mb-2">Minimum Purchase ($)</label>
              <input
                  id="promotion-minimum-purchase"
                type="number"
                value={newPromotion.minimumPurchase}
                onChange={(e) => setNewPromotion({ ...newPromotion, minimumPurchase: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                placeholder="Optional"
                title="Minimum purchase"
              />
            </div>
            <div>
                <label htmlFor="promotion-max-usage" className="block text-sm font-medium text-gray-700 mb-2">Max Usage</label>
              <input
                  id="promotion-max-usage"
                type="number"
                value={newPromotion.maxUsage}
                onChange={(e) => setNewPromotion({ ...newPromotion, maxUsage: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                placeholder="Unlimited"
                title="Max usage"
              />
            </div>
            <div>
                <label htmlFor="promotion-code" className="block text-sm font-medium text-gray-700 mb-2">Promo Code (optional)</label>
              <input
                  id="promotion-code"
                type="text"
                value={newPromotion.code}
                onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="SUMMER2025"
                title="Promo code"
              />
            </div>
            <div>
                <label htmlFor="promotion-start-date" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                  id="promotion-start-date"
                type="date"
                value={newPromotion.startDate}
                onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="Start date"
                placeholder="Select start date"
              />
            </div>
            <div>
                <label htmlFor="promotion-end-date" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                  id="promotion-end-date"
                type="date"
                value={newPromotion.endDate}
                onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                title="End date"
                placeholder="Select end date"
              />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="promotion-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                  id="promotion-description"
                value={newPromotion.description}
                onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Promotion description"
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
              onClick={handleCreatePromotion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Promotion
            </button>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Promotions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {promotions.map((promo) => (
            <div key={promo.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{promo.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {promo.code && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        Code: {promo.code}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{promo.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>
                      Discount: {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                    </span>
                    <span>Used: {promo.usageCount}{promo.maxUsage ? `/${promo.maxUsage}` : ''}</span>
                    {promo.minimumPurchase && (
                      <span>Min Purchase: ${promo.minimumPurchase}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {promo.startDate} to {promo.endDate}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePromotionStatus(promo.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      promo.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {promo.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deletePromotion(promo.id)}
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