'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { makeApiUrl, apiFetch } from '@/lib/config/api';

const SESSION_PREFIX = 'denuel_auto_buyer_session_';

export default function useBuyerAuth(tenantSlug?: string) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sessionKey = `${SESSION_PREFIX}${tenantSlug || 'global'}`;
  const isBrowser = typeof window !== 'undefined';

  const persistSession = (payload: any) => {
    if (!isBrowser) return;
    localStorage.setItem(sessionKey, JSON.stringify(payload));
  };

  const readSession = () => {
    if (!isBrowser) return null;
    const raw = localStorage.getItem(sessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(sessionKey);
      return null;
    }
  };

  const removeSession = () => {
    if (!isBrowser) return;
    localStorage.removeItem(sessionKey);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantSlug }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Login failed');
      }

      const sessionUser = body.user ?? body.buyer;
      if (!sessionUser) {
        throw new Error('Login response missing user profile');
      }

      setUser(sessionUser);
      persistSession(sessionUser);
      setError(null);
      return sessionUser;
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionKey, tenantSlug]);

  const register = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Register failed');
      }

      const sessionUser = body.user ?? body.buyer;
      if (!sessionUser) {
        throw new Error('Register response missing user profile');
      }

      setUser(sessionUser);
      persistSession(sessionUser);
      setError(null);
      return sessionUser;
    } catch (err: any) {
      setError(err?.message ?? 'Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/logout', { method: 'POST' });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error || 'Logout failed');
      }

      setUser(null);
      removeSession();
      setError(null);
      const loginPath = tenantSlug ? `/t/${tenantSlug}/auth/login` : '/';
      router.push(loginPath);
    } catch (err: any) {
      setError(err?.message ?? 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionKey, tenantSlug, router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const cached = readSession();
      if (cached) {
        setUser(cached);
        return cached;
      }

      const res = await apiFetch('/api/auth/me', { method: 'GET' });

      const body = await res.json();
      if (!res.ok || !body?.user) {
        removeSession();
        setUser(null);
        return null;
      }

      setUser(body.user);
      persistSession(body.user);
      setError(null);
      return body.user;
    } catch (err) {
      console.error('Failed to refresh auth', err);
      removeSession();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  return { user, loading, error, login, logout, register, refresh };
}
