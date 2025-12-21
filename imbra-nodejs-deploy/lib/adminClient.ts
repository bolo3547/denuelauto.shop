// Lightweight admin client helpers used by admin pages.
// These call the app API and fall back to simple mocks when unavailable.
import { makeApiUrl } from '@/lib/config/api';

type AdminStats = { totalCars: number; availableCars?: number; reservedCars?: number };

async function safeFetch<T = any>(path: string): Promise<T | null> {
  try {
    const res = await fetch(makeApiUrl(path));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const MOCK_STATS: AdminStats = { totalCars: 0, availableCars: 0, reservedCars: 0 };

export async function getAdminStats(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/stats`);
  return data ?? MOCK_STATS;
}

export async function getAdminCars(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/cars`);
  return data ?? [];
}

export async function updateAdminCar(tenantSlug: string, carId: string, payload: any) {
  try {
    const res = await fetch(makeApiUrl(`/api/t/${tenantSlug}/admin/cars/${carId}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAdminInquiries(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/inquiries`);
  return data ?? [];
}

export async function getAdminOrders(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/orders`);
  return data ?? [];
}

export async function getAdminCustomers(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/buyers`);
  return data ?? [];
}

export async function getAdminEmployees(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/employees`);
  return data ?? [];
}

export async function getBillingSummary(tenantSlug: string) {
  const data = await safeFetch(`/api/t/${tenantSlug}/admin/billing/summary`);
  return data ?? null;
}

export async function getHQPaymentInstructions() {
  const data = await safeFetch(`/api/hq/public/payment-instructions`);
  return data ?? null;
}

export async function getHQSupportInfo() {
  const data = await safeFetch(`/api/hq/public/support-info`);
  return data ?? null;
}
