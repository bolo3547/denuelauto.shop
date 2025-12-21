import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface StockNumberSearchProps {
  onSearch: (stockNo: string) => void;
}

const StockNumberSearch: React.FC<StockNumberSearchProps> = ({ onSearch }) => {
  const [stockNo, setStockNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockNo.trim()) {
      onSearch(stockNo.trim());
    }
  };

  return (
    <div className="bg-blue-50 border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Search by Stock Number</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter stock number (e.g. ABC123)"
          value={stockNo}
          onChange={(e) => setStockNo(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          title="Search by stock number"
          aria-label="Search by stock number"
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
};

export default StockNumberSearch;
