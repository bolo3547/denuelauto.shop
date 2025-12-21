import React, { useState } from 'react';
import { calculateMonthlyPayment } from '../utils/financingCalculator';

interface Props {
  price: number;
}

const FinancingCalculator: React.FC<Props> = ({ price }) => {
  const [downPayment, setDownPayment] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(18);
  const [years, setYears] = useState<number>(3);
  const [errors, setErrors] = useState<{ downPayment?: string; interestRate?: string; years?: string }>({});

  // Calculate safely — protect against invalid inputs
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const safeDownPayment = clamp(Number(downPayment || 0), 0, price);
  const safeInterestRate = clamp(Number(interestRate || 0), 0, 100);
  const safeYears = Math.max(1, Math.floor(Number(years || 1)));

  const monthly = calculateMonthlyPayment({ price, downPayment: safeDownPayment, interestRate: safeInterestRate, years: safeYears });
  const principal = Math.max(0, price - safeDownPayment);
  const totalPaid = Number((monthly * safeYears * 12).toFixed(2));
  const totalInterest = Number((totalPaid - principal).toFixed(2));

  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Financing Calculator</h3>
      <div className="mb-2">
        <label htmlFor="downPayment">Down Payment:</label>
        <input
          id="downPayment"
          type="number"
          min={0}
          max={price}
          step={50}
          value={downPayment}
          onChange={e => {
            const val = Number(e.target.value || 0);
            if (val < 0) setErrors(err => ({ ...err, downPayment: 'Down payment cannot be negative' }));
            else if (val > price) setErrors(err => ({ ...err, downPayment: 'Down payment cannot be greater than car price' }));
            else setErrors(err => ({ ...err, downPayment: undefined }));
            setDownPayment(clamp(val, 0, price));
          }}
          onBlur={() => setDownPayment(clamp(downPayment, 0, price))}
          className="ml-2 border px-2 py-1 rounded"
          placeholder="Enter down payment"
          title="Down Payment"
          aria-describedby="downPayment-error"
        />
        <div id="downPayment-error" className="text-sm text-red-500 mt-1" aria-live="assertive">{errors.downPayment || ''}</div>
      </div>
      <div className="mb-2">
        <label htmlFor="interestRate">Interest Rate (%):</label>
        <input
          id="interestRate"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={interestRate}
          onChange={e => {
            const val = Number(e.target.value || 0);
            if (val < 0) setErrors(err => ({ ...err, interestRate: 'Interest rate cannot be negative' }));
            else if (val > 100) setErrors(err => ({ ...err, interestRate: 'Interest rate cannot exceed 100%' }));
            else setErrors(err => ({ ...err, interestRate: undefined }));
            setInterestRate(clamp(val, 0, 100));
          }}
          onBlur={() => setInterestRate(clamp(interestRate, 0, 100))}
          className="ml-2 border px-2 py-1 rounded"
          title="Interest Rate"
          placeholder="Enter interest rate"
          aria-describedby="interestRate-error"
        />
        <div id="interestRate-error" className="text-sm text-red-500 mt-1" aria-live="assertive">{errors.interestRate || ''}</div>
      </div>
      <div className="mb-2">
        <label htmlFor="years">Years:</label>
        <input
          id="years"
          type="number"
          min={1}
          max={30}
          step={1}
          value={years}
          onChange={e => {
            const val = Math.max(1, Math.floor(Number(e.target.value || 1)));
            setYears(clamp(val, 1, 30));
            setErrors(err => ({ ...err, years: undefined }));
          }}
          onBlur={() => setYears(clamp(years, 1, 30))}
          className="ml-2 border px-2 py-1 rounded"
          title="Years"
          placeholder="Enter number of years"
          aria-describedby="years-error"
        />
        <div id="years-error" className="text-sm text-red-500 mt-1" aria-live="assertive">{errors.years || ''}</div>
      </div>
      <div className="mt-4 font-bold">
        Monthly Payment: <span className="text-blue-600" aria-live="polite">{currency.format(Number(monthly || 0))}</span>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <div>Principal: {currency.format(principal)}</div>
        <div>Total Interest: {currency.format(totalInterest)}</div>
        <div>Total Paid: {currency.format(totalPaid)}</div>
      </div>
    </div>
  );
};

export default FinancingCalculator;
