'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  country: string;
  rating: number;
  review: string;
  imageUrl?: string;
  carPurchased?: string;
  date: string;
  isActive: boolean;
}

interface BrandingContextType {
  branding: BrandingSettings;
  reviews: CustomerReview[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultBranding: BrandingSettings = {
  siteName: 'Denuel Auto',
  tagline: 'Your Trusted Car Export Partner',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  primaryColor: '#0F3D91',
  secondaryColor: '#FFD700',
  heroTitle: 'Find Your Dream Car from Japan',
  heroSubtitle: 'Quality Japanese vehicles delivered to your doorstep worldwide',
  heroBackgroundUrl: '/hero-bg.jpg'
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  reviews: [],
  loading: true,
  refresh: async () => {}
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    try {
      // Try to load from API
      const response = await fetch('/api/super-admin/branding');
      if (response.ok) {
        const data = await response.json();
        if (data.branding) {
          setBranding(data.branding);
        }
        if (data.reviews) {
          setReviews(data.reviews.filter((r: CustomerReview) => r.isActive));
        }
      }
    } catch (error) {
      console.log('Using default branding settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, reviews, loading, refresh: loadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
