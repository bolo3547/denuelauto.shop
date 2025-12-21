import React, { useState } from 'react';
import { estimateTradeInValue } from '../utils/tradeInValuation';

const TradeInValuation: React.FC = () => {
  const [year, setYear] = useState(2020);
  const [mileageKm, setMileageKm] = useState(60000);
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Corolla');
  const [condition, setCondition] = useState('good');
  const value = estimateTradeInValue({ year, mileageKm, make, model, condition });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Trade-In Valuation</h3>
      <div className="mb-2">
        <label>Year:</label>
        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="ml-2 border px-2 py-1 rounded" title="Year" placeholder="Year" />
      </div>
      <div className="mb-2">
        <label>Mileage (km):</label>
        <input type="number" value={mileageKm} onChange={e => setMileageKm(Number(e.target.value))} className="ml-2 border px-2 py-1 rounded" title="Mileage" placeholder="Mileage in km" />
      </div>
      <div className="mb-2">
        <label>Make:</label>
        <input type="text" value={make} onChange={e => setMake(e.target.value)} className="ml-2 border px-2 py-1 rounded" title="Make" placeholder="Car make" />
      </div>
      <div className="mb-2">
        <label>Model:</label>
        <input type="text" value={model} onChange={e => setModel(e.target.value)} className="ml-2 border px-2 py-1 rounded" title="Model" placeholder="Car model" />
      </div>
      <div className="mb-2">
        <label>Condition:</label>
        <select value={condition} onChange={e => setCondition(e.target.value)} className="ml-2 border px-2 py-1 rounded" title="Condition">
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
      </div>
      <div className="mt-4 font-bold">Estimated Trade-In Value: <span className="text-green-600">${value}</span></div>
    </div>
  );
};

export default TradeInValuation;
