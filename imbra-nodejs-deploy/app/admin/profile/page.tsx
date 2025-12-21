'use client';

import { useState } from 'react';
import { tenantTheme } from '@/components/dealer-types';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: tenantTheme.name,
    phone: tenantTheme.contactInfo.phone,
    email: tenantTheme.contactInfo.email,
    address: tenantTheme.contactInfo.address,
    primaryColor: tenantTheme.primaryColor,
    secondaryColor: tenantTheme.secondaryColor,
    accentColor: tenantTheme.accentColor,
    heroTitle: tenantTheme.heroTitle,
    heroSubtitle: tenantTheme.heroSubtitle,
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-gray-600">Update your business information and branding</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-6">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Business name"
              title="Business Name"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Phone number"
              title="Phone Number"
            />
          </div>
          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="emailAddress"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Email address"
              title="Email Address"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Address"
              title="Address"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-6">Branding & Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={profile.primaryColor}
              onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
              title="Primary color"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <input
              type="color"
              value={profile.secondaryColor}
              onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
              title="Secondary color"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <input
              type="color"
              value={profile.accentColor}
              onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
              title="Accent color"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-6">Hero Section Content</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Title
            </label>
            <input
              type="text"
              value={profile.heroTitle}
              onChange={(e) => setProfile({ ...profile, heroTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              title="Hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Subtitle
            </label>
            <textarea
              value={profile.heroSubtitle}
              onChange={(e) => setProfile({ ...profile, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              title="Hero subtitle"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}