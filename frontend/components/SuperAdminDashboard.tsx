import React, { useState } from 'react';
import {
  FaUsers,
  FaCar,
  FaDollarSign,
  FaChartLine,
  FaStore,
  FaBell,
  FaDownload,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaMapMarkerAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import {
  AreaChartFix as AreaChart,
  AreaFix as Area,
  PieChartFix as PieChart,
  PieFix as Pie,
  CellFix as Cell,
  XAxisFix as XAxis,
  YAxisFix as YAxis,
  CartesianGridFix as CartesianGrid,
  TooltipFix as Tooltip,
  LegendFix as Legend,
  ResponsiveContainerFix as ResponsiveContainer,
} from '@/lib/recharts-fix';

interface AdminStats {
  totalTenants: number;
  totalCars: number;
  totalBuyers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  pendingApprovals: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  carsCount: number;
  buyersCount: number;
  revenue: number;
  createdAt: string;
  lastActivity: string;
  contactEmail: string;
  contactPhone?: string;
  location?: string;
}

interface SystemActivity {
  id: string;
  type: 'user_registration' | 'car_added' | 'order_placed' | 'payment_processed' | 'system_alert';
  description: string;
  tenantName?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  
  const stats: AdminStats = {
    totalTenants: 47,
    totalCars: 12840,
    totalBuyers: 3256,
    totalRevenue: 485600,
    monthlyGrowth: 12.5,
    activeUsers: 892,
    pendingApprovals: 8,
    systemHealth: 'good'
  };

  const tenants: Tenant[] = [
    {
      id: '1',
      name: 'Premium Auto Japan',
      slug: 'premium-auto-japan',
      plan: 'enterprise',
      status: 'active',
      carsCount: 1250,
      buyersCount: 340,
      revenue: 125000,
      createdAt: '2024-01-15',
      lastActivity: '2024-12-05T14:30:00Z',
      contactEmail: 'admin@premiumautojapan.com',
      contactPhone: '+81-3-1234-5678',
      location: 'Tokyo, Japan'
    },
    {
      id: '2',
      name: 'Elite Motors Kenya',
      slug: 'elite-motors-kenya',
      plan: 'professional',
      status: 'active',
      carsCount: 680,
      buyersCount: 156,
      revenue: 68000,
      createdAt: '2024-02-20',
      lastActivity: '2024-12-05T12:15:00Z',
      contactEmail: 'info@elitemotorskenya.com',
      location: 'Nairobi, Kenya'
    },
    {
      id: '3',
      name: 'Auto Hub Zambia',
      slug: 'auto-hub-zambia',
      plan: 'starter',
      status: 'pending',
      carsCount: 45,
      buyersCount: 12,
      revenue: 0,
      createdAt: '2024-12-01',
      lastActivity: '2024-12-05T08:45:00Z',
      contactEmail: 'contact@autohubzambia.com',
      location: 'Lusaka, Zambia'
    }
  ];

  const recentActivity: SystemActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      description: 'New buyer registered: John Doe',
      tenantName: 'Premium Auto Japan',
      timestamp: '2024-12-05T14:30:00Z',
      severity: 'info'
    },
    {
      id: '2',
      type: 'order_placed',
      description: 'Order placed: Toyota Camry 2020 - $18,500',
      tenantName: 'Elite Motors Kenya',
      timestamp: '2024-12-05T13:45:00Z',
      severity: 'info'
    },
    {
      id: '3',
      type: 'system_alert',
      description: 'High CPU usage detected on server 2',
      timestamp: '2024-12-05T12:30:00Z',
      severity: 'warning'
    },
    {
      id: '4',
      type: 'payment_processed',
      description: 'Payment processed: $25,000 - Premium Auto Japan',
      tenantName: 'Premium Auto Japan',
      timestamp: '2024-12-05T11:20:00Z',
      severity: 'info'
    }
  ];

  const revenueData = [
    { month: 'Jul', revenue: 345000, tenants: 38 },
    { month: 'Aug', revenue: 368000, tenants: 42 },
    { month: 'Sep', revenue: 389000, tenants: 44 },
    { month: 'Oct', revenue: 425000, tenants: 46 },
    { month: 'Nov', revenue: 456000, tenants: 47 },
    { month: 'Dec', revenue: 485600, tenants: 47 }
  ];

  const planDistribution = [
    { name: 'Starter', value: 22, color: '#3B82F6' },
    { name: 'Professional', value: 18, color: '#10B981' },
    { name: 'Enterprise', value: 7, color: '#F59E0B' }
  ];

  const systemMetrics = [
    { metric: 'API Requests', current: '1.2M', change: '+15%', color: 'blue' },
    { metric: 'Database Size', current: '2.4GB', change: '+8%', color: 'green' },
    { metric: 'Active Sessions', current: '892', change: '+22%', color: 'purple' },
    { metric: 'Error Rate', current: '0.02%', change: '-45%', color: 'red' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <FaBell className="text-blue-500" />;
      case 'warning': return <FaBell className="text-yellow-500" />;
      case 'error': return <FaBell className="text-red-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform-wide analytics and management</p>
            </div>
            
            <div className="flex items-center gap-4">
              <label htmlFor="dashboard-timeframe" className="sr-only">
                Select timeframe
              </label>
              <select
                id="dashboard-timeframe"
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
                <FaDownload /> Export Report
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'tenants', label: 'Tenants', icon: FaStore },
                { id: 'system', label: 'System Health', icon: FaShieldAlt },
                { id: 'analytics', label: 'Analytics', icon: FaChartLine },
                { id: 'activity', label: 'Activity Log', icon: FaBell }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalTenants}</p>
                    <p className="text-sm text-green-600">+{stats.monthlyGrowth}% this month</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaStore className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cars</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCars.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+8.2% this month</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaCar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Buyers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBuyers.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+15.3% this month</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaUsers className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-sm text-green-600">+{stats.monthlyGrowth}% this month</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaDollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Revenue & Growth</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number | string) => [formatCurrency(value as number), 'Revenue']} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        fill="rgba(59, 130, 246, 0.1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Plan Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Plan Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">System Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">{metric.metric}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.current}</p>
                    <p className={`text-sm ${
                      metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Tenant Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
                <p className="text-gray-600">Manage all dealerships and their subscriptions</p>
              </div>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <FaPlus /> Add New Tenant
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  className="border rounded-lg px-3 py-2"
                  aria-label="Filter by plan"
                >
                  <option value="">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                
                <select
                  className="border rounded-lg px-3 py-2"
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">All Tenants ({tenants.length})</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cars</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Buyers</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.contactEmail}</div>
                            {tenant.location && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <FaMapMarkerAlt /> {tenant.location}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(tenant.plan)}`}>
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tenant.carsCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tenant.buyersCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(tenant.revenue)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(tenant.lastActivity)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="View"
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <FaEye aria-label="View" />
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <FaEdit aria-label="Edit" />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FaTrash aria-label="Delete" />
                            </button>
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

        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">System Status</h3>
                  <div className={`w-3 h-3 rounded-full ${
                    stats.systemHealth === 'good' ? 'bg-green-500' :
                    stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats.systemHealth}</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Active Users</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-sm text-green-600">+12% from yesterday</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Pending Approvals</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                <p className="text-sm text-yellow-600">Requires attention</p>
              </div>
            </div>

            {/* System Components */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">System Components</h3>
              <div className="space-y-4">
                {[
                  { name: 'API Gateway', status: 'operational', uptime: '99.9%', responseTime: '45ms' },
                  { name: 'Database', status: 'operational', uptime: '99.8%', responseTime: '12ms' },
                  { name: 'File Storage', status: 'operational', uptime: '99.9%', responseTime: '23ms' },
                  { name: 'Payment Gateway', status: 'degraded', uptime: '98.2%', responseTime: '89ms' },
                  { name: 'Email Service', status: 'operational', uptime: '99.7%', responseTime: '156ms' }
                ].map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        component.status === 'operational' ? 'bg-green-500' :
                        component.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-gray-600">
                      <span>Uptime: {component.uptime}</span>
                      <span>Response: {component.responseTime}</span>
                      <span className="capitalize">{component.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Activity Log Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">System Activity Log</h2>
                <p className="text-gray-600">Real-time system events and notifications</p>
              </div>
              
              <div className="flex gap-2">
                <label htmlFor="activity-type-filter" className="sr-only">
                  Filter by activity type
                </label>
                <select
                  id="activity-type-filter"
                  className="border rounded-lg px-3 py-2"
                  aria-label="Filter by activity type"
                >
                  <option value="">All Types</option>
                  <option value="user_registration">User Registration</option>
                  <option value="car_added">Car Added</option>
                  <option value="order_placed">Order Placed</option>
                  <option value="payment_processed">Payment</option>
                  <option value="system_alert">System Alert</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Refresh
                </button>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(activity.severity)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        {activity.tenantName && (
                          <p className="text-sm text-blue-600 mt-1">{activity.tenantName}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">{formatDateTime(activity.timestamp)}</p>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                        activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 text-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Load More Activity
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600 mb-6">Advanced analytics and trends coming soon.</p>
              {/* You can add analytics charts and widgets here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}