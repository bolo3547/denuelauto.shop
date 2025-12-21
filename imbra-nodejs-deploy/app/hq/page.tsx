'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';
import {
  FaStore, FaUsers, FaDollarSign, FaCar, FaChartLine, FaTicketAlt,
  FaCheckCircle, FaClock, FaArrowUp, FaArrowDown,
  FaEye, FaPlus, FaBell, FaFileInvoice, FaGlobe
} from 'react-icons/fa';

interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  pendingRegistrations: number;
  totalUsers: number;
  totalVehicles: number;
  totalSales: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  openTickets: number;
  pendingInvoices: number;
}

interface RecentActivity {
  id: string;
  type: 'tenant_created' | 'sale' | 'registration' | 'ticket' | 'payment';
  message: string;
  tenant?: string;
  timestamp: string;
}

interface TenantOverview {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: 'active' | 'suspended' | 'trial';
  vehicleCount: number;
  monthlyRevenue: number;
  lastActivity: string;
}

export default function HqDashboard() {
  const { admin } = useHqAdminAuth();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topTenants, setTopTenants] = useState<TenantOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(r => setTimeout(r, 500));
      
      setMetrics({
        totalTenants: 47,
        activeTenants: 42,
        pendingRegistrations: 5,
        totalUsers: 312,
        totalVehicles: 2847,
        totalSales: 1234,
        monthlyRevenue: 125000,
        previousMonthRevenue: 108000,
        openTickets: 8,
        pendingInvoices: 12,
      });

      setRecentActivity([
        { id: '1', type: 'tenant_created', message: 'New tenant registered', tenant: 'Lusaka Motors', timestamp: '10 minutes ago' },
        { id: '2', type: 'sale', message: 'Vehicle sold - Toyota Hilux', tenant: 'Denuel Auto', timestamp: '25 minutes ago' },
        { id: '3', type: 'payment', message: 'Subscription payment received', tenant: 'Copperbelt Cars', timestamp: '1 hour ago' },
        { id: '4', type: 'ticket', message: 'Support ticket opened', tenant: 'Ndola Auto', timestamp: '2 hours ago' },
        { id: '5', type: 'registration', message: 'Pending registration approval', tenant: 'Kitwe Motors', timestamp: '3 hours ago' },
      ]);

      setTopTenants([
        { id: '1', name: 'Denuel Auto', slug: 'denuel-auto', plan: 'Enterprise', status: 'active', vehicleCount: 450, monthlyRevenue: 25000, lastActivity: '5 min ago' },
        { id: '2', name: 'Lusaka Motors', slug: 'lusaka-motors', plan: 'Professional', status: 'active', vehicleCount: 320, monthlyRevenue: 18000, lastActivity: '15 min ago' },
        { id: '3', name: 'Copperbelt Cars', slug: 'copperbelt-cars', plan: 'Professional', status: 'active', vehicleCount: 280, monthlyRevenue: 15000, lastActivity: '1 hour ago' },
        { id: '4', name: 'Ndola Auto', slug: 'ndola-auto', plan: 'Starter', status: 'trial', vehicleCount: 85, monthlyRevenue: 0, lastActivity: '2 hours ago' },
        { id: '5', name: 'Kitwe Motors', slug: 'kitwe-motors', plan: 'Starter', status: 'active', vehicleCount: 120, monthlyRevenue: 5000, lastActivity: '3 hours ago' },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  const revenueChange = metrics 
    ? ((metrics.monthlyRevenue - metrics.previousMonthRevenue) / metrics.previousMonthRevenue * 100).toFixed(1)
    : '0';
  const revenueUp = metrics ? metrics.monthlyRevenue >= metrics.previousMonthRevenue : true;

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'tenant_created': return <FaStore className="text-blue-500" />;
      case 'sale': return <FaDollarSign className="text-green-500" />;
      case 'registration': return <FaUsers className="text-yellow-500" />;
      case 'ticket': return <FaTicketAlt className="text-orange-500" />;
      case 'payment': return <FaCheckCircle className="text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: TenantOverview['status']) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>;
      case 'suspended': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Suspended</span>;
      case 'trial': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Trial</span>;
    }
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
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-600">Welcome back, {admin?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/hq/tenants/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Add Tenant
          </Link>
          <Link href="/hq/registration/pending" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <FaBell /> Pending ({metrics?.pendingRegistrations || 0})
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalTenants}</p>
              <p className="text-sm text-green-600">{metrics?.activeTenants} active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaStore className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalVehicles.toLocaleString()}</p>
              <p className="text-sm text-gray-500">across all tenants</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCar className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">K{(metrics?.monthlyRevenue || 0).toLocaleString()}</p>
              <p className={`text-sm flex items-center gap-1 ${revenueUp ? 'text-green-600' : 'text-red-600'}`}>
                {revenueUp ? <FaArrowUp /> : <FaArrowDown />}
                {revenueChange}% vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-emerald-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.openTickets}</p>
              <p className="text-sm text-orange-600">{metrics?.pendingInvoices} unpaid invoices</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaTicketAlt className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics?.pendingRegistrations && metrics.pendingRegistrations > 0 && (
          <Link href="/hq/registration/pending" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-4 hover:bg-yellow-100 transition-colors">
            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <FaClock className="text-yellow-700" />
            </div>
            <div>
              <p className="font-semibold text-yellow-800">{metrics.pendingRegistrations} Pending Registrations</p>
              <p className="text-sm text-yellow-600">Awaiting approval</p>
            </div>
          </Link>
        )}

        {metrics?.openTickets && metrics.openTickets > 0 && (
          <Link href="/hq/support" className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-4 hover:bg-orange-100 transition-colors">
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <FaTicketAlt className="text-orange-700" />
            </div>
            <div>
              <p className="font-semibold text-orange-800">{metrics.openTickets} Open Support Tickets</p>
              <p className="text-sm text-orange-600">Need attention</p>
            </div>
          </Link>
        )}

        {metrics?.pendingInvoices && metrics.pendingInvoices > 0 && (
          <Link href="/hq/billing" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4 hover:bg-red-100 transition-colors">
            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
              <FaFileInvoice className="text-red-700" />
            </div>
            <div>
              <p className="font-semibold text-red-800">{metrics.pendingInvoices} Unpaid Invoices</p>
              <p className="text-sm text-red-600">Payment overdue</p>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tenants */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Tenants by Revenue</h2>
            <Link href="/hq/tenants" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="divide-y">
            {topTenants.map((tenant) => (
              <div key={tenant.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      {getStatusBadge(tenant.status)}
                    </div>
                    <p className="text-sm text-gray-500">{tenant.plan} • {tenant.vehicleCount} vehicles</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">K{tenant.monthlyRevenue.toLocaleString()}/mo</p>
                  <p className="text-xs text-gray-500">{tenant.lastActivity}</p>
                </div>
                <Link href={`/hq/tenants/${tenant.slug}`} className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <FaEye />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div>
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  {activity.tenant && <p className="text-xs text-gray-500">{activity.tenant}</p>}
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link href="/hq/tenants/new" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaPlus className="text-2xl text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">Add Tenant</span>
          </Link>
          <Link href="/hq/billing/invoices/new" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaFileInvoice className="text-2xl text-green-600 mb-2" />
            <span className="text-sm text-gray-700">Create Invoice</span>
          </Link>
          <Link href="/hq/support" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaTicketAlt className="text-2xl text-orange-600 mb-2" />
            <span className="text-sm text-gray-700">Support Tickets</span>
          </Link>
          <Link href="/hq/analytics" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaChartLine className="text-2xl text-purple-600 mb-2" />
            <span className="text-sm text-gray-700">Analytics</span>
          </Link>
          <Link href="/hq/announcements" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaBell className="text-2xl text-yellow-600 mb-2" />
            <span className="text-sm text-gray-700">Announcements</span>
          </Link>
          <Link href="/hq/settings" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 border border-gray-100">
            <FaGlobe className="text-2xl text-gray-600 mb-2" />
            <span className="text-sm text-gray-700">Platform Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
