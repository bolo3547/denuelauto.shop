"use client";

import { useEffect, useState } from "react";
import { makeApiUrl, apiFetch } from '@/lib/config/api';

type StaffPayload = {
  name: string;
  email: string;
  role: string;
};

const decodeToken = (token: string): StaffPayload | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return {
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('decode staff token', error);
    return null;
  }
};

export function useStaffAuth() {
  const [user, setUser] = useState<StaffPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('staff_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(decodeToken(token));
    setLoading(false);
  }, []);

  const logout = async () => {
    localStorage.removeItem('staff_token');
    setUser(null);
    try {
      await apiFetch('/api/staff/logout', { method: 'POST' });
    } catch (error) {
      console.error('staff logout request failed', error);
    }
    if (typeof window !== 'undefined') window.location.href = '/staff-login';
  };

  const loginWithToken = (token: string) => {
    localStorage.setItem('staff_token', token);
    const payload = decodeToken(token);
    setUser(payload);
  };

  return { user, loading, logout, loginWithToken };
}
