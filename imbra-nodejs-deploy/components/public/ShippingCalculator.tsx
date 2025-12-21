import React, { useState } from 'react';

const ShippingCalculator: React.FC = () => {
  const [weight, setWeight] = useState(1000);
  const [distance, setDistance] = useState(5000);
  const [cost, setCost] = useState<number | null>(null);

  // Dummy calculation: cost = weight * distance * rate
  const rate = 0.0002;

  const handleCalculate = () => {
    setCost(weight * distance * rate);
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="font-bold mb-2">Shipping Cost Calculator</h3>
      <div className="flex gap-2 mb-2">
        <input type="number" value={weight} min={0} onChange={e => setWeight(Number(e.target.value))} className="border px-2 py-1 rounded w-24" placeholder="Weight (kg)" />
        <input type="number" value={distance} min={0} onChange={e => setDistance(Number(e.target.value))} className="border px-2 py-1 rounded w-24" placeholder="Distance (km)" />
        <button onClick={handleCalculate} className="bg-green-600 text-white px-3 py-1 rounded">Calculate</button>
      </div>
      {cost !== null && (
        <div className="mt-2 font-semibold">Estimated Cost: ${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      )}
    </div>
  );
};

export default ShippingCalculator;
