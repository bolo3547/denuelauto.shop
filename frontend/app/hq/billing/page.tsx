'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaDollarSign, FaFileInvoice, FaCheck, FaClock, FaExclamationTriangle,
  FaDownload, FaPlus, FaSearch, FaFilter, FaEye, FaEnvelope, FaStore
} from 'react-icons/fa';

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  tenantSlug: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  plan: string;
  period: string;
}

interface BillingStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export default function HqBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'invoices' | 'plans' | 'revenue'>('invoices');

  useEffect(() => {
    const loadData = async () => {
      await new Promise(r => setTimeout(r, 500));
      
      setStats({
        totalRevenue: 1250000,
        thisMonthRevenue: 125000,
        pendingAmount: 45000,
        overdueAmount: 18000,
        totalInvoices: 156,
        paidInvoices: 132,
        pendingInvoices: 18,
        overdueInvoices: 6,
      });

      setInvoices([
        { id: '1', invoiceNumber: 'INV-2024-001', tenantName: 'Denuel Auto', tenantSlug: 'denuel-auto', amount: 25000, status: 'paid', dueDate: '2024-12-01', paidAt: '2024-11-28', plan: 'Enterprise', period: 'Dec 2024' },
        { id: '2', invoiceNumber: 'INV-2024-002', tenantName: 'Lusaka Motors', tenantSlug: 'lusaka-motors', amount: 18000, status: 'paid', dueDate: '2024-12-01', paidAt: '2024-12-01', plan: 'Professional', period: 'Dec 2024' },
        { id: '3', invoiceNumber: 'INV-2024-003', tenantName: 'Copperbelt Cars', tenantSlug: 'copperbelt-cars', amount: 15000, status: 'pending', dueDate: '2024-12-15', plan: 'Professional', period: 'Dec 2024' },
        { id: '4', invoiceNumber: 'INV-2024-004', tenantName: 'Kitwe Motors', tenantSlug: 'kitwe-motors', amount: 5000, status: 'pending', dueDate: '2024-12-15', plan: 'Starter', period: 'Dec 2024' },
        { id: '5', invoiceNumber: 'INV-2024-005', tenantName: 'Livingstone Deals', tenantSlug: 'livingstone-deals', amount: 5000, status: 'overdue', dueDate: '2024-11-15', plan: 'Starter', period: 'Nov 2024' },
        { id: '6', invoiceNumber: 'INV-2024-006', tenantName: 'Chipata Auto', tenantSlug: 'chipata-auto', amount: 8000, status: 'overdue', dueDate: '2024-11-20', plan: 'Professional', period: 'Nov 2024' },
      ]);

      setLoading(false);
    };
    loadData();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    const icons = {
      paid: <FaCheck className="inline mr-1" />,
      pending: <FaClock className="inline mr-1" />,
      overdue: <FaExclamationTriangle className="inline mr-1" />,
      cancelled: null,
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const plans = [
    { name: 'Starter', price: 5000, vehicles: 100, users: 5, features: ['Basic inventory', 'Email support', 'Public website'] },
    { name: 'Professional', price: 15000, vehicles: 500, users: 15, features: ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Custom domain'] },
    { name: 'Enterprise', price: 25000, vehicles: 'Unlimited', users: 'Unlimited', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'White-label'] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="text-gray-600">Manage invoices, plans, and revenue</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <FaDownload /> Export
          </button>
          <Link href="/hq/billing/invoices/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">K{stats?.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">K{stats?.thisMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stats?.paidInvoices} paid</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFileInvoice className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">K{stats?.pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stats?.pendingInvoices} invoices</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600">K{stats?.overdueAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stats?.overdueInvoices} invoices</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {(['invoices', 'plans', 'revenue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by tenant or invoice number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tenant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{invoice.period}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaStore className="text-gray-400" />
                        <span>{invoice.tenantName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{invoice.plan}</td>
                    <td className="px-4 py-3 font-semibold">K{invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <FaEye />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Send reminder">
                          <FaEnvelope />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Download">
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div key={plan.name} className={`bg-white rounded-xl shadow-sm border p-6 ${idx === 2 ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}>
              {idx === 2 && (
                <div className="text-center mb-4">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 text-center">{plan.name}</h3>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold">K{plan.price.toLocaleString()}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheck className="text-green-500" />
                  {typeof plan.vehicles === 'number' ? `Up to ${plan.vehicles} vehicles` : plan.vehicles + ' vehicles'}
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheck className="text-green-500" />
                  {typeof plan.users === 'number' ? `Up to ${plan.users} users` : plan.users + ' users'}
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <FaCheck className="text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Edit Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Month</h3>
          <div className="h-64 flex items-end gap-4">
            {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
              const heights = [60, 70, 65, 80, 90, 100];
              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${heights[idx]}%` }}
                  />
                  <span className="text-sm text-gray-500 mt-2">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Average MRR</p>
              <p className="text-xl font-bold">K{(stats?.thisMonthRevenue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold">47</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Churn Rate</p>
              <p className="text-xl font-bold">2.1%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
