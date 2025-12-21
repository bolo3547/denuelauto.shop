// Billing and HQ helpers for frontend

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getBillingSummary(tenantSlug: string) {
  const data = await safeFetchJson(`/api/t/${tenantSlug}/admin/billing/summary`);
  return data;
}

export async function getHQPaymentInstructions() {
  const data = await safeFetchJson(`/api/hq/public/payment-instructions`);
  return data;
}

export async function getHQSupportInfo() {
  const data = await safeFetchJson(`/api/hq/public/support-info`);
  return data;
}
