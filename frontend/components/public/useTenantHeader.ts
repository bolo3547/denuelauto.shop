// Client-side hook to fetch tenant header information
// This hook fetches from the real API endpoint and falls back to defaults on failure.

import { useEffect, useState } from 'react';

export type TenantHeaderInfo = {
  name: string;
  tenantSlug?: string;
  logoUrl?: string;
  theme?: {
    primary?: string;
    accent?: string;
    surface?: string;
    text?: string;
  };
  supportPhone?: string;
  availableCountries?: string[];
  defaultCountry?: string;
  currencies?: string[];
};

// NOTE: This is a client-side hook - it uses fetch and local state.
// Calls the real endpoint: /api/t/:tenantSlug/public/theme (with fallback defaults)
export default function useTenantHeader(tenantSlug?: string, initialTenant?: TenantHeaderInfo) {
  const [tenant, setTenant] = useState<TenantHeaderInfo | null>(initialTenant ?? null);
  const [loading, setLoading] = useState<boolean>(!initialTenant);
  useEffect(() => {
    if (!tenantSlug) {
      // fallback sample tenant info (BE FORWARD-like defaults)
      setTenant({
        name: 'DENUEL AUTO',
        tenantSlug: 'denuel-auto',
        logoUrl: '/logo.png',
        theme: {
          primary: '#000000',
          accent: '#ff7a00',
          surface: '#ffffff',
          text: '#0f172a',
        },
        supportPhone: '+441234567890',
        availableCountries: ['US', 'UK', 'JP'],
        defaultCountry: 'US',
        currencies: ['USD', 'GBP', 'JPY'],
      });
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchTenant() {
      try {
        const res = await fetch(`/api/t/${tenantSlug}/public/theme`);
        if (!res.ok) throw new Error('Tenant fetch failed');
        const data = await res.json();
        if (!cancelled) {
          setTenant(data);
          setLoading(false);
        }
      } catch (err) {
        // fallback - set defaults
        if (!cancelled) {
          setTenant({
            name: 'DENUEL AUTO',
            tenantSlug,
            logoUrl: '/logo.png',
            theme: {
              primary: '#000000',
              accent: '#ff7a00',
              surface: '#ffffff',
              text: '#0f172a',
            },
            supportPhone: '+441234567890',
            availableCountries: ['US', 'UK', 'JP'],
            defaultCountry: 'US',
            currencies: ['USD', 'GBP', 'JPY'],
          });
          setLoading(false);
        }
      }
    }
    fetchTenant();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  return { tenant, loading };
}
