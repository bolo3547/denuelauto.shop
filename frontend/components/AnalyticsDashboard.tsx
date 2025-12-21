'use client';

import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaDollarSign,
  FaCar,
  FaUsers,
  FaEye,
  FaFilter,
  FaCalendarAlt,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaPercent
} from 'react-icons/fa';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  leads: number;
  conversions: number;
}

interface TopPerformer {
  id: string;
  name: string;
  role: string;
  sales: number;
  revenue: number;
  commissions: number;
}

interface VehicleMetrics {
  make: string;
  model: string;
  views: number;
  inquiries: number;
  conversions: number;
  averageDaysToSell: number;
  profit: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  color: string;
}

export default function AnalyticsDashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [vehicleMetrics, setVehicleMetrics] = useState<VehicleMetrics[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averagePrice: 0,
    conversionRate: 0,
    totalLeads: 0,
    activeListings: 0,
    revenueGrowth: 0,
    salesGrowth: 0
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockSalesData: SalesData[] = [
        { month: 'Jan', sales: 45, revenue: 850000, leads: 320, conversions: 45 },
        { month: 'Feb', sales: 52, revenue: 980000, leads: 380, conversions: 52 },
        { month: 'Mar', sales: 38, revenue: 720000, leads: 290, conversions: 38 },
        { month: 'Apr', sales: 61, revenue: 1150000, leads: 420, conversions: 61 },
        { month: 'May', sales: 49, revenue: 920000, leads: 350, conversions: 49 },
        { month: 'Jun', sales: 67, revenue: 1280000, leads: 480, conversions: 67 }
      ];

      const mockTopPerformers: TopPerformer[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Senior Sales Agent',
          sales: 23,
          revenue: 520000,
          commissions: 26000
        },
        {
          id: '2',
          name: 'Michael Brown',
          role: 'Sales Manager',
          sales: 19,
          revenue: 445000,
          commissions: 22250
        },
        {
          id: '3',
          name: 'Lisa Anderson',
          role: 'Sales Agent',
          sales: 16,
          revenue: 380000,
          commissions: 19000
        }
      ];

      const mockVehicleMetrics: VehicleMetrics[] = [
        {
          make: 'Toyota',
          model: 'Camry',
          views: 1250,
          inquiries: 89,
          conversions: 12,
          averageDaysToSell: 18,
          profit: 45000
        },
        {
          make: 'Honda',
          model: 'Accord',
          views: 980,
          inquiries: 67,
          conversions: 9,
          averageDaysToSell: 22,
          profit: 38000
        },
        {
          make: 'Ford',
          model: 'F-150',
          views: 1450,
          inquiries: 102,
          conversions: 15,
          averageDaysToSell: 16,
          profit: 67000
        }
      ];

      const mockTrafficSources: TrafficSource[] = [
        { source: 'Direct', visitors: 1250, conversions: 45, conversionRate: 3.6, color: '#3B82F6' },
        { source: 'Google Search', visitors: 2100, conversions: 78, conversionRate: 3.7, color: '#10B981' },
        { source: 'Facebook', visitors: 890, conversions: 23, conversionRate: 2.6, color: '#F59E0B' },
        { source: 'Instagram', visitors: 650, conversions: 18, conversionRate: 2.8, color: '#EF4444' },
        { source: 'Referrals', visitors: 340, conversions: 12, conversionRate: 3.5, color: '#8B5CF6' }
      ];

      setSalesData(mockSalesData);
      setTopPerformers(mockTopPerformers);
      setVehicleMetrics(mockVehicleMetrics);
      setTrafficSources(mockTrafficSources);

      // Calculate metrics
      const totalRevenue = mockSalesData.reduce((sum, data) => sum + data.revenue, 0);
      const totalSales = mockSalesData.reduce((sum, data) => sum + data.sales, 0);
      const totalLeads = mockSalesData.reduce((sum, data) => sum + data.leads, 0);
      
      setMetrics({
        totalRevenue,
        totalSales,
        averagePrice: totalRevenue / totalSales,
        conversionRate: (totalSales / totalLeads) * 100,
        totalLeads,
        activeListings: 156,
        revenueGrowth: 12.5,
        salesGrowth: 8.3
      });

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate and download analytics report
    const reportData = {
      dateRange,
      metrics,
      salesData,
      topPerformers,
      vehicleMetrics,
      trafficSources
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track sales performance, traffic, and business metrics</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaDownload className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <FaArrowUp className="w-4 h-4 mr-1" />
              <span>{metrics.revenueGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${metrics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaCar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <FaArrowUp className="w-4 h-4 mr-1" />
              <span>{metrics.salesGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalSales}</p>
            <p className="text-gray-600 text-sm">Vehicles Sold</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaPercent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.conversionRate.toFixed(1)}%
            </p>
            <p className="text-gray-600 text-sm">Conversion Rate</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</p>
            <p className="text-gray-600 text-sm">Total Leads</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Performance</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <FaChartLine className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart visualization will be implemented here</p>
            <p className="text-sm text-gray-400">Install recharts library for interactive charts</p>
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <FaUsers className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{performer.name}</p>
                    <p className="text-gray-500 text-xs">{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{performer.sales} sales</p>
                  <p className="text-gray-500 text-xs">${performer.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Performance</h3>
            <FaCar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {vehicleMetrics.map((vehicle, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {vehicle.make} {vehicle.model}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {vehicle.averageDaysToSell} days avg
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-500">Views</p>
                    <p className="font-medium">{vehicle.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Inquiries</p>
                    <p className="font-medium">{vehicle.inquiries}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sales</p>
                    <p className="font-medium">{vehicle.conversions}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Conversion Rate</span>
                    <span className="font-medium">
                      {((vehicle.conversions / vehicle.inquiries) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(vehicle.conversions / vehicle.inquiries) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
