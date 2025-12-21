'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine,
  FaEye,
  FaEdit,
  FaBan,
  FaCheck,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload
} from 'react-icons/fa';

interface Tenant {
  id: string;
  businessName: string;
  slug: string;
  domain?: string;
  status: 'active' | 'suspended' | 'pending';
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  lastActive?: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  subscription?: {
    planName: string;
    price: number;
    nextBillingDate: string;
  };
  stats: {
    totalCars: number;
    totalUsers: number;
    monthlyRevenue: number;
    lastPayment?: string;
  };
}

interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyGrowth: number;
  totalTransactions: number;
  pendingPayments: number;
}

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const stats: SystemStats = systemStats ?? {
    totalTenants: 0,
    activeTenants: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalTransactions: 0,
    pendingPayments: 0,
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        fetch('/api/super-admin/stats'),
        fetch('/api/super-admin/tenants')
      ]);

      const [stats, tenantsData] = await Promise.all([
        statsRes.json(),
        tenantsRes.json()
      ]);

      setSystemStats(stats);
      setTenants(tenantsData.tenants || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTenantStatus = async (tenantId: string, status: 'active' | 'suspended') => {
    try {
      const response = await fetch(`/api/super-admin/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setTenants(tenants.map(t => 
          t.id === tenantId ? { ...t, status } : t
        ));
        alert(`Tenant ${status === 'suspended' ? 'suspended' : 'activated'} successfully`);
      } else {
        alert('Failed to update tenant status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update tenant status');
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all tenants and system operations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <FaDownload className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'tenants', label: 'Tenants', icon: FaBuilding },
            { id: 'payments', label: 'Payments', icon: FaDollarSign },
            { id: 'analytics', label: 'Analytics', icon: FaChartLine }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBuilding className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600">
                    {stats.activeTenants} active
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Number(stats.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600">
                    +{stats.monthlyGrowth}% this month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    All time
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-orange-600">
                    Needs attention
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tenant Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {tenants.slice(0, 5).map((tenant) => (
                      <div key={tenant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            tenant.status === 'active' ? 'bg-green-500' :
                            tenant.status === 'suspended' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{tenant.businessName}</div>
                            <div className="text-sm text-gray-500">{tenant.owner.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.lastActive ? new Date(tenant.lastActive).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
                </div>
                <div className="p-6">
                  <div className="text-center text-gray-500">
                    <FaChartLine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Revenue chart would be implemented here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tenants..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
                    <FaFilter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{tenant.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.owner.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tenant.owner.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tenant.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : tenant.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tenant.subscription ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tenant.subscription.planName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${tenant.subscription.price}/mo
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No subscription</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${tenant.stats.monthlyRevenue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => window.open(`/t/${tenant.slug}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Tenant"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => alert('Edit functionality would be implemented')}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Tenant"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            
                            {tenant.status === 'active' ? (
                              <button 
                                onClick={() => updateTenantStatus(tenant.id, 'suspended')}
                                className="text-red-600 hover:text-red-900"
                                title="Suspend Tenant"
                              >
                                <FaBan className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateTenantStatus(tenant.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                                title="Activate Tenant"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Management</h3>
            <div className="text-center text-gray-500">
              <FaDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Payment management interface would be implemented here</p>
              <p className="text-sm">Including transaction monitoring, payment verification, etc.</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
            <div className="text-center text-gray-500">
              <FaChartLine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Advanced analytics dashboard would be implemented here</p>
              <p className="text-sm">Including usage metrics, performance data, growth analytics, etc.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
