'use client';

import React, { useState } from 'react';
import {
  FaChartLine, FaStore, FaCar, FaUsers, FaDollarSign, FaArrowUp, FaArrowDown,
  FaCalendar, FaDownload, FaGlobe
} from 'react-icons/fa';

interface PlatformStats {
  totalTenants: number;
  tenantGrowth: number;
  totalVehicles: number;
  vehicleGrowth: number;
  totalUsers: number;
  userGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalSales: number;
  salesGrowth: number;
  avgVehiclesPerTenant: number;
  avgRevenuePerTenant: number;
}

export default function HqAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  
  const stats: PlatformStats = {
    totalTenants: 47,
    tenantGrowth: 12.5,
    totalVehicles: 2847,
    vehicleGrowth: 8.3,
    totalUsers: 312,
    userGrowth: 15.2,
    totalRevenue: 1250000,
    revenueGrowth: 18.7,
    totalSales: 1234,
    salesGrowth: 22.4,
    avgVehiclesPerTenant: 60,
    avgRevenuePerTenant: 26595,
  };

  const topTenants = [
    { name: 'Denuel Auto', vehicles: 450, sales: 156, revenue: 25000 },
    { name: 'Lusaka Motors', vehicles: 320, sales: 98, revenue: 18000 },
    { name: 'Copperbelt Cars', vehicles: 280, sales: 87, revenue: 15000 },
    { name: 'Kitwe Motors', vehicles: 120, sales: 45, revenue: 5000 },
    { name: 'Ndola Auto', vehicles: 85, sales: 23, revenue: 3500 },
  ];

  const revenueByPlan = [
    { plan: 'Enterprise', revenue: 625000, count: 25 },
    { plan: 'Professional', revenue: 450000, count: 30 },
    { plan: 'Starter', revenue: 175000, count: 35 },
  ];

  const monthlyData = [
    { month: 'Jul', revenue: 85000, tenants: 38 },
    { month: 'Aug', revenue: 92000, tenants: 40 },
    { month: 'Sep', revenue: 98000, tenants: 42 },
    { month: 'Oct', revenue: 108000, tenants: 44 },
    { month: 'Nov', revenue: 118000, tenants: 46 },
    { month: 'Dec', revenue: 125000, tenants: 47 },
  ];

  const StatCard = ({ 
    title, value, growth, icon: Icon, color 
  }: { 
    title: string; value: string | number; growth: number; icon: React.ElementType; color: string 
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm flex items-center gap-1 mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(growth)}% vs last period
          </p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Monitor platform-wide performance and trends</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
            <FaCalendar className="text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none focus:ring-0"
              title="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Tenants" value={stats.totalTenants} growth={stats.tenantGrowth} icon={FaStore} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Vehicles" value={stats.totalVehicles.toLocaleString()} growth={stats.vehicleGrowth} icon={FaCar} color="bg-green-100 text-green-600" />
        <StatCard title="Total Users" value={stats.totalUsers} growth={stats.userGrowth} icon={FaUsers} color="bg-purple-100 text-purple-600" />
        <StatCard title="Total Revenue" value={`K${(stats.totalRevenue / 1000).toFixed(0)}K`} growth={stats.revenueGrowth} icon={FaDollarSign} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Total Sales" value={stats.totalSales.toLocaleString()} growth={stats.salesGrowth} icon={FaChartLine} color="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue & Growth Trend</h3>
          <div className="h-64 flex items-end gap-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full relative">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.revenue / 130000) * 200}px` }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 bg-green-500 rounded-t"
                    style={{ height: `${(data.tenants / 50) * 200}px` }}
                  />
                </div>
                <span className="text-sm text-gray-500 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Revenue (K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Tenants</span>
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {revenueByPlan.map((item) => {
              const percentage = (item.revenue / stats.totalRevenue) * 100;
              const colors = {
                Enterprise: 'bg-purple-500',
                Professional: 'bg-blue-500',
                Starter: 'bg-gray-400',
              };
              return (
                <div key={item.plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.plan}</span>
                    <span className="text-gray-500">K{item.revenue.toLocaleString()} ({item.count})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${colors[item.plan as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Avg/Tenant</p>
                <p className="text-lg font-bold">K{stats.avgRevenuePerTenant.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Vehicles</p>
                <p className="text-lg font-bold">{stats.avgVehiclesPerTenant}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tenants */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Top Performing Tenants</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tenant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicles</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sales</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topTenants.map((tenant, idx) => (
              <tr key={tenant.name} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {tenant.name.charAt(0)}
                    </div>
                    <span className="font-medium">{tenant.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FaCar className="text-gray-400" />
                    {tenant.vehicles}
                  </div>
                </td>
                <td className="px-4 py-3">{tenant.sales}</td>
                <td className="px-4 py-3 font-semibold">K{tenant.revenue.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(tenant.revenue / 25000) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaGlobe className="text-blue-500" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {[
              { region: 'Lusaka', count: 18, percentage: 38 },
              { region: 'Copperbelt', count: 12, percentage: 26 },
              { region: 'Southern', count: 8, percentage: 17 },
              { region: 'Eastern', count: 5, percentage: 11 },
              { region: 'Other', count: 4, percentage: 8 },
            ].map((item) => (
              <div key={item.region} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{item.region}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-20 text-right">{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Uptime</p>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Avg Response</p>
              <p className="text-2xl font-bold text-blue-600">142ms</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Active Sessions</p>
              <p className="text-2xl font-bold text-purple-600">89</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">Error Rate</p>
              <p className="text-2xl font-bold text-orange-600">0.02%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
