'use client';

import React, { useEffect, useState } from 'react';
import {
  FaHistory, FaSearch, FaFilter, FaDownload, FaUser, FaStore, FaCar,
  FaDollarSign, FaCog, FaShieldAlt, FaSignInAlt, FaSignOutAlt, FaEdit,
  FaTrash, FaPlus, FaEye
} from 'react-icons/fa';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'tenant' | 'billing' | 'settings' | 'user' | 'inventory';
  actor: string;
  actorType: 'hq_admin' | 'tenant_user' | 'system';
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress: string;
  status: 'success' | 'failure';
}

export default function HqAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const loadData = async () => {
      await new Promise(r => setTimeout(r, 500));
      setLogs([
        { id: '1', timestamp: '2024-12-11 14:30:25', action: 'tenant.created', category: 'tenant', actor: 'admin@denuel.com', actorType: 'hq_admin', targetType: 'Tenant', targetId: 'chipata-auto', targetName: 'Chipata Auto', ipAddress: '102.23.45.67', status: 'success' },
        { id: '2', timestamp: '2024-12-11 14:15:00', action: 'auth.login', category: 'auth', actor: 'admin@denuel.com', actorType: 'hq_admin', ipAddress: '102.23.45.67', status: 'success' },
        { id: '3', timestamp: '2024-12-11 13:45:12', action: 'billing.invoice.created', category: 'billing', actor: 'finance@denuel.com', actorType: 'hq_admin', targetType: 'Invoice', targetId: 'INV-2024-007', targetName: 'Ndola Auto - Dec 2024', ipAddress: '102.23.45.68', status: 'success' },
        { id: '4', timestamp: '2024-12-11 12:30:00', action: 'tenant.suspended', category: 'tenant', actor: 'admin@denuel.com', actorType: 'hq_admin', targetType: 'Tenant', targetId: 'livingstone-deals', targetName: 'Livingstone Deals', details: 'Suspended due to non-payment', ipAddress: '102.23.45.67', status: 'success' },
        { id: '5', timestamp: '2024-12-11 11:20:45', action: 'user.created', category: 'user', actor: 'admin@denuel.com', actorType: 'hq_admin', targetType: 'HQ User', targetId: 'support2@denuel.com', targetName: 'Support Staff 2', ipAddress: '102.23.45.67', status: 'success' },
        { id: '6', timestamp: '2024-12-11 10:15:30', action: 'settings.updated', category: 'settings', actor: 'admin@denuel.com', actorType: 'hq_admin', details: 'Updated support contact settings', ipAddress: '102.23.45.67', status: 'success' },
        { id: '7', timestamp: '2024-12-11 09:45:00', action: 'auth.login.failed', category: 'auth', actor: 'unknown@test.com', actorType: 'hq_admin', details: 'Invalid credentials', ipAddress: '41.72.100.50', status: 'failure' },
        { id: '8', timestamp: '2024-12-10 16:30:00', action: 'tenant.plan.upgraded', category: 'tenant', actor: 'admin@denuel.com', actorType: 'hq_admin', targetType: 'Tenant', targetId: 'kitwe-motors', targetName: 'Kitwe Motors', details: 'Upgraded from Starter to Professional', ipAddress: '102.23.45.67', status: 'success' },
        { id: '9', timestamp: '2024-12-10 15:00:00', action: 'billing.payment.received', category: 'billing', actor: 'system', actorType: 'system', targetType: 'Invoice', targetId: 'INV-2024-002', targetName: 'Lusaka Motors - Dec 2024', details: 'K18,000 via Mobile Money', ipAddress: 'system', status: 'success' },
        { id: '10', timestamp: '2024-12-10 14:20:00', action: 'tenant.impersonated', category: 'tenant', actor: 'support@denuel.com', actorType: 'hq_admin', targetType: 'Tenant', targetId: 'copperbelt-cars', targetName: 'Copperbelt Cars', ipAddress: '102.23.45.69', status: 'success' },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <FaSignInAlt className="text-blue-500" />;
    if (action.includes('logout')) return <FaSignOutAlt className="text-gray-500" />;
    if (action.includes('created')) return <FaPlus className="text-green-500" />;
    if (action.includes('updated') || action.includes('upgraded')) return <FaEdit className="text-yellow-500" />;
    if (action.includes('deleted') || action.includes('suspended')) return <FaTrash className="text-red-500" />;
    if (action.includes('impersonated')) return <FaEye className="text-purple-500" />;
    if (action.includes('payment')) return <FaDollarSign className="text-green-500" />;
    return <FaHistory className="text-gray-400" />;
  };

  const getCategoryBadge = (category: AuditLog['category']) => {
    const config = {
      auth: { color: 'bg-blue-100 text-blue-700', icon: FaShieldAlt },
      tenant: { color: 'bg-purple-100 text-purple-700', icon: FaStore },
      billing: { color: 'bg-green-100 text-green-700', icon: FaDollarSign },
      settings: { color: 'bg-gray-100 text-gray-700', icon: FaCog },
      user: { color: 'bg-indigo-100 text-indigo-700', icon: FaUser },
      inventory: { color: 'bg-orange-100 text-orange-700', icon: FaCar },
    };
    const { color, icon: Icon } = config[category];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${color}`}>
        <Icon className="text-xs" />
        {category}
      </span>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <FaDownload /> Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total Events</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold text-blue-600">{logs.filter(l => l.timestamp.startsWith('2024-12-11')).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-green-600">{logs.filter(l => l.status === 'success').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{logs.filter(l => l.status === 'failure').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action, user, or target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="tenant">Tenant</option>
              <option value="billing">Billing</option>
              <option value="settings">Settings</option>
              <option value="user">User</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filter by date range"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Target</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{log.action.replace(/\./g, ' → ')}</p>
                      {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{getCategoryBadge(log.category)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      log.actorType === 'hq_admin' ? 'bg-purple-100 text-purple-600' :
                      log.actorType === 'system' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {log.actorType === 'system' ? 'S' : log.actor.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{log.actor}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.targetName ? (
                    <div>
                      <p className="text-gray-900">{log.targetName}</p>
                      <p className="text-xs text-gray-500">{log.targetType}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ipAddress}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {filteredLogs.length} of {logs.length} entries</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
