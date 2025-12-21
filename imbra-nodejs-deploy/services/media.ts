import { makeApiUrl } from '@/lib/config/api';

export async function ingestCarMedia(carId: string, urls: string[], token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const results: Array<{ url: string; ok: boolean; body?: any }> = [];
  for (const url of urls) {
    const res = await fetch(makeApiUrl(`/api/cars/${encodeURIComponent(carId)}/media/ingest`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ url })
    });
    let body: any = undefined;
    try { body = await res.json(); } catch {}
    results.push({ url, ok: res.ok, body });
  }
  return results;
}
