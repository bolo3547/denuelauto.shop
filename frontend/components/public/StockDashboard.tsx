"use client";
import React, { useState, useEffect } from 'react';
import { FaCar, FaMapMarkerAlt, FaWarehouse, FaChartBar, FaEye, FaClock } from 'react-icons/fa';
import {
  BarChartFix as BarChart,
  BarFix as Bar,
  XAxisFix as XAxis,
  YAxisFix as YAxis,
  TooltipFix as Tooltip,
  ResponsiveContainerFix as ResponsiveContainer,
  PieChartFix as PieChart,
  PieFix as Pie,
  CellFix as Cell,
  LegendFix as Legend,
} from '@/lib/recharts-fix';
import { makeApiUrl } from '@/lib/config/api';

interface StockDashboardProps {
  tenantSlug: string;
}

const clampPercentage = (value?: number | string) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numeric));
};

const StockDashboard: React.FC<StockDashboardProps> = ({ tenantSlug }) => {
  interface LocationItem { name: string; count: number; percentage: number; recent: number }
  interface CategoryItem { name: string; count: number; percentage: number }
  interface RecentItem { time: string | Date; action?: string; title?: string; location?: string }
  interface MakeItem { make: string; count: number; percentage: number }
  interface StockData {
    totalCars: number;
    locations: LocationItem[];
    categories: CategoryItem[];
    recentUpdates: RecentItem[];
    topMakes: MakeItem[];
  }

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await fetch(makeApiUrl(`/t/${tenantSlug}/public/stock`));
        if (res.ok) {
          const data = await res.json();
          // Convert updatedAt dates to human-friendly strings
          const mapped: StockData = {
            totalCars: data.totalCars || 0,
            locations: (data.locations || []).map((l: LocationItem) => ({ name: l.name || 'Unknown', count: l.count || 0, percentage: l.percentage || 0, recent: l.recent || 0 })),
            categories: (data.categories || []).map((c: CategoryItem) => ({ name: c.name || 'Unknown', count: c.count || 0, percentage: c.percentage || 0 })),
            recentUpdates: (data.recentUpdates || []).map((r: Partial<RecentItem>) => ({
              time: r.time ?? new Date().toISOString(),
              action: r.action ?? r.title ?? '',
              location: r.location ?? '',
            })),
            topMakes: (data.topMakes || []).map((m: MakeItem) => ({ make: m.make || 'Unknown', count: m.count || 0, percentage: m.percentage || 0 }))
          };
          setStockData(mapped);
          setError(null);
        } else {
          const text = await res.text();
          console.warn('Failed to fetch stock', res.statusText, text);
          setError(`Failed to fetch stock: ${res.status}`);
        }
      } catch (err) {
        console.warn('Error fetching stock', err);
        setError('Error fetching stock data');
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [tenantSlug]);

  const formatRelativeTime = (dateLike: string | Date) => {
    try {
      const d = new Date(dateLike);
      if (isNaN(d.getTime())) return String(dateLike);
      const diff = Date.now() - d.getTime();
      const mins = Math.round(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} min${mins>1?'s':''} ago`;
      const hrs = Math.round(mins / 60);
      if (hrs < 24) return `${hrs} hr${hrs>1?'s':''} ago`;
      const days = Math.round(hrs / 24);
      return `${days} day${days>1?'s':''} ago`;
    } catch (err) { return String(dateLike); }
  }

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockLocations: LocationItem[] = [
          { name: 'Japan', count: 8750, percentage: 56.7, recent: 245 },
          { name: 'Singapore', count: 2150, percentage: 13.9, recent: 89 },
          { name: 'UAE', count: 1890, percentage: 12.3, recent: 67 },
          { name: 'Thailand', count: 1230, percentage: 8.0, recent: 34 },
          { name: 'United Kingdom', count: 980, percentage: 6.4, recent: 28 },
          { name: 'Other', count: 420, percentage: 2.7, recent: 12 }
        ];
      const mockCategories: CategoryItem[] = [
          { name: 'SUV', count: 4520, percentage: 29.3 },
          { name: 'Sedan', count: 3890, percentage: 25.2 },
          { name: 'Truck', count: 2150, percentage: 13.9 },
          { name: 'Van', count: 1680, percentage: 10.9 },
          { name: 'Hatchback', count: 1420, percentage: 9.2 },
          { name: 'Other', count: 1760, percentage: 11.5 }
        ];
      const mockRecent: RecentItem[] = [
          { time: '2 min ago', action: 'New Toyota Prado added', location: 'Japan' },
          { time: '5 min ago', action: 'Honda Civic sold', location: 'Singapore' },
          { time: '8 min ago', action: 'Nissan Patrol updated', location: 'UAE' },
          { time: '12 min ago', action: 'Mitsubishi Pajero added', location: 'Japan' },
          { time: '15 min ago', action: 'Subaru Forester sold', location: 'Thailand' }
        ];
      const mockTopMakes: MakeItem[] = [
          { make: 'TOYOTA', count: 4250, percentage: 27.5 },
          { make: 'NISSAN', count: 3120, percentage: 20.2 },
          { make: 'HONDA', count: 2890, percentage: 18.7 },
          { make: 'MITSUBISHI', count: 1980, percentage: 12.8 },
          { make: 'MAZDA', count: 1650, percentage: 10.7 },
          { make: 'SUBARU', count: 1530, percentage: 9.9 }
        ];
      const totalCars = mockLocations.reduce((sum, loc) => sum + loc.count, 0);
      setStockData({
        totalCars,
        locations: mockLocations,
        categories: mockCategories,
        recentUpdates: mockRecent,
        topMakes: mockTopMakes,
      });
      setLoading(false);
    }, 1000);
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaWarehouse className="text-blue-600 text-xl" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Live Stock Dashboard</h3>
              <p className="text-sm text-gray-600">Real-time inventory across all locations</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{(stockData?.totalCars ?? 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Vehicles</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800" role="alert">
            {error}
          </div>
        )}
        {/* Stock by Location */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-green-600" />
            Stock by Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockData?.locations?.map((location: LocationItem, index: number) => {
              const percentage = clampPercentage(location.percentage);
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                      +{location.recent} today
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{Number(location.count ?? 0).toLocaleString()}</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                  <progress
                    value={percentage}
                    max={100}
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
                    aria-label={`Inventory percentage for ${location.name}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Makes */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-purple-600" />
            Top Makes in Stock
          </h4>
          <div className="space-y-3">
            {stockData?.topMakes?.map((make: MakeItem, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{make.make}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{Number(make.count ?? 0).toLocaleString()}</span>
                  <span className="text-sm text-gray-600 ml-2">({make.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Categories */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <FaCar className="text-orange-600" />
            Vehicle Categories
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stockData?.categories?.map((category: CategoryItem, index: number) => (
              <div key={index} className="text-center p-3 border rounded hover:bg-gray-50 transition-colors">
                <div className="text-lg font-bold text-gray-900">{Number(category.count ?? 0).toLocaleString()}</div>
                <div className="text-sm font-medium text-gray-700">{category.name}</div>
                <div className="text-xs text-gray-500">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <FaClock className="text-red-600" />
            Recent Updates
          </h4>
          <div className="space-y-2">
            {stockData?.recentUpdates?.map((update: RecentItem, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="flex-1">{update.action ?? update.title ?? 'Update recorded'}</span>
                <span className="text-gray-500">{update.location ?? 'Unknown'}</span>
                <span className="text-gray-400">{formatRelativeTime(update.time)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="pt-4 border-t">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <FaEye />
            View Complete Inventory
          </button>
        </div>
      </div>

        {/* Charts for locations & categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold mb-4">Top Makes Chart</h4>
            <div className="h-60 w-full">
              <ResponsiveContainer>
                <BarChart data={stockData?.topMakes || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="make" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold mb-4">Vehicle Categories</h4>
            <div className="h-60 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie outerRadius={80} data={stockData?.categories || []} dataKey="count" nameKey="name" label>
                    {(stockData?.categories || []).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={["#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#D946EF"][idx % 6]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    </div>
  );
};

export default StockDashboard;