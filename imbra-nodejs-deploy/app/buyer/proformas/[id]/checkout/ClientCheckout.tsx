"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../utils/api';

type CheckoutSummary = {
  proforma: { id: string; number: string; currency: string; lineItemsJson?: { items: { name: string; amount: number }[] }; total: number; status: string };
  flags: { cardEnabled: boolean; paypalEnabled: boolean };
  warranty?: { selected: boolean; addedAmountUsd: number } | null;
  loyalty: { points: number; settings: { points_per_usd?: number; min_redeem_points?: number } };
};

export default function ClientCheckout() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeem, setRedeem] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/buyer/proformas/${id}/checkout`);
      setData(res.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (id) load(); }, [id]);

  const toggleWarranty = async () => {
    if (!data) return;
    setBusy(true);
    try {
      await api.post(`/buyer/proformas/${id}/warranty`, { selected: !(data.warranty?.selected) });
      await load();
    } finally { setBusy(false); }
  };

  const payCard = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/buyer/proformas/${id}/pay/card`, {});
      alert(`Card intent created: ${res.data.intentId}`);
    } catch (e: any) { alert(e?.response?.data?.error || 'Failed to create card intent'); }
    finally { setBusy(false); }
  };

  const payPaypal = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/buyer/proformas/${id}/pay/paypal`, {});
      const url = res.data.approvalUrl; if (url) window.location.href = url;
    } catch (e: any) { alert(e?.response?.data?.error || 'Failed to create PayPal intent'); }
    finally { setBusy(false); }
  };

  const doRedeem = async () => {
    const points = Number(redeem || 0);
    if (!points || points <= 0) return;
    setBusy(true);
    try {
      await api.post(`/buyer/proformas/${id}/redeem`, { points });
      setRedeem('');
      await load();
    } catch (e: any) { alert(e?.response?.data?.error || 'Failed to redeem'); }
    finally { setBusy(false); }
  };

  if (loading || !data) return <div className="p-6">Loading checkout…</div>;

  const items = data.proforma.lineItemsJson?.items || [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout — {data.proforma.number}</h1>
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-medium mb-2">Summary</h2>
        {/* ... rest of UI stays the same, omitted for brevity ... */}
      </div>
    </div>
  );
}