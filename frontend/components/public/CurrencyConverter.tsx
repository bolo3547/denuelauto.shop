import React, { useState } from 'react';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('JPY');
  const [result, setResult] = useState<number | null>(null);

  // Dummy rates for demo
  const rates: Record<string, number> = {
    'USD_JPY': 145.2,
    'JPY_USD': 0.0069,
  };

  const handleConvert = () => {
    const key = `${from}_${to}`;
    const rate = rates[key] || 1;
    setResult(amount * rate);
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="font-bold mb-2">Currency Converter</h3>
      <div className="flex gap-2 mb-2">
        <input type="number" value={amount} min={0} onChange={e => setAmount(Number(e.target.value))} className="border px-2 py-1 rounded w-24" />
        <select value={from} onChange={e => setFrom(e.target.value)} className="border px-2 py-1 rounded">
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
        </select>
        <span className="mx-2">to</span>
        <select value={to} onChange={e => setTo(e.target.value)} className="border px-2 py-1 rounded">
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
        </select>
        <button onClick={handleConvert} className="bg-blue-600 text-white px-3 py-1 rounded">Convert</button>
      </div>
      {result !== null && (
        <div className="mt-2 font-semibold">Result: {result.toLocaleString()} {to}</div>
      )}
    </div>
  );
};

export default CurrencyConverter;
