import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Transaction {
  id: string;
  customer: string;
  type: 'sale' | 'payment' | 'refund' | 'deposit';
  amount: number;
  method: 'cash' | 'card' | 'bank' | 'mobile';
  reference: string;
  status: 'completed' | 'pending' | 'voided';
  timestamp: string;
  cashier: string;
}

interface CashRegister {
  openingBalance: number;
  currentBalance: number;
  totalSales: number;
  totalPayments: number;
  totalRefunds: number;
  transactionCount: number;
}

export default function CashierPortal() {
  const [activeTab, setActiveTab] = useState('pos');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setRegister({
      openingBalance: 500,
      currentBalance: 12450,
      totalSales: 15200,
      totalPayments: 8500,
      totalRefunds: 250,
      transactionCount: 23
    });

    setTransactions([
      { id: 'TXN001', customer: 'John Smith', type: 'sale', amount: 3500, method: 'card', reference: 'INV-2024-001', status: 'completed', timestamp: '2024-12-10 14:30', cashier: 'Sarah' },
      { id: 'TXN002', customer: 'Mary Johnson', type: 'payment', amount: 5000, method: 'cash', reference: 'PAY-2024-015', status: 'completed', timestamp: '2024-12-10 13:45', cashier: 'Sarah' },
      { id: 'TXN003', customer: 'Robert Davis', type: 'deposit', amount: 2000, method: 'bank', reference: 'DEP-2024-008', status: 'completed', timestamp: '2024-12-10 12:20', cashier: 'Sarah' },
      { id: 'TXN004', customer: 'Emma Wilson', type: 'refund', amount: 250, method: 'cash', reference: 'REF-2024-003', status: 'completed', timestamp: '2024-12-10 11:15', cashier: 'Sarah' },
      { id: 'TXN005', customer: 'Michael Brown', type: 'sale', amount: 4700, method: 'mobile', reference: 'INV-2024-002', status: 'pending', timestamp: '2024-12-10 10:30', cashier: 'Sarah' },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const tabs = [
    { id: 'pos', label: 'POS', icon: '💵' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
    { id: 'receipts', label: 'Receipts', icon: '🧾' },
    { id: 'daily-report', label: 'Daily Report', icon: '📊' },
    { id: 'reconciliation', label: 'Reconciliation', icon: '✅' },
    { id: 'customers', label: 'Customer Payments', icon: '👥' },
  ];

  return (
    <>
      <Head>
        <title>Cashier Portal | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-xl">💵</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Cashier Portal</h1>
                  <p className="text-slate-400 text-xs">Point of Sale & Payments</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Register Balance</p>
                  <p className="text-green-400 font-bold">{register && formatCurrency(register.currentBalance)}</p>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                  New Transaction
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* POS Tab */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition"
                  >
                    <span className="text-3xl mb-2 block">💵</span>
                    <span className="font-bold">Cash Payment</span>
                  </button>
                  <button className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition">
                    <span className="text-3xl mb-2 block">💳</span>
                    <span className="font-bold">Card Payment</span>
                  </button>
                  <button className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition">
                    <span className="text-3xl mb-2 block">📱</span>
                    <span className="font-bold">Mobile Money</span>
                  </button>
                  <button className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white hover:from-amber-600 hover:to-amber-700 transition">
                    <span className="text-3xl mb-2 block">🏦</span>
                    <span className="font-bold">Bank Transfer</span>
                  </button>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Quick Sale</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Customer</label>
                      <label htmlFor="customer-select" className="block text-slate-400 text-sm mb-2">Customer</label>
                      <select
                        id="customer-select"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        aria-label="Customer"
                      >
                        <option>Walk-in Customer</option>
                        <option>John Smith</option>
                        <option>Mary Johnson</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="reference-input" className="block text-slate-400 text-sm mb-2">Reference/Invoice</label>
                      <input 
                        id="reference-input"
                        type="text" 
                        placeholder="INV-2024-XXX"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="amount-input" className="block text-slate-400 text-sm mb-2">Amount</label>
                      <input 
                        id="amount-input"
                        type="number" 
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-2xl font-bold focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Payment Method</label>
                      <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        <option>Cash</option>
                        <option>Card</option>
                        <option>Mobile Money</option>
                        <option>Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
                    Process Payment
                  </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-bold">Recent Transactions</h3>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {transactions.slice(0, 5).map((txn) => (
                      <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            txn.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                            txn.type === 'payment' ? 'bg-blue-500/20 text-blue-400' :
                            txn.type === 'refund' ? 'bg-red-500/20 text-red-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {txn.type === 'sale' ? '🛒' : txn.type === 'payment' ? '💵' : txn.type === 'refund' ? '↩️' : '💰'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{txn.customer}</p>
                            <p className="text-slate-400 text-xs">{txn.reference} • {txn.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${txn.type === 'refund' ? 'text-red-400' : 'text-green-400'}`}>
                            {txn.type === 'refund' ? '-' : '+'}{formatCurrency(txn.amount)}
                          </p>
                          <p className="text-slate-400 text-xs">{txn.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Register Summary */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Register Summary</h3>
                  {register && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                        <p className="text-slate-400 text-sm">Current Balance</p>
                        <p className="text-green-400 text-3xl font-bold">{formatCurrency(register.currentBalance)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-slate-400 text-xs">Opening</p>
                          <p className="text-white font-bold">{formatCurrency(register.openingBalance)}</p>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-slate-400 text-xs">Transactions</p>
                          <p className="text-white font-bold">{register.transactionCount}</p>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-slate-400 text-xs">Total Sales</p>
                          <p className="text-green-400 font-bold">{formatCurrency(register.totalSales)}</p>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-slate-400 text-xs">Refunds</p>
                          <p className="text-red-400 font-bold">-{formatCurrency(register.totalRefunds)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-left transition flex items-center gap-3">
                      <span>🧾</span> Print Last Receipt
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-left transition flex items-center gap-3">
                      <span>📊</span> Daily Report
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-left transition flex items-center gap-3">
                      <span>💰</span> Cash Count
                    </button>
                    <button className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-left transition flex items-center gap-3">
                      <span>🔒</span> Close Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Transactions</h3>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Types</option>
                    <option>Sale</option>
                    <option>Payment</option>
                    <option>Refund</option>
                    <option>Deposit</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Reference</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Customer</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Type</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Method</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Amount</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-white text-sm font-mono">{txn.reference}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{txn.customer}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          txn.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                          txn.type === 'payment' ? 'bg-blue-500/20 text-blue-400' :
                          txn.type === 'refund' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm capitalize">{txn.method}</td>
                      <td className={`px-4 py-3 font-bold ${txn.type === 'refund' ? 'text-red-400' : 'text-green-400'}`}>
                        {txn.type === 'refund' ? '-' : ''}{formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{txn.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">Recent Receipts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.filter(t => t.status === 'completed').map((txn) => (
                  <div key={txn.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-mono text-sm">{txn.reference}</p>
                        <p className="text-slate-400 text-xs">{txn.timestamp}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        txn.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                        txn.type === 'payment' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {txn.type}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{txn.customer}</p>
                    <p className="text-green-400 text-xl font-bold mb-3">{formatCurrency(txn.amount)}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm">
                        View
                      </button>
                      <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Report Tab */}
          {activeTab === 'daily-report' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💵</span>
                    <span className="text-slate-400 text-sm">Total Cash</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(8500)}</p>
                  <p className="text-green-400 text-xs mt-1">12 transactions</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💳</span>
                    <span className="text-slate-400 text-sm">Total Card</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(4200)}</p>
                  <p className="text-blue-400 text-xs mt-1">6 transactions</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📱</span>
                    <span className="text-slate-400 text-sm">Mobile Money</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(2500)}</p>
                  <p className="text-purple-400 text-xs mt-1">4 transactions</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">↩️</span>
                    <span className="text-slate-400 text-sm">Total Refunds</span>
                  </div>
                  <p className="text-red-400 text-2xl font-bold">-{formatCurrency(250)}</p>
                  <p className="text-slate-400 text-xs mt-1">1 transaction</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Daily Summary - {new Date().toLocaleDateString()}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Opening Balance</span>
                    <span className="text-white">{formatCurrency(500)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Total Sales</span>
                    <span className="text-green-400">+{formatCurrency(15200)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Total Payments Received</span>
                    <span className="text-blue-400">+{formatCurrency(8500)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Total Refunds</span>
                    <span className="text-red-400">-{formatCurrency(250)}</span>
                  </div>
                  <div className="flex justify-between py-2 pt-4 border-t-2 border-slate-600">
                    <span className="text-white font-bold">Expected Balance</span>
                    <span className="text-green-400 font-bold text-xl">{formatCurrency(23950)}</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
                  Print Daily Report
                </button>
              </div>
            </div>
          )}

          {/* Reconciliation Tab */}
          {activeTab === 'reconciliation' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">Cash Reconciliation</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-slate-300 font-medium">Count Cash</h4>
                  {[100, 50, 20, 10, 5, 1].map((denomination) => (
                    <div key={denomination} className="flex items-center gap-4">
                      <span className="text-white w-16">${denomination}</span>
                      <span className="text-slate-400">×</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                      <span className="text-green-400 w-24 text-right">{formatCurrency(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-4">Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Cash</span>
                      <span className="text-white">{formatCurrency(12450)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Counted Cash</span>
                      <span className="text-white">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-600">
                      <span className="text-slate-400">Difference</span>
                      <span className="text-green-400">{formatCurrency(0)}</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
                    Submit Reconciliation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Payments Tab */}
          {activeTab === 'customers' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-bold">Customer Payment History</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search customer..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-3">
                  {['John Smith', 'Mary Johnson', 'Robert Davis'].map((customer, idx) => (
                    <div key={idx} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{customer}</p>
                        <span className="text-green-400 font-bold">{formatCurrency(Math.random() * 10000 + 1000)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Last Payment: 2 days ago</span>
                        <span className="text-slate-400">{Math.floor(Math.random() * 10) + 1} transactions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
