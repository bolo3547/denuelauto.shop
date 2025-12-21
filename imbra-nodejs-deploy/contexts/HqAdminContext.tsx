'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { makeApiUrl, apiFetch } from '@/lib/config/api';

export interface HqAdmin {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  isActive?: boolean;
}

interface HqAdminContextValue {
  admin: HqAdmin | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<HqAdmin | null>;
  setAdmin: (admin: HqAdmin | null) => void;
}

const HqAdminContext = createContext<HqAdminContextValue | undefined>(undefined);

export const HqAdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<HqAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/hq/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
      const body = await res.json();
      setAdmin(body.admin);
      router.push('/hq');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setAdmin(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiFetch('/api/hq/auth/logout', { method: 'POST' });
      setAdmin(null);
      router.push('/hq/login');
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/hq/auth/me', { method: 'GET' });
      if (!res.ok) {
        setAdmin(null);
        setError('Not authenticated');
        return null;
      }
      const body = await res.json();
      setAdmin(body.admin);
      setError(null);
      return body.admin;
    } catch (e: any) {
      setAdmin(null);
      setError(e.message || 'Unable to refresh');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <HqAdminContext.Provider value={{ admin, loading, error, login, logout, refresh, setAdmin }}>
      {children}
    </HqAdminContext.Provider>
  );
};

export const useHqAdminContext = () => {
  const ctx = useContext(HqAdminContext);
  if (!ctx) throw new Error('useHqAdminContext must be used within HqAdminProvider');
  return ctx;
};

export default HqAdminProvider;
