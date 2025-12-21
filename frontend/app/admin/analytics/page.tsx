'use client';

import { useState } from 'react';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  const analytics = {
    visitors: {
      total: 12543,
      change: 12.5,
      data: [1200, 1350, 1180, 1420, 1380, 1520, 1480],
    },
    pageViews: {
      total: 45231,
      change: 8.2,
      data: [4200, 4800, 4500, 5200, 4900, 5400, 5100],
    },
    inquiries: {
      total: 156,
      change: 15.3,
      data: [12, 18, 15, 22, 20, 25, 23],
    },
    popularCars: [
      { name: 'Toyota Harrier', views: 1250, inquiries: 23 },
      { name: 'Honda CR-V', views: 980, inquiries: 18 },
      { name: 'Nissan Patrol', views: 850, inquiries: 15 },
      { name: 'Mitsubishi Pajero', views: 720, inquiries: 12 },
      { name: 'Toyota Land Cruiser', views: 680, inquiries: 10 },
    ],
    trafficSources: [
      { source: 'Direct', visitors: 4521, percentage: 36 },
      { source: 'Search Engines', visitors: 3215, percentage: 26 },
      { source: 'Social Media', visitors: 2156, percentage: 17 },
      { source: 'Referrals', visitors: 1890, percentage: 15 },
      { source: 'Email', visitors: 761, percentage: 6 },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your website performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          title="Analytics time range"
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.visitors.total.toLocaleString()}
              </p>
            </div>
            <div className="text-green-600">
              <span className="text-sm font-medium">+{analytics.visitors.change}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.pageViews.total.toLocaleString()}
              </p>
            </div>
            <div className="text-green-600">
              <span className="text-sm font-medium">+{analytics.pageViews.change}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.inquiries.total}
              </p>
            </div>
            <div className="text-green-600">
              <span className="text-sm font-medium">+{analytics.inquiries.change}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Traffic Overview</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Cars */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Most Popular Cars</h2>
          <div className="space-y-4">
            {analytics.popularCars.map((car, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{car.name}</p>
                  <p className="text-sm text-gray-600">
                    {car.views} views • {car.inquiries} inquiries
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(car.views / analytics.popularCars[0].views) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
          <div className="space-y-4">
            {analytics.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{source.source}</p>
                  <p className="text-sm text-gray-600">
                    {source.visitors.toLocaleString()} visitors
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {source.percentage}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
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