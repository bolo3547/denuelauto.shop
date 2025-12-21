
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BuyerAuth from '../../components/BuyerAuth';
import { cars } from '../../lib/tenantMock';
import { makeApiUrl } from '@/lib/config/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { carId } = router.query;
  const [buyer, setBuyer] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [step, setStep] = useState<'summary' | 'payment' | 'confirm'>('summary');
  const [paymentMethod, setPaymentMethod] = useState('zanaco');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
      } catch (error) {
        console.error('Failed to load buyer session', error);
      }
      setShowAuth(true);
    };

    loadSession();
  }, []);

  const handleAuthSuccess = (buyerData: any) => {
    setBuyer(buyerData);
    setShowAuth(false);
  };

  if (showAuth) {
    return (
      <BuyerAuth
        mode="register"
        onSuccess={handleAuthSuccess}
        onModeChange={() => {}}
        tenantSlug={router.query.tenantSlug as string || ''}
      />
    );
  }

  if (!carId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Find car details
  const car = cars.find((c) => c.id === carId || c.stockNo === carId);
  if (!car) {
    return <div className="min-h-screen flex items-center justify-center">Car not found.</div>;
  }

  // Order summary step
  if (step === 'summary') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4">Order Summary</h1>
          <div className="flex gap-4 mb-4">
            <img src={car.images[0]} alt={car.make + ' ' + car.model} className="w-40 h-28 object-cover rounded" />
            <div>
              <div className="font-semibold text-lg">{car.year} {car.make} {car.model} {car.grade}</div>
              <div className="text-gray-600">Stock: {car.stockNo}</div>
              <div className="text-gray-600">Mileage: {car.mileage_km.toLocaleString()} km</div>
              <div className="text-gray-600">Color: {car.color}</div>
              <div className="text-gray-600">Location: {car.location}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-gray-700 font-medium">Price:</div>
            <div className="text-2xl font-bold text-blue-600 mb-2">USD {car.price_usd?.toLocaleString()}</div>
          </div>
          <div className="mb-4">
            <div className="text-gray-700 font-medium mb-1">Buyer:</div>
            <div className="text-gray-900">{buyer?.firstName} {buyer?.lastName}</div>
            <div className="text-gray-600">{buyer?.email}</div>
            <div className="text-gray-600">{buyer?.phone}</div>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition mb-2"
            onClick={() => setStep('payment')}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  }

  // Payment step
  if (step === 'payment') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4">Payment Method</h1>
          <div className="mb-6">
            <div className="mb-2 font-medium">Select payment method:</div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="zanaco" checked={paymentMethod === 'zanaco'} onChange={() => setPaymentMethod('zanaco')} />
                <span>ZANACO (Bank)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="fnb" checked={paymentMethod === 'fnb'} onChange={() => setPaymentMethod('fnb')} />
                <span>FNB (Bank)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="airtel" checked={paymentMethod === 'airtel'} onChange={() => setPaymentMethod('airtel')} />
                <span>Airtel Money</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="mtn" checked={paymentMethod === 'mtn'} onChange={() => setPaymentMethod('mtn')} />
                <span>MTN Mobile Money</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="zamtel" checked={paymentMethod === 'zamtel'} onChange={() => setPaymentMethod('zamtel')} />
                <span>Zamtel Money</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" value="zedmobile" checked={paymentMethod === 'zedmobile'} onChange={() => setPaymentMethod('zedmobile')} />
                <span>Zed Mobile</span>
              </label>
            </div>
          </div>
          <button
            className="w-full bg-emerald-600 text-white py-3 rounded font-semibold hover:bg-emerald-700 transition mb-2"
            onClick={() => setStep('confirm')}
          >
            Review & Confirm
          </button>
          <button
            className="w-full bg-gray-200 text-gray-700 py-2 rounded font-medium mt-2"
            onClick={() => setStep('summary')}
          >
            Back to Summary
          </button>
        </div>
      </div>
    );
  }

  // Confirmation step
  if (step === 'confirm') {
    const handlePlaceOrder = async () => {
      setIsProcessing(true);
      try {
        const res = await fetch(makeApiUrl('/api/pay'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            provider: paymentMethod,
            amount: car.price_usd,
            buyer,
            car: {
              id: car.id,
              stockNo: car.stockNo,
              make: car.make,
              model: car.model,
              year: car.year,
            },
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setOrderSuccess(true);
        } else {
          alert(data.error || 'Payment failed.');
        }
      } catch (e) {
        alert('Payment error.');
      }
      setIsProcessing(false);
    };
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4">Confirm Your Order</h1>
          <div className="mb-4">
            <div className="font-semibold">Car:</div>
            <div>{car.year} {car.make} {car.model} {car.grade} (Stock: {car.stockNo})</div>
            <div className="text-blue-600 font-bold text-xl">USD {car.price_usd?.toLocaleString()}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Buyer:</div>
            <div>{buyer?.firstName} {buyer?.lastName}</div>
            <div>{buyer?.email}</div>
            <div>{buyer?.phone}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Payment Method:</div>
            <div className="capitalize">{paymentMethod}</div>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition mb-2"
            disabled={isProcessing}
            onClick={handlePlaceOrder}
          >
            {isProcessing ? 'Processing...' : 'Confirm & Place Order'}
          </button>
          <button
            className="w-full bg-gray-200 text-gray-700 py-2 rounded font-medium mt-2"
            onClick={() => setStep('payment')}
            disabled={isProcessing}
          >
            Back to Payment
          </button>
        </div>
      </div>
    );
  }

  // Order success
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-emerald-600">Order Placed Successfully!</h1>
          <p className="mb-4">Thank you for your purchase. Our sales team will contact you soon to finalize the process and arrange delivery.</p>
          <div className="mb-6">
            <div className="font-semibold">Order Details:</div>
            <div>{car.year} {car.make} {car.model} {car.grade} (Stock: {car.stockNo})</div>
            <div className="text-blue-600 font-bold text-xl">USD {car.price_usd?.toLocaleString()}</div>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
