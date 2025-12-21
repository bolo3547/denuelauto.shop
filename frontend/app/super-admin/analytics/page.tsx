'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaBuilding,
  FaCar,
  FaUsers,
  FaDollarSign,
  FaGlobe,
  FaSync
} from 'react-icons/fa';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalSales: number;
    salesGrowth: number;
    totalUsers: number;
    userGrowth: number;
    totalCars: number;
    carGrowth: number;
  };
  revenueByMonth: { month: string; revenue: number }[];
  salesByTenant: { tenant: string; sales: number; revenue: number }[];
  topCountries: { country: string; buyers: number; revenue: number }[];
  popularMakes: { make: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // (moved useCallback import to top-level)

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hq_token');
      const response = await fetch(`/api/super-admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        // Mock data for demo
        setData({
          overview: {
            totalRevenue: 458000,
            revenueGrowth: 12.5,
            totalSales: 156,
            salesGrowth: 8.3,
            totalUsers: 2450,
            userGrowth: 15.2,
            totalCars: 1234,
            carGrowth: 5.7
          },
          revenueByMonth: [
            { month: 'Jan', revenue: 35000 },
            { month: 'Feb', revenue: 42000 },
            { month: 'Mar', revenue: 38000 },
            { month: 'Apr', revenue: 51000 },
            { month: 'May', revenue: 48000 },
            { month: 'Jun', revenue: 62000 },
            { month: 'Jul', revenue: 55000 },
            { month: 'Aug', revenue: 68000 },
            { month: 'Sep', revenue: 59000 }
          ],
          salesByTenant: [
            { tenant: 'Tokyo Motors', sales: 45, revenue: 125000 },
            { tenant: 'Ghana Auto Hub', sales: 38, revenue: 98000 },
            { tenant: 'Sample Dealer', sales: 28, revenue: 65000 },
            { tenant: 'Kenya Imports', sales: 25, revenue: 89000 },
            { tenant: 'Lagos Auto', sales: 20, revenue: 81000 }
          ],
          topCountries: [
            { country: 'Ghana', buyers: 450, revenue: 125000 },
            { country: 'Kenya', buyers: 380, revenue: 98000 },
            { country: 'Nigeria', buyers: 320, revenue: 89000 },
            { country: 'Tanzania', buyers: 210, revenue: 65000 },
            { country: 'Uganda', buyers: 180, revenue: 52000 }
          ],
          popularMakes: [
            { make: 'Toyota', count: 456 },
            { make: 'Nissan', count: 234 },
            { make: 'Honda', count: 189 },
            { make: 'Mercedes', count: 145 },
            { make: 'BMW', count: 132 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    growth: number; 
    icon: React.ElementType; 
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <FaArrowUp className="w-3 h-3 mr-1" /> : <FaArrowDown className="w-3 h-3 mr-1" />}
            <span>{Math.abs(growth)}% from last period</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BarChart = ({ data, title }: { data: { label: string; value: number }[]; title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-gray-900 text-right">
                {typeof item.value === 'number' && item.value > 1000 
                  ? `$${(item.value / 1000).toFixed(0)}k` 
                  : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No analytics data available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          <button
            type="button"
            title="Refresh analytics"
            onClick={loadAnalytics}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaSync className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          growth={data.overview.revenueGrowth}
          icon={FaDollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Sales"
          value={data.overview.totalSales}
          growth={data.overview.salesGrowth}
          icon={FaChartBar}
          color="bg-blue-500"
        />
        <StatCard
          title="Platform Users"
          value={data.overview.totalUsers.toLocaleString()}
          growth={data.overview.userGrowth}
          icon={FaUsers}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Listings"
          value={data.overview.totalCars.toLocaleString()}
          growth={data.overview.carGrowth}
          icon={FaCar}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <FaChartLine className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.revenueByMonth.map((item, index) => {
              const maxRevenue = Math.max(...data.revenueByMonth.map(d => d.revenue));
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500 cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${(item.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tenants */}
        <BarChart
          title="Top Performing Tenants"
          data={data.salesByTenant.map(t => ({ label: t.tenant, value: t.revenue }))}
        />

        {/* Top Countries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Buyer Countries</h3>
            <FaGlobe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{country.country}</div>
                    <div className="text-sm text-gray-500">{country.buyers} buyers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${(country.revenue / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-gray-500">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Makes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Car Makes</h3>
            <FaCar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.popularMakes.map((make, index) => {
              const maxCount = data.popularMakes[0].count;
              const percentage = (make.count / maxCount) * 100;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-900">{make.make}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">{make.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Insights</h3>
            <FaChartPie className="w-5 h-5 opacity-80" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="opacity-80">Avg. Car Price</span>
              <span className="font-bold">$8,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Conversion Rate</span>
              <span className="font-bold">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Avg. Time to Sale</span>
              <span className="font-bold">12 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Repeat Buyers</span>
              <span className="font-bold">18%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Growth Metrics</h3>
            <FaArrowUp className="w-5 h-5 opacity-80" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="opacity-80">New Tenants (30d)</span>
              <span className="font-bold">+12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">New Listings (30d)</span>
              <span className="font-bold">+456</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">MoM Growth</span>
              <span className="font-bold">+15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Active Users</span>
              <span className="font-bold">1,234</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Platform Health</h3>
            <FaBuilding className="w-5 h-5 opacity-80" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="opacity-80">Uptime</span>
              <span className="font-bold">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">API Response</span>
              <span className="font-bold">145ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Error Rate</span>
              <span className="font-bold">0.02%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Active Sessions</span>
              <span className="font-bold">234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
