'use client';

import React, { useState, useEffect } from 'react';
import { makeApiUrl } from '@/lib/config/api';
import { useRouter } from 'next/navigation';
import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaBan,
  FaCheck,
  FaTrash,
  FaChartBar,
  FaCar,
  FaUsers,
  FaDollarSign,
  FaTimes,
  FaExternalLinkAlt,
  FaCopy,
  FaSync,
  FaEllipsisV
} from 'react-icons/fa';

interface Tenant {
  id: string;
  businessName: string;
  slug: string;
  domain?: string;
  status: 'active' | 'suspended' | 'pending';
  subscriptionStatus: string;
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
  };
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hq_token');
      const response = await fetch(makeApiUrl('/api/super-admin/tenants'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      } else {
        // Mock data for demo
        setTenants([
          {
            id: '1',
            businessName: 'Tokyo Motors',
            slug: 'tokyo-motors',
            domain: 'tokyomotors.com',
            status: 'active',
            subscriptionStatus: 'active',
            createdAt: '2024-01-15',
            lastActive: new Date().toISOString(),
            owner: { name: 'Tanaka Hiroshi', email: 'tanaka@tokyomotors.com', phone: '+81-90-1234-5678' },
            subscription: { planName: 'Professional', price: 99, nextBillingDate: '2024-02-15' },
            stats: { totalCars: 156, totalUsers: 12, monthlyRevenue: 45000 }
          },
          {
            id: '2',
            businessName: 'Ghana Auto Hub',
            slug: 'ghana-auto',
            status: 'active',
            subscriptionStatus: 'active',
            createdAt: '2024-01-20',
            lastActive: new Date().toISOString(),
            owner: { name: 'Kwame Asante', email: 'kwame@ghanaauto.gh', phone: '+233-24-000-0000' },
            subscription: { planName: 'Business', price: 199, nextBillingDate: '2024-02-20' },
            stats: { totalCars: 324, totalUsers: 25, monthlyRevenue: 89000 }
          },
          {
            id: '3',
            businessName: 'Sample Dealer',
            slug: 'sample-dealer',
            status: 'active',
            subscriptionStatus: 'active',
            createdAt: '2024-01-01',
            lastActive: new Date().toISOString(),
            owner: { name: 'Admin User', email: 'admin@sample-dealer.com' },
            subscription: { planName: 'Starter', price: 49, nextBillingDate: '2024-02-01' },
            stats: { totalCars: 45, totalUsers: 5, monthlyRevenue: 12000 }
          },
          {
            id: '4',
            businessName: 'Kenya Vehicle Imports',
            slug: 'kenya-imports',
            status: 'suspended',
            subscriptionStatus: 'expired',
            createdAt: '2023-11-10',
            owner: { name: 'James Mwangi', email: 'james@kenyaimports.co.ke' },
            stats: { totalCars: 0, totalUsers: 3, monthlyRevenue: 0 }
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTenantStatus = async (tenantId: string, newStatus: 'active' | 'suspended') => {
    try {
      const token = localStorage.getItem('hq_token');
      const response = await fetch(makeApiUrl(`/api/super-admin/tenants/${tenantId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTenants(tenants.map(t =>
          t.id === tenantId ? { ...t, status: newStatus } : t
        ));
        setActionMenuOpen(null);
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600 mt-1">Manage all dealerships on the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add New Tenant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tenants.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FaBuilding className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {tenants.filter(t => t.status === 'active').length}
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
              <p className="text-sm text-gray-500">Total Cars</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenants.reduce((sum, t) => sum + t.stats.totalCars, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <FaCar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${tenants.reduce((sum, t) => sum + t.stats.monthlyRevenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <FaDollarSign className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search by name, email, or slug..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <label htmlFor="statusFilter" className="sr-only">Filter by status</label>
            <select
              id="statusFilter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={loadTenants}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaSync className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Grid/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {tenant.businessName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{tenant.businessName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            /{tenant.slug}
                          </code>
                          <button
                            type="button"
                            title="Copy slug to clipboard"
                            onClick={() => copyToClipboard(tenant.slug)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{tenant.owner.name}</div>
                    <div className="text-sm text-gray-500">{tenant.owner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(tenant.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        tenant.status === 'active' ? 'bg-green-500' :
                        tenant.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></span>
                      {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tenant.subscription ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.subscription.planName}</div>
                        <div className="text-sm text-gray-500">${tenant.subscription.price}/mo</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No plan</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <FaCar className="w-4 h-4 mr-1 text-gray-400" />
                        {tenant.stats.totalCars}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="w-4 h-4 mr-1 text-gray-400" />
                        {tenant.stats.totalUsers}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <a
                        href={`/t/${tenant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Visit Site"
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                      </a>
                      <div className="relative">
                        <button
                          type="button"
                          title="Open actions menu"
                          onClick={() => setActionMenuOpen(actionMenuOpen === tenant.id ? null : tenant.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FaEllipsisV className="w-4 h-4" />
                        </button>
                        {actionMenuOpen === tenant.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                            <button
                              onClick={() => {
                                router.push(`/super-admin/tenants/${tenant.id}/edit`);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <FaEdit className="w-4 h-4 mr-3 text-gray-400" />
                              Edit Tenant
                            </button>
                            <button
                              onClick={() => router.push(`/super-admin/tenants/${tenant.id}/analytics`)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <FaChartBar className="w-4 h-4 mr-3 text-gray-400" />
                              View Analytics
                            </button>
                            <hr className="my-1" />
                            {tenant.status === 'active' ? (
                              <button
                                onClick={() => updateTenantStatus(tenant.id, 'suspended')}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <FaBan className="w-4 h-4 mr-3" />
                                Suspend Tenant
                              </button>
                            ) : (
                              <button
                                onClick={() => updateTenantStatus(tenant.id, 'active')}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center"
                              >
                                <FaCheck className="w-4 h-4 mr-3" />
                                Activate Tenant
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tenants found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Tenant Detail Modal */}
      {showDetailModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tenant Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {selectedTenant.businessName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTenant.businessName}</h3>
                  <p className="text-gray-500">/{selectedTenant.slug}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTenant.status)}`}>
                  {selectedTenant.status}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FaCar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.stats.totalCars}</p>
                  <p className="text-sm text-gray-500">Total Cars</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FaUsers className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Users</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FaDollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${selectedTenant.stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Owner Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{selectedTenant.owner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{selectedTenant.owner.email}</span>
                  </div>
                  {selectedTenant.owner.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">{selectedTenant.owner.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Info */}
              {selectedTenant.subscription && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Subscription</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-medium text-gray-900">{selectedTenant.subscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium text-gray-900">${selectedTenant.subscription.price}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Billing</span>
                      <span className="font-medium text-gray-900">{selectedTenant.subscription.nextBillingDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`/t/${selectedTenant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium flex items-center justify-center"
                >
                  <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                  Visit Site
                </a>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    router.push(`/super-admin/tenants/${selectedTenant.id}/edit`);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium flex items-center justify-center"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Tenant</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="business-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="owner@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Owner full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="starter">Starter - $49/mo</option>
                  <option value="professional">Professional - $99/mo</option>
                  <option value="business">Business - $199/mo</option>
                  <option value="enterprise">Enterprise - Custom</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}
