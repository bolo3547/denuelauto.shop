import React, { useState, useEffect } from 'react';
import BuyerAuth from './BuyerAuth';

interface CheckoutModalProps {
  carId?: string;
  tenantSlug?: string;
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ carId, tenantSlug, open, onClose }: CheckoutModalProps) {
  const [buyer, setBuyer] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [shippingCost, setShippingCost] = useState<number>(2000);
  const [shippingMode, setShippingMode] = useState<'fob' | 'cif'>('fob');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('buyerToken');
    const buyerData = localStorage.getItem('buyerData');
    if (token && buyerData) {
      try { setBuyer(JSON.parse(buyerData)); } catch { localStorage.removeItem('buyerToken'); localStorage.removeItem('buyerData'); }
    }
  }, [open]);

  const handleAuthSuccess = (data: any) => {
    setBuyer(data);
    setShowAuth(false);
  };

  const estimateShipping = (country: string) => {
    // Very simple estimator using country length for demonstration
    const cost = Math.max(500, country.length * 250);
    setShippingCost(cost);
  };

  const handleReserve = () => {
    if (!buyer) {
      setShowAuth(true); return;
    }
    // Simulate API call to reserve
    const reserves = JSON.parse(localStorage.getItem('reserves') || '[]');
    reserves.push({ id: Date.now().toString(), carId, tenantSlug, buyerId: buyer.id, depositAmount, shippingCost, shippingMode, notes, reservedAt: new Date().toISOString() });
    localStorage.setItem('reserves', JSON.stringify(reserves));
    alert('Reservation successful. We will contact you with next steps!');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Buy / Reserve Vehicle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        {!buyer && !showAuth && (
          <div className="bg-amber-100 border border-amber-200 p-4 rounded mb-4">
            <p className="text-amber-700">You must sign in or create an account to reserve or purchase this vehicle.</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Sign In / Register</button>
            </div>
          </div>
        )}

        {showAuth && (
          <BuyerAuth mode={'register'} onSuccess={handleAuthSuccess} onModeChange={() => {}} tenantSlug={tenantSlug || 'demo'} />
        )}

        {buyer && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Buyer: <strong>{buyer.firstName} {buyer.lastName}</strong> ({buyer.email})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Deposit Amount (USD)</label>
                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="w-full rounded border p-2" />
              </div>
              <div>
                <label className="text-sm text-gray-500">Shipping Mode</label>
                <select value={shippingMode} onChange={(e) => setShippingMode(e.target.value as any)} className="w-full rounded border p-2">
                  <option value="fob">FOB</option>
                  <option value="cif">CIF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Shipping Destination Country</label>
              <input placeholder="e.g. Japan" onBlur={(e) => estimateShipping(e.target.value)} className="w-full rounded border p-2" />
              <p className="text-sm text-gray-500 mt-2">Estimated shipping: <strong>${shippingCost.toLocaleString()}</strong></p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Notes for Seller</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded border p-2" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleReserve} className="flex-1 bg-emerald-600 text-white rounded py-2">Reserve / Buy</button>
              <button onClick={() => { window.print(); }} className="bg-gray-200 rounded py-2 px-3">Print Proforma</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
