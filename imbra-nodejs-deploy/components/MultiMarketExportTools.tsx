import React, { useState } from 'react';
import { calculateShipping } from '../utils/shippingCalculator';

const ports = ['Dar es Salaam', 'Durban', 'Walvis Bay', 'Mombasa'];
const countries = ['Zambia', 'Zimbabwe', 'Botswana', 'Mozambique'];
const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'ZAR', symbol: 'R', rate: 18 },
  { code: 'ZMW', symbol: 'K', rate: 24 },
  { code: 'BWP', symbol: 'P', rate: 13 },
];
const carSizes = ['small', 'medium', 'large'] as const;
type CarSize = (typeof carSizes)[number];

export default function MultiMarketExportTools({ price = 10000 }) {
  const [port, setPort] = useState(ports[0]);
  const [country, setCountry] = useState(countries[0]);
  const [currency, setCurrency] = useState(currencies[0]);
  const [carSize, setCarSize] = useState<CarSize>(carSizes[1]);

  const shippingUSD = calculateShipping({ port, country, carSize });
  const totalUSD = price + shippingUSD;
  const totalLocal = Math.round(totalUSD * currency.rate);

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h3 className="font-semibold mb-2">Multi-Market Export Tools</h3>
      <div className="mb-2">
        <label htmlFor="port">Port of Delivery:</label>
        <select id="port" title="Port" value={port} onChange={e => setPort(e.target.value)} className="ml-2 border px-2 py-1 rounded">
          {ports.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label htmlFor="country">Destination Country:</label>
        <select id="country" title="Destination country" value={country} onChange={e => setCountry(e.target.value)} className="ml-2 border px-2 py-1 rounded">
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label htmlFor="currency">Currency:</label>
        <select id="currency" title="Currency" value={currency.code} onChange={e => setCurrency(currencies.find(cur => cur.code === e.target.value) || currencies[0])} className="ml-2 border px-2 py-1 rounded">
          {currencies.map(cur => <option key={cur.code} value={cur.code}>{cur.code} ({cur.symbol})</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label htmlFor="carSize">Car Size:</label>
        <select id="carSize" title="Car size" value={carSize} onChange={e => setCarSize(e.target.value as CarSize)} className="ml-2 border px-2 py-1 rounded">
          {carSizes.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>
      <div className="mt-4 font-bold">
        Shipping Cost: <span className="text-blue-600">${shippingUSD} USD</span>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <div>Total (USD): ${totalUSD}</div>
        <div>Total ({currency.code}): {currency.symbol}{totalLocal}</div>
      </div>
    </div>
  );
}
