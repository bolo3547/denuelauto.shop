import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNo: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor: string;
}

export default function AccountingPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setInvoices([
      { id: '1', invoiceNo: 'INV-001', customer: 'John Smith', amount: 25000, status: 'paid', date: '2024-12-01', dueDate: '2024-12-15' },
      { id: '2', invoiceNo: 'INV-002', customer: 'ABC Company', amount: 45000, status: 'pending', date: '2024-12-05', dueDate: '2024-12-20' },
      { id: '3', invoiceNo: 'INV-003', customer: 'Mary Johnson', amount: 18500, status: 'overdue', date: '2024-11-15', dueDate: '2024-11-30' },
      { id: '4', invoiceNo: 'INV-004', customer: 'Tech Corp', amount: 67000, status: 'paid', date: '2024-12-02', dueDate: '2024-12-16' },
    ]);

    setExpenses([
      { id: '1', description: 'Office Supplies', category: 'Operations', amount: 350, date: '2024-12-05', vendor: 'Office Mart' },
      { id: '2', description: 'Vehicle Transport', category: 'Logistics', amount: 1200, date: '2024-12-04', vendor: 'Fast Logistics' },
      { id: '3', description: 'Marketing Ads', category: 'Marketing', amount: 2500, date: '2024-12-03', vendor: 'Google Ads' },
      { id: '4', description: 'Utility Bills', category: 'Utilities', amount: 800, date: '2024-12-01', vendor: 'ZESCO' },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'revenue', label: 'Revenue Reports', icon: '📈' },
    { id: 'tax', label: 'Tax Documents', icon: '📋' },
    { id: 'payroll', label: 'Payroll', icon: '💰' },
    { id: 'reconciliation', label: 'Bank Reconciliation', icon: '🏦' },
  ];

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <Head>
        <title>Accounting | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Accounting Portal</h1>
                  <p className="text-slate-400 text-xs">Finance & Reports</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
                + New Invoice
              </button>
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
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-slate-400 text-sm">Total Revenue</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-green-400 text-xs mt-1">+12% from last month</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⏳</span>
                    <span className="text-slate-400 text-sm">Pending</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
                  <p className="text-yellow-400 text-xs mt-1">{invoices.filter(i => i.status === 'pending').length} invoices</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💸</span>
                    <span className="text-slate-400 text-sm">Total Expenses</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-red-400 text-xs mt-1">-5% from last month</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📈</span>
                    <span className="text-slate-400 text-sm">Net Profit</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(totalRevenue - totalExpenses)}</p>
                  <p className="text-green-400 text-xs mt-1">+18% from last month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 4).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{invoice.invoiceNo}</p>
                          <p className="text-slate-400 text-xs">{invoice.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatCurrency(invoice.amount)}</p>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Expenses</h3>
                  <div className="space-y-3">
                    {expenses.slice(0, 4).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{expense.description}</p>
                          <p className="text-slate-400 text-xs">{expense.category} • {expense.vendor}</p>
                        </div>
                        <p className="text-red-400 font-medium">-{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Invoices</h3>
                <div className="flex gap-2">
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Status</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                  <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                    + Create Invoice
                  </button>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Invoice #</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Customer</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Amount</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Date</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Due Date</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-white font-medium">{invoice.invoiceNo}</td>
                      <td className="px-4 py-3 text-slate-300">{invoice.customer}</td>
                      <td className="px-4 py-3 text-white font-medium">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3 text-slate-400">{invoice.date}</td>
                      <td className="px-4 py-3 text-slate-400">{invoice.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Print</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Expenses</h3>
                <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                  + Add Expense
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Description</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Category</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Vendor</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Date</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Amount</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-white">{expense.description}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{expense.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{expense.vendor}</td>
                      <td className="px-4 py-3 text-slate-400">{expense.date}</td>
                      <td className="px-4 py-3 text-red-400 font-medium">-{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Revenue Reports Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Revenue Overview</h3>
                <div className="h-64 flex items-center justify-center border border-slate-700 rounded-lg">
                  <p className="text-slate-400">Revenue Chart Placeholder</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">This Month</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(92000)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">This Quarter</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(285000)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">This Year</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(1250000)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tax Documents Tab */}
          {activeTab === 'tax' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">Tax Documents</h3>
              <div className="space-y-3">
                {[
                  { name: 'Q4 2024 Tax Report', date: 'Dec 31, 2024', size: '2.4 MB' },
                  { name: 'Q3 2024 Tax Report', date: 'Sep 30, 2024', size: '2.1 MB' },
                  { name: 'Annual Tax Summary 2023', date: 'Jan 15, 2024', size: '5.8 MB' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-slate-400 text-xs">{doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold">Payroll Management</h3>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                  Run Payroll
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'John Admin', role: 'Manager', salary: 5000, status: 'Paid' },
                  { name: 'Sarah Sales', role: 'Sales Rep', salary: 3500, status: 'Paid' },
                  { name: 'Mike Tech', role: 'IT Support', salary: 4000, status: 'Pending' },
                ].map((emp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{emp.name}</p>
                        <p className="text-slate-400 text-xs">{emp.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(emp.salary)}</p>
                      <span className={`text-xs ${emp.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Reconciliation Tab */}
          {activeTab === 'reconciliation' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">Bank Reconciliation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">Bank Balance</p>
                  <p className="text-white text-3xl font-bold">{formatCurrency(125000)}</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">Book Balance</p>
                  <p className="text-white text-3xl font-bold">{formatCurrency(124850)}</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-medium">Difference: {formatCurrency(150)}</p>
                <p className="text-slate-400 text-sm mt-1">2 unreconciled transactions need review</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
