import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHqAdminContext } from '@/contexts/HqAdminContext';
import { makeApiUrl, apiFetch } from '@/lib/config/api';

export interface HqAdmin {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  isActive?: boolean;
}

export default function useHqAdminAuth() {
  // use global context
  try {
    const ctx = useHqAdminContext();
    return ctx;
  } catch (e) {
    // If used outside provider, fallback to a minimal implementation (avoid crash in isolated components)
    const [admin, setAdmin] = [null, () => {}] as any;
    const [loading, setLoading] = [false, () => {}] as any;
    const [error, setError] = [null, () => {}] as any;
    const router = useRouter();
    const login = useCallback(async (email: string, password: string) => {
      const res = await apiFetch('/api/hq/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error('Login failed');
      const body = await res.json();
      if (body && body.admin) setAdmin(body.admin);
      router.push('/hq');
    }, [router]);
    const logout = useCallback(async () => {
      await apiFetch('/api/hq/auth/logout', { method: 'POST' });
      setAdmin(null);
      router.push('/hq/login');
    }, [router]);
    const refresh = useCallback(async () => {
      const res = await apiFetch('/api/hq/auth/me', { method: 'GET' });
      if (!res.ok) return null;
      const body = await res.json();
      setAdmin(body.admin);
      return body.admin;
    }, []);
    return { admin, loading, error, login, logout, refresh } as any;
  }
}
