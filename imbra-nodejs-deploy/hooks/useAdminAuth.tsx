"use client";

import { useState, useEffect } from 'react';

export function useAdminAuth(tenantSlug?: string) {
  // Simple client-side guard that reads a mocked admin user from localStorage for now.
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(`admin:auth:${tenantSlug}`) || null;
      setRole(raw);
    } catch (e) {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  return { role, loading, isManagerOrOwner: role === 'owner' || role === 'manager' || role === 'admin' };
}
