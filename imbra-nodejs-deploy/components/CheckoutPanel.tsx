"use client";
import { useEffect, useState } from 'react';
import api from '../utils/api';

type CheckoutSummary = { flags?: { cardEnabled?: boolean; paypalEnabled?: boolean }; proforma?: { total?: number }; warranty?: { selected?: boolean; addedAmountUsd?: number }; loyalty?: { points?: number } } | null;
export default function CheckoutPanel({ proformaId, slug }: { proformaId?: string; slug?: string }) {
  const [summary, setSummary] = useState<CheckoutSummary>(null);
  const [warrantySelected, setWarrantySelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!proformaId) return;
    api.get(`/api/buyers/proformas/${proformaId}/checkout`).then((r) => setSummary(r.data));
  }, [proformaId]);

  if (!proformaId) return null;
  if (!summary) return <div>Loading checkout…</div>;
  const flags = summary.flags ?? {} as { cardEnabled?: boolean; paypalEnabled?: boolean };
  const proforma = summary.proforma ?? { total: 0 } as { total?: number };
  const warranty = summary.warranty ?? { selected: false, addedAmountUsd: 0 } as { selected?: boolean; addedAmountUsd?: number };
  const loyalty = summary.loyalty ?? { points: 0 } as { points?: number };

  const toggleWarranty = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/buyers/proformas/${proformaId}/warranty`, { selected: !warrantySelected });
      setWarrantySelected(!warrantySelected);
      setSummary((s: CheckoutSummary) => ({ ...(s as any), proforma: res.data }));
      setMessage('Warranty updated');
    } catch (err: unknown) {
      let emsg = 'Failed to update warranty';
      if (err instanceof Error) emsg = err.message;
      else if (typeof err === 'object' && err && 'response' in err && (err as any).response?.data?.error) emsg = (err as any).response.data.error;
      setMessage('Failed to update warranty: ' + emsg);
    } finally {
      setLoading(false);
    }
  };

  const payCard = async () => {
    if (!flags?.cardEnabled) return setMessage('Card not enabled');
    setLoading(true);
    try {
      const res = await api.post(`/api/buyers/proformas/${proformaId}/pay/card`);
      setMessage('Payment intent created. Use SDK to confirm with clientSecret');
    } catch (err: unknown) {
      let emsg = 'Payment creation failed';
      if (err instanceof Error) emsg = err.message;
      else if (typeof err === 'object' && err && 'response' in err && (err as any).response?.data?.error) emsg = (err as any).response.data.error;
      setMessage('Payment creation failed: ' + emsg);
    } finally { setLoading(false); }
  };

  const payPaypal = async () => {
    if (!flags?.paypalEnabled) return setMessage('PayPal not enabled');
    setLoading(true);
    try {
      const res = await api.post(`/api/buyers/proformas/${proformaId}/pay/paypal`);
      if (res.data.approvalUrl) window.location.href = res.data.approvalUrl;
    } catch (err: unknown) {
      let emsg = 'Payment creation failed';
      if (err instanceof Error) emsg = err.message;
      else if (typeof err === 'object' && err && 'response' in err && (err as any).response?.data?.error) emsg = (err as any).response.data.error;
      setMessage('Payment creation failed: ' + emsg);
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-4 border rounded p-3">
      <div className="text-lg font-semibold">Checkout</div>
      <div className="mt-2">Total: <strong>${proforma?.total ?? 0}</strong></div>
      {loyalty && (
        <div className="mt-2 text-sm">Points: <strong>{loyalty.points}</strong></div>
      )}
      {flags && (
        <div className="mt-2">
          {flags.cardEnabled && <button onClick={payCard} className="p-2 bg-primary text-white mr-2">Pay with Card</button>}
          {flags.paypalEnabled && <button onClick={payPaypal} className="p-2 bg-yellow-500 text-black">Pay with PayPal</button>}
        </div>
      )}
      {warranty && (
        <div className="mt-2">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={warrantySelected || warranty.selected} onChange={toggleWarranty} /> Exporter Warranty (+${warranty.addedAmountUsd ?? 0})</label>
        </div>
      )}
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </div>
  );
}
