import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BuyerAuth from '../../components/BuyerAuth';
import { makeApiUrl } from '@/lib/config/api';

type Buyer = {
  id: string;
  firstName: string;
  lastName: string;
  // Add other fields as needed
};

type ReserveData = {
  id: string;
  carId: string | string[] | undefined;
  tenantSlug: string | string[] | undefined;
  buyerId: string;
  reservedAt: string;
  depositAmount: number;
  shippingMode: string;
};

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const { carId, tenantSlug } = router.query;
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [reserveData, setReserveData] = useState<ReserveData | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [shippingMode, setShippingMode] = useState<string>('fob');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(makeApiUrl('/api/auth/me'), { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setBuyer(data.user);
            setShowAuth(false);
            return;
          }
        }
        setShowAuth(true);
      } catch (error) {
        console.error('Failed to load buyer session', error);
        setShowAuth(true);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);


  const handleReserve = async () => {
    if (!buyer) { setShowAuth(true); return; }
    const reserves = JSON.parse(localStorage.getItem('reserves') || '[]');
    reserves.push({
      id: Date.now().toString(),
      carId,
      tenantSlug,
      buyerId: buyer.id,
      reservedAt: new Date().toISOString(),
      depositAmount,
      shippingMode,
    });
    localStorage.setItem('reserves', JSON.stringify(reserves));
    setReserveData(reserves[reserves.length - 1]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Head>
        <title>Checkout - Buyer</title>
      </Head>

      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {!buyer && (
          <div className="bg-amber-100 border border-amber-200 p-4 rounded mb-4">
            <p className="text-amber-700">You must sign in or create an account to reserve or buy this vehicle.</p>
            <div className="mt-3">
              <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Sign In / Register</button>
            </div>
          </div>
        )}

        {showAuth && (
          <BuyerAuth
            mode={'register'}
            onSuccess={(data) => {
              // Cast or validate as Buyer
              const buyer = data as Buyer;
              setBuyer(buyer);
              setShowAuth(false);
            }}
            onModeChange={() => {}}
            tenantSlug={String(tenantSlug || 'demo')}
          />
        )}

        {buyer && !reserveData && (
          <div className="space-y-4">
            <div>
              <p>Car ID: <strong>{carId}</strong></p>
              <p>Buyer: <strong>{buyer.firstName} {buyer.lastName}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="deposit-amount" className="text-sm">Deposit Amount (USD)</label>
                <input
                  id="deposit-amount"
                  className="w-full p-2 border rounded"
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  placeholder="Enter deposit amount"
                  title="Deposit Amount (USD)"
                />
              </div>
              <div>
                <label htmlFor="shipping-mode" className="text-sm">Shipping Mode</label>
                <select
                  id="shipping-mode"
                  className="w-full p-2 border rounded"
                  title="Shipping Mode"
                  value={shippingMode}
                  onChange={e => setShippingMode(e.target.value)}
                >
                  <option value="fob">FOB</option>
                  <option value="cif">CIF</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleReserve} className="bg-emerald-600 text-white px-4 py-2 rounded">Reserve Vehicle</button>
            </div>
          </div>
        )}

        {reserveData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded mt-4">
            <h2 className="text-lg font-medium">Reservation Confirmed</h2>
            <p className="text-sm text-gray-700">Your reservation was created on {new Date(reserveData.reservedAt).toLocaleString()}.</p>
            <p className="text-sm text-gray-700">Reference: <strong>{reserveData.id}</strong></p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push('/buyer/dashboard')} className="bg-blue-600 text-white px-4 py-2 rounded">Go to Dashboard</button>
              <button onClick={() => router.push('/')} className="bg-gray-200 px-4 py-2 rounded">Back to Listings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
