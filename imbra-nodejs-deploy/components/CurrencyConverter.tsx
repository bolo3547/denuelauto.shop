import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaCalculator, FaTruck, FaCoins } from 'react-icons/fa';

interface CurrencyConverterProps {
  className?: string;
}

export default function CurrencyConverter({ className = '' }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('10000');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('JPY');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Mock exchange rates (in real app, fetch from API)
  const exchangeRates: { [key: string]: { [key: string]: number } } = {
    USD: { JPY: 150, EUR: 0.85, GBP: 0.73, ZAR: 18.5 },
    JPY: { USD: 0.0067, EUR: 0.0057, GBP: 0.0049, ZAR: 0.12 },
    EUR: { USD: 1.18, JPY: 176, GBP: 0.86, ZAR: 21.8 },
    GBP: { USD: 1.37, JPY: 205, EUR: 1.16, ZAR: 25.3 },
    ZAR: { USD: 0.054, JPY: 8.1, EUR: 0.046, GBP: 0.039 }
  };

  useEffect(() => {
    if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
      const rate = exchangeRates[fromCurrency][toCurrency];
      setExchangeRate(rate);
      const converted = parseFloat(amount) * rate;
      setConvertedAmount(converted);
    }
  }, [amount, fromCurrency, toCurrency]);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaExchangeAlt className="text-blue-600" />
        <h3 className="text-lg font-semibold">Currency Converter</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {convertedAmount !== null && exchangeRate !== null && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">
              Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </div>
            <div className="text-xl font-bold text-blue-600">
              {currencies.find(c => c.code === toCurrency)?.symbol}
              {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: Today
            </div>
          </div>
        )}
      </div>
    </div>
  );
}