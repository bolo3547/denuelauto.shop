// Lightweight helpers for frontend to call staff API endpoints
import { makeApiUrl } from '@/lib/config/api';

function authHeader() {
  try {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('staff_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (err) { return {}; }
}

export async function getStaffList() {
  const res = await fetch(makeApiUrl('/api/staff'), { headers: authHeader() as HeadersInit });
  if (!res.ok) return [];
  const data = await res.json();
  return data.staff || [];
}

export async function createStaff(payload: any) {
  const headers = { 'Content-Type': 'application/json', ...(authHeader() as HeadersInit) } as HeadersInit;
  const res = await fetch(makeApiUrl('/api/staff/register'), { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) return null;
  return await res.json();
}

export async function updateStaff(email: string, payload: any) {
  const headers = { 'Content-Type': 'application/json', ...(authHeader() as HeadersInit) } as HeadersInit;
  const res = await fetch(makeApiUrl(`/api/staff/${encodeURIComponent(email)}`), { method: 'PATCH', headers, body: JSON.stringify(payload) });
  if (!res.ok) return null;
  return await res.json();
}

export async function deleteStaff(email: string) {
  const res = await fetch(makeApiUrl(`/api/staff/${encodeURIComponent(email)}`), { method: 'DELETE', headers: authHeader() as HeadersInit });
  return res.ok;
}
