'use client';

import React, { useState, useEffect } from 'react';
import {
  FaDollarSign,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaDownload,
  FaSync,
  FaCreditCard,
  FaMobileAlt,
  FaPaypal,
  FaUniversity
} from 'react-icons/fa';

interface Payment {
  id: string;
  reference: string;
  tenantName: string;
  tenantSlug: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  currency: string;
  method: 'card' | 'momo' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'deposit' | 'full_payment' | 'subscription';
  carInfo?: string;
  createdAt: string;
  completedAt?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hq_token');
      const response = await fetch('/api/super-admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        // Mock data for demo
        setPayments([
          {
            id: '1',
            reference: 'PAY-2024-001234',
            tenantName: 'Tokyo Motors',
            tenantSlug: 'tokyo-motors',
            buyerName: 'John Asante',
            buyerEmail: 'john@example.com',
            amount: 2500,
            currency: 'USD',
            method: 'card',
            status: 'completed',
            type: 'deposit',
            carInfo: '2020 Toyota Land Cruiser',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            completedAt: new Date(Date.now() - 3500000).toISOString()
          },
          {
            id: '2',
            reference: 'PAY-2024-001235',
            tenantName: 'Ghana Auto Hub',
            tenantSlug: 'ghana-auto',
            buyerName: 'Kwesi Mensah',
            buyerEmail: 'kwesi@example.gh',
            amount: 500,
            currency: 'USD',
            method: 'momo',
            status: 'pending',
            type: 'deposit',
            carInfo: '2019 Nissan X-Trail',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '3',
            reference: 'PAY-2024-001236',
            tenantName: 'Sample Dealer',
            tenantSlug: 'sample-dealer',
            buyerName: 'Alice Johnson',
            buyerEmail: 'alice@example.com',
            amount: 15000,
            currency: 'USD',
            method: 'paypal',
            status: 'completed',
            type: 'full_payment',
            carInfo: '2021 Honda CR-V',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            completedAt: new Date(Date.now() - 84000000).toISOString()
          },
          {
            id: '4',
            reference: 'PAY-2024-001237',
            tenantName: 'Tokyo Motors',
            tenantSlug: 'tokyo-motors',
            buyerName: 'David Osei',
            buyerEmail: 'david@example.com',
            amount: 3000,
            currency: 'USD',
            method: 'bank_transfer',
            status: 'failed',
            type: 'deposit',
            carInfo: '2018 BMW X5',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '5',
            reference: 'SUB-2024-000089',
            tenantName: 'Kenya Vehicle Imports',
            tenantSlug: 'kenya-imports',
            buyerName: 'Platform',
            buyerEmail: 'billing@kenyaimports.co.ke',
            amount: 99,
            currency: 'USD',
            method: 'card',
            status: 'completed',
            type: 'subscription',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            completedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('hq_token');
      const response = await fetch(`/api/super-admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPayments(payments.map(p =>
          p.id === paymentId ? { ...p, status: 'completed', completedAt: new Date().toISOString() } : p
        ));
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const icons = {
      completed: <FaCheck className="w-3 h-3" />,
      pending: <FaClock className="w-3 h-3" />,
      failed: <FaTimes className="w-3 h-3" />,
      refunded: <FaExclamationTriangle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <FaCreditCard className="w-4 h-4 text-blue-600" />;
      case 'momo': return <FaMobileAlt className="w-4 h-4 text-yellow-600" />;
      case 'paypal': return <FaPaypal className="w-4 h-4 text-blue-800" />;
      case 'bank_transfer': return <FaUniversity className="w-4 h-4 text-gray-600" />;
      default: return <FaDollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMethodName = (method: string) => {
    const names: Record<string, string> = {
      card: 'Credit/Debit Card',
      momo: 'Mobile Money',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer'
    };
    return names[method] || method;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and verify platform payments</p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaDownload className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FaDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FaCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <FaTimes className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference, buyer, or tenant..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="momo">Mobile Money</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <button
              onClick={loadPayments}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaSync className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tenant / Buyer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <code className="text-sm font-mono text-gray-900">{payment.reference}</code>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          payment.type === 'subscription'
                            ? 'bg-purple-100 text-purple-700'
                            : payment.type === 'full_payment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{payment.tenantName}</div>
                    <div className="text-sm text-gray-500">{payment.buyerName}</div>
                    {payment.carInfo && (
                      <div className="text-xs text-gray-400 mt-1">{payment.carInfo}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{payment.currency}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span className="text-sm text-gray-700">{getMethodName(payment.method)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => verifyPayment(payment.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <FaCheck className="w-3 h-3 mr-1" />
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <FaDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-3xl font-bold text-gray-900">${selectedPayment.amount.toLocaleString()}</p>
                <p className="text-gray-500">{selectedPayment.currency}</p>
                <div className="mt-3">{getStatusBadge(selectedPayment.status)}</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Reference</span>
                  <code className="font-mono text-gray-900">{selectedPayment.reference}</code>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{selectedPayment.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900 flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    {getMethodName(selectedPayment.method)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tenant</span>
                  <span className="font-medium text-gray-900">{selectedPayment.tenantName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Buyer</span>
                  <span className="font-medium text-gray-900">{selectedPayment.buyerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{selectedPayment.buyerEmail}</span>
                </div>
                {selectedPayment.carInfo && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Vehicle</span>
                    <span className="font-medium text-gray-900">{selectedPayment.carInfo}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedPayment.completedAt && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Completed</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedPayment.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedPayment.status === 'pending' && (
                <button
                  onClick={() => {
                    verifyPayment(selectedPayment.id);
                    setSelectedPayment(null);
                  }}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <FaCheck className="w-4 h-4 mr-2" />
                  Verify Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
