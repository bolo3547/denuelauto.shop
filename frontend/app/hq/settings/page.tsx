'use client';

import React, { useEffect, useState } from 'react';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';

export default function HqSupportSettingsPage() {
  const { admin } = useHqAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ownerName: '', supportEmail: '', primaryPhone: '', secondaryPhone: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/hq/support-settings', { credentials: 'same-origin' })
      .then(r => { if (!r.ok) throw r; return r.json(); })
      .then(j => { if (!mounted) return; if (j) setForm({ ownerName: j.ownerName || '', supportEmail: j.supportEmail || '', primaryPhone: j.primaryPhone || '', secondaryPhone: j.secondaryPhone || '' }); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/hq/support-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'same-origin' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to save');
      }
      await res.json();
      alert('Support settings updated');
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message || 'Save failed');
      } else {
        setError('Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return <div>Please sign in to access HQ settings.</div>;
  if (admin.role !== 'SUPER_ADMIN') return <div>Only SUPER_ADMIN can edit these settings.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Owner & Support Contacts</h1>
      <div className="bg-white rounded-lg p-6 shadow">
        {loading ? <div>Loading…</div> : (
          <div className="space-y-4">
            <div>
                <label htmlFor="owner-name" className="block text-sm">Owner name</label>
                <input
                  id="owner-name"
                  className="mt-1 w-full border rounded p-2"
                  value={form.ownerName}
                  onChange={e => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Enter owner name"
                  title="Owner name"
                />
            </div>
            <div>
                <label htmlFor="support-email" className="block text-sm">Support email</label>
                <input
                  id="support-email"
                  className="mt-1 w-full border rounded p-2"
                  value={form.supportEmail}
                  onChange={e => setForm({ ...form, supportEmail: e.target.value })}
                  placeholder="Enter support email"
                  title="Support email"
                />
            </div>
            <div>
                <label htmlFor="primary-phone" className="block text-sm">Primary phone</label>
                <input
                  id="primary-phone"
                  className="mt-1 w-full border rounded p-2"
                  value={form.primaryPhone}
                  onChange={e => setForm({ ...form, primaryPhone: e.target.value })}
                  placeholder="Enter primary phone"
                  title="Primary phone"
                />
            </div>
            <div>
                <label htmlFor="secondary-phone" className="block text-sm">Secondary phone</label>
                <input
                  id="secondary-phone"
                  className="mt-1 w-full border rounded p-2"
                  value={form.secondaryPhone}
                  onChange={e => setForm({ ...form, secondaryPhone: e.target.value })}
                  placeholder="Enter secondary phone"
                  title="Secondary phone"
                />
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
