import React, { useState, useEffect } from 'react';
import { 
  FaCar, FaHeart, FaShoppingCart, FaEye, FaSearch, FaBell,
  FaChartLine, FaClock, FaMapMarkerAlt, FaDollarSign,
  FaStar, FaComment, FaDownload, FaFilter, FaGlobe
} from 'react-icons/fa';

interface BuyerDashboardData {
  totalFavorites: number;
  totalOrders: number;
  totalInquiries: number;
  totalViewed: number;
  recentActivity: Activity[];
  priceAlerts: PriceAlert[];
  recommendedCars: Car[];
  orderSummary: OrderSummary[];
}

interface Activity {
  id: string;
  type: 'favorite' | 'inquiry' | 'order' | 'view';
  carInfo: {
    make: string;
    model: string;
    year: number;
    stockNo: string;
  };
  timestamp: string;
  description: string;
}

interface PriceAlert {
  id: string;
  searchCriteria: string;
  currentLowest: number;
  previousLowest: number;
  changePercent: number;
  carsCount: number;
}

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image: string;
  location: string;
  matchReason: string;
}

interface OrderSummary {
  month: string;
  orders: number;
  amount: number;
}

export default function BuyerDashboard() {
  const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: BuyerDashboardData = {
        totalFavorites: 12,
        totalOrders: 3,
        totalInquiries: 8,
        totalViewed: 45,
        recentActivity: [
          {
            id: '1',
            type: 'favorite',
            carInfo: { make: 'Toyota', model: 'Camry', year: 2020, stockNo: 'TC001' },
            timestamp: '2024-12-01T10:30:00Z',
            description: 'Added to favorites'
          },
          {
            id: '2',
            type: 'inquiry',
            carInfo: { make: 'Honda', model: 'CR-V', year: 2019, stockNo: 'HN002' },
            timestamp: '2024-11-30T15:45:00Z',
            description: 'Sent inquiry about shipping costs'
          },
          {
            id: '3',
            type: 'order',
            carInfo: { make: 'Lexus', model: 'NX300', year: 2021, stockNo: 'LX003' },
            timestamp: '2024-11-29T09:15:00Z',
            description: 'Order placed - processing'
          }
        ],
        priceAlerts: [
          {
            id: '1',
            searchCriteria: 'Toyota Camry 2018-2021',
            currentLowest: 18500,
            previousLowest: 19200,
            changePercent: -3.6,
            carsCount: 24
          },
          {
            id: '2',
            searchCriteria: 'Honda SUVs under $25k',
            currentLowest: 22000,
            previousLowest: 21800,
            changePercent: 0.9,
            carsCount: 18
          }
        ],
        recommendedCars: [
          {
            id: '1',
            stockNo: 'TC004',
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            price: 16500,
            mileage: 38000,
            image: '/api/placeholder/300/200',
            location: 'Japan',
            matchReason: 'Matches your budget and preferred makes'
          },
          {
            id: '2',
            stockNo: 'HN005',
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            price: 17800,
            mileage: 42000,
            image: '/api/placeholder/300/200',
            location: 'Japan',
            matchReason: 'Similar to your recent searches'
          }
        ],
        orderSummary: [
          { month: 'Aug', orders: 0, amount: 0 },
          { month: 'Sep', orders: 1, amount: 18500 },
          { month: 'Oct', orders: 0, amount: 0 },
          { month: 'Nov', orders: 2, amount: 46000 },
          { month: 'Dec', orders: 0, amount: 0 }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'favorite': return <FaHeart className="text-red-500" />;
      case 'inquiry': return <FaComment className="text-blue-500" />;
      case 'order': return <FaShoppingCart className="text-green-500" />;
      case 'view': return <FaEye className="text-gray-500" />;
      default: return <FaCar className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your activity overview.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                aria-label="Select timeframe"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border rounded-lg px-3 py-2 bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <FaDownload /> Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalFavorites}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaHeart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalInquiries}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaComment className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cars Viewed</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalViewed}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaEye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaClock /> Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {activity.carInfo.make} {activity.carInfo.model} {activity.carInfo.year}
                      </p>
                      <p className="text-sm text-gray-600">Stock: {activity.carInfo.stockNo}</p>
                      <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                View All Activity
              </button>
            </div>
          </div>

          {/* Price Alerts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaBell /> Price Alerts
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.priceAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm">{alert.searchCriteria}</h4>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">{formatCurrency(alert.currentLowest)}</p>
                        <p className="text-xs text-gray-600">{alert.carsCount} cars available</p>
                      </div>
                      <div className={`text-right ${alert.changePercent < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <p className="text-sm font-medium">
                          {alert.changePercent > 0 ? '+' : ''}{alert.changePercent.toFixed(1)}%
                        </p>
                        <p className="text-xs">vs last week</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Manage Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Order History Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FaChartLine /> Order History
          </h3>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.orderSummary.reduce((sum, item) => sum + item.orders, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.orderSummary.reduce((sum, item) => sum + item.amount, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.orderSummary.length}
                </div>
                <div className="text-sm text-gray-600">Months Active</div>
              </div>
            </div>
            
            {/* Monthly Breakdown */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Month</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Orders</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Amount</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.orderSummary.map((item, index) => {
                    const prevAmount = index > 0 ? dashboardData.orderSummary[index - 1].amount : item.amount;
                    const trend = prevAmount > 0 ? ((item.amount - prevAmount) / prevAmount * 100).toFixed(1) : '0';
                    const isPositive = Number(trend) >= 0;
                    return (
                      <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{item.month}</td>
                        <td className="py-3 px-2 text-right">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                            {item.orders}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-green-600 font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '↑' : '↓'} {Math.abs(Number(trend))}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recommended Cars */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaCar /> Recommended For You
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardData.recommendedCars.map((car) => (
                <div key={car.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-lg">
                      {car.make} {car.model} {car.year}
                    </h4>
                    <p className="text-blue-600 font-bold text-xl mt-2">
                      {formatCurrency(car.price)}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                      <span>{car.mileage.toLocaleString()} km</span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {car.location}
                      </span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      {car.matchReason}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                        View Details
                      </button>
                      <button
                        type="button"
                        className="bg-gray-100 text-gray-600 py-2 px-4 rounded hover:bg-gray-200"
                        aria-label="Add to favorites"
                        title="Add to favorites"
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">
              View More Recommendations
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-2">Browse New Inventory</h3>
            <p className="text-blue-100 text-sm mb-4">Check out our latest car arrivals</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
              <FaSearch /> Browse Cars
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-2">Get Shipping Quote</h3>
            <p className="text-green-100 text-sm mb-4">Calculate costs for any car</p>
            <button className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-50 flex items-center gap-2">
              <FaDollarSign /> Get Quote
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-purple-100 text-sm mb-4">Need help? We're here for you</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-purple-50 flex items-center gap-2">
              <FaComment /> Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}