'use client';

import React, { useEffect, useState } from 'react';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';

type RegistrationItem = {
  id: string;
  businessName?: string;
  companyName?: string;
  name?: string;
  email: string;
  phone?: string;
  country?: string;
  paymentProofUrl?: string;
  createdAt: string;
};

export default function HqRegistrationPendingPage() {
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { admin, refresh } = useHqAdminAuth();
  const [selected, setSelected] = useState<RegistrationItem | null>(null);

  useEffect(() => {
    refresh();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/hq/registration/pending');
        if (!res.ok) throw new Error('Not authorized');
        const body = await res.json();
        setItems(body.items || []);
        setError(null);
      } catch (e: unknown) {
        setItems([]);
        setError((e as Error)?.message || 'Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  async function approveItem(regId: string) {
    setActioning(regId);
    setError(null);
    try {
      const res = await fetch(`/api/hq/registration/${regId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Approve failed');
      setItems(prev => prev.filter(x => x.id !== regId));
    } catch (e: unknown) {
      setError((e as Error)?.message || 'Approve failed');
    } finally {
      setActioning(null);
    }
  }

  async function rejectItem(regId: string) {
    setActioning(regId);
    setError(null);
    try {
      const res = await fetch(`/api/hq/registration/${regId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Reject failed');
      setItems(prev => prev.filter(x => x.id !== regId));
    } catch (e: unknown) {
      setError((e as Error)?.message || 'Reject failed');
    } finally {
      setActioning(null);
    }
  }
  if (!admin) return <div className="text-gray-600">You are not authorized to view this page.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Registrations</h2>
      <div className="bg-white p-4 rounded shadow">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul className="space-y-3">
            {items.length === 0 ? (
              <li className="text-gray-600">No pending registrations</li>
            ) : (
              items.map((r) => (
                <li key={r.id} className="border p-3 rounded flex items-start justify-between">
                  <div>
                    <div className="font-medium">{r.businessName || r.companyName || r.name || r.email}</div>
                    <div className="text-sm text-gray-500">{r.email} • {r.phone}</div>
                    <div className="mt-2 text-sm text-gray-600">Submitted: {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button
                        disabled={actioning === r.id}
                        onClick={() => approveItem(r.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                      >
                        {actioning === r.id ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        disabled={actioning === r.id}
                        onClick={() => rejectItem(r.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                      >
                        {actioning === r.id ? 'Processing…' : 'Reject'}
                      </button>
                      <button
                        onClick={() => setSelected(r)}
                        className="px-3 py-2 bg-gray-200 rounded text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {/* Details modal */}
        {selected && (
          <div role="dialog" aria-modal="true" aria-label="Registration details" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Registration details</h3>
                <button onClick={() => setSelected(null)} className="px-2 py-1 text-sm text-gray-700">Close</button>
              </div>
              <div className="space-y-2">
                <div><strong>Company</strong>: {selected.businessName}</div>
                <div><strong>Contact</strong>: {selected.email} • {selected.phone}</div>
                <div><strong>Country</strong>: {selected.country}</div>
                {selected?.paymentProofUrl && (
                  <div><strong>Payment proof</strong>: <a href={selected.paymentProofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
