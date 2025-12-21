// Client shim for HQ provisioning: forward request to backend HQ provisioning endpoint
export default async function provisionTenant(reg: any) {
  const res = await fetch('/api/hq/tenants/provision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reg),
  });
  if (!res.ok) throw new Error('Provision request failed');
  const body = await res.json();
  return body;
}
