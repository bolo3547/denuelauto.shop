'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';
import {
  FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaBan, FaCheck, FaEllipsisV,
  FaStore, FaCar, FaUsers, FaDollarSign, FaExternalLinkAlt, FaUserSecret,
  FaFilter, FaDownload, FaSync
} from 'react-icons/fa';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'pending';
  vehicleCount: number;
  userCount: number;
  monthlyRevenue: number;
  createdAt: string;
  lastActivity: string;
  trialEndsAt?: string;
}

export default function HqTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const { admin, refresh } = useHqAdminAuth();

  useEffect(() => {
    refresh();
    const load = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API
        await new Promise(r => setTimeout(r, 500));
        setTenants([
          { id: '1', name: 'Denuel Auto', slug: 'denuel-auto', email: 'admin@denuelauto.com', phone: '+260971234567', plan: 'enterprise', status: 'active', vehicleCount: 450, userCount: 12, monthlyRevenue: 25000, createdAt: '2024-01-15', lastActivity: '5 min ago' },
          { id: '2', name: 'Lusaka Motors', slug: 'lusaka-motors', email: 'info@lusakamotors.com', phone: '+260961234567', plan: 'professional', status: 'active', vehicleCount: 320, userCount: 8, monthlyRevenue: 18000, createdAt: '2024-02-20', lastActivity: '15 min ago' },
          { id: '3', name: 'Copperbelt Cars', slug: 'copperbelt-cars', email: 'sales@copperbeltcars.com', phone: '+260951234567', plan: 'professional', status: 'active', vehicleCount: 280, userCount: 6, monthlyRevenue: 15000, createdAt: '2024-03-10', lastActivity: '1 hour ago' },
          { id: '4', name: 'Ndola Auto', slug: 'ndola-auto', email: 'contact@ndolaauto.com', phone: '+260941234567', plan: 'starter', status: 'trial', vehicleCount: 85, userCount: 3, monthlyRevenue: 0, createdAt: '2024-11-01', lastActivity: '2 hours ago', trialEndsAt: '2024-12-15' },
          { id: '5', name: 'Kitwe Motors', slug: 'kitwe-motors', email: 'hello@kitwemotors.com', phone: '+260931234567', plan: 'starter', status: 'active', vehicleCount: 120, userCount: 4, monthlyRevenue: 5000, createdAt: '2024-06-15', lastActivity: '3 hours ago' },
          { id: '6', name: 'Livingstone Deals', slug: 'livingstone-deals', email: 'info@livingstonedeals.com', phone: '+260921234567', plan: 'starter', status: 'suspended', vehicleCount: 45, userCount: 2, monthlyRevenue: 0, createdAt: '2024-04-20', lastActivity: '1 week ago' },
          { id: '7', name: 'Chipata Auto', slug: 'chipata-auto', email: 'sales@chipataauto.com', phone: '+260911234567', plan: 'professional', status: 'pending', vehicleCount: 0, userCount: 1, monthlyRevenue: 0, createdAt: '2024-12-10', lastActivity: 'Never' },
        ]);
      } catch (e) {
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || t.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: Tenant['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700',
      trial: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const getPlanBadge = (plan: Tenant['plan']) => {
    const styles = {
      starter: 'bg-gray-100 text-gray-700',
      professional: 'bg-indigo-100 text-indigo-700',
      enterprise: 'bg-purple-100 text-purple-700',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[plan]}`}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>;
  };

  const handleAction = async (action: string, tenantId: string) => {
    setShowActionMenu(null);
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    switch (action) {
      case 'suspend':
        if (confirm(`Suspend ${tenant.name}? They will lose access to their dashboard.`)) {
          // API call
          setTenants(tenants.map(t => t.id === tenantId ? { ...t, status: 'suspended' as const } : t));
        }
        break;
      case 'activate':
        setTenants(tenants.map(t => t.id === tenantId ? { ...t, status: 'active' as const } : t));
        break;
      case 'delete':
        if (confirm(`Delete ${tenant.name}? This cannot be undone.`)) {
          setTenants(tenants.filter(t => t.id !== tenantId));
        }
        break;
      case 'impersonate':
        window.open(`/t/${tenant.slug}/admin?impersonate=true`, '_blank');
        break;
    }
  };

  const toggleSelectAll = () => {
    if (selectedTenants.length === filteredTenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(filteredTenants.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedTenants.includes(id)) {
      setSelectedTenants(selectedTenants.filter(i => i !== id));
    } else {
      setSelectedTenants([...selectedTenants, id]);
    }
  };

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600">Manage all dealerships on the platform</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <FaDownload /> Export
          </button>
          <Link href="/hq/tenants/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Add Tenant
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total Tenants</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Trial</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.trial}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
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
                placeholder="Search by name, slug, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPlanFilter('all'); }} className="text-sm text-gray-500 hover:text-gray-700">
            Clear filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTenants.length === filteredTenants.length && filteredTenants.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tenant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicles</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Users</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Active</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTenants.includes(tenant.id)}
                      onChange={() => toggleSelect(tenant.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getPlanBadge(tenant.plan)}</td>
                  <td className="px-4 py-3">
                    {getStatusBadge(tenant.status)}
                    {tenant.trialEndsAt && (
                      <p className="text-xs text-gray-500 mt-1">Ends {tenant.trialEndsAt}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-700">
                      <FaCar className="text-gray-400" />
                      {tenant.vehicleCount}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-700">
                      <FaUsers className="text-gray-400" />
                      {tenant.userCount}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">K{tenant.monthlyRevenue.toLocaleString()}</span>
                    <span className="text-gray-500">/mo</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tenant.lastActivity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 relative">
                      <Link href={`/hq/tenants/${tenant.slug}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                        <FaEye />
                      </Link>
                      <a href={`/t/${tenant.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Visit Site">
                        <FaExternalLinkAlt />
                      </a>
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === tenant.id ? null : tenant.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <FaEllipsisV />
                      </button>
                      {showActionMenu === tenant.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-48">
                          <button onClick={() => handleAction('impersonate', tenant.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            <FaUserSecret className="text-purple-500" /> Impersonate
                          </button>
                          <Link href={`/hq/tenants/${tenant.slug}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            <FaEdit className="text-blue-500" /> Edit Tenant
                          </Link>
                          {tenant.status === 'active' || tenant.status === 'trial' ? (
                            <button onClick={() => handleAction('suspend', tenant.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600">
                              <FaBan /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleAction('activate', tenant.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600">
                              <FaCheck /> Activate
                            </button>
                          )}
                          <hr className="my-1" />
                          <button onClick={() => handleAction('delete', tenant.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                            <FaTrash /> Delete Tenant
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <FaStore className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No tenants found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTenants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <span>{selectedTenants.length} selected</span>
          <button className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Activate</button>
          <button className="px-3 py-1 bg-orange-600 rounded hover:bg-orange-700">Suspend</button>
          <button className="px-3 py-1 bg-red-600 rounded hover:bg-red-700">Delete</button>
          <button onClick={() => setSelectedTenants([])} className="text-gray-400 hover:text-white">Cancel</button>
        </div>
      )}
    </div>
  );
}
