import React, { useState, useEffect } from 'react';
import BuyerAuth from '../components/BuyerAuth';
import BuyerDashboard from '../components/BuyerDashboard';
import PublicCarBrowse from '../components/PublicCarBrowse';
import CarDetails from '../components/CarDetails';
import type { Buyer } from '@/types/buyer';
import { makeApiUrl } from '@/lib/config/api';

interface BuyerPortalMainProps {
  tenantSlug: string;
}

export default function BuyerPortalMain({ tenantSlug }: BuyerPortalMainProps) {
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'browse' | 'car-details'>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const res = await fetch(makeApiUrl('/api/auth/me'), { credentials: 'include' });
        if (!res.ok) {
          setCurrentView('auth');
          return;
        }
        const data = await res.json();
        if (data.user) {
          setBuyer(data.user);
          setCurrentView('dashboard');
        } else {
          setCurrentView('auth');
        }
      } catch (error) {
        console.error('Failed to resolve session:', error);
        setCurrentView('auth');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleAuthSuccess = (buyerData: Buyer) => {
    setBuyer(buyerData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch(makeApiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Failed to logout', error);
    }
    setBuyer(null);
    setCurrentView('auth');
  };

  const handleCarSelect = (carId: string) => {
    setSelectedCarId(carId);
    setCurrentView('car-details');
  };

  const handleBackToBrowse = () => {
    setSelectedCarId(null);
    setCurrentView('browse');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render based on current view
  switch (currentView) {
    case 'auth':
      return (
        <BuyerAuth
          mode={authMode}
          onSuccess={handleAuthSuccess}
          onModeChange={setAuthMode}
          tenantSlug={tenantSlug}
        />
      );

    case 'dashboard':
      return (
        <div>
          <BuyerDashboard />
          {/* Navigation to other sections */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3">
            <button
              onClick={() => setCurrentView('browse')}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Browse Cars"
            >
              🚗
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      );

    case 'browse':
      return (
        <div>
          <PublicCarBrowse
            tenantSlug={tenantSlug}
            buyerId={buyer?.id}
            onCarSelect={(car) => handleCarSelect(car.id)}
          />
          {/* Navigation */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
              title="Dashboard"
            >
              📊
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      );

    case 'car-details':
      return selectedCarId ? (
        <CarDetails
          carId={selectedCarId}
          tenantSlug={tenantSlug}
          buyerId={buyer?.id}
          onClose={handleBackToBrowse}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Car not found</p>
            <button
              onClick={handleBackToBrowse}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Browse
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Invalid view state</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
  }
}