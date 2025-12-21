'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaGlobe, 
  FaUsers, 
  FaCreditCard, 
  FaChartLine,
  FaShieldAlt,
  FaCog,
  FaDatabase,
  FaServer,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSync
} from 'react-icons/fa';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    responseTime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    requestsPerMinute: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usedSpace: number;
    totalSpace: number;
  };
  cache: {
    status: 'healthy' | 'warning' | 'error';
    hitRate: number;
    memoryUsage: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'tenant_created' | 'payment_received' | 'system_error' | 'security_alert';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function SuperAdminSystemMonitoring() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    
    // Set up real-time monitoring (poll every 30 seconds)
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      // Mock system health data
      const mockSystemHealth: SystemHealth = {
        database: {
          status: 'healthy',
          connections: 15,
          responseTime: 45
        },
        api: {
          status: 'healthy',
          uptime: 99.98,
          requestsPerMinute: 1250
        },
        storage: {
          status: 'warning',
          usedSpace: 450,
          totalSpace: 500
        },
        cache: {
          status: 'healthy',
          hitRate: 94.5,
          memoryUsage: 65
        }
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'tenant_created',
          message: 'New tenant "AutoDeals Uganda" created by john@example.com',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'payment_received',
          message: 'Payment of $299 received from tenant "CarMax Kenya"',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          severity: 'info'
        },
        {
          id: '3',
          type: 'system_error',
          message: 'Failed payment attempt for tenant "Motors Ltd" - insufficient funds',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          severity: 'warning'
        },
        {
          id: '4',
          type: 'security_alert',
          message: 'Multiple failed login attempts from IP 192.168.1.100',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          severity: 'error'
        }
      ];

      setSystemHealth(mockSystemHealth);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaSync className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600">Monitor system health and performance metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadSystemData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaSync className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Health Overview */}
        {systemHealth && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Database Health */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaDatabase className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Database</span>
                  </div>
                  {getStatusIcon(systemHealth.database.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connections:</span>
                    <span className="font-medium">{systemHealth.database.connections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">{systemHealth.database.responseTime}ms</span>
                  </div>
                </div>
                
                <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status.toUpperCase()}
                </div>
              </div>

              {/* API Health */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaServer className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">API Server</span>
                  </div>
                  {getStatusIcon(systemHealth.api.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">{systemHealth.api.uptime}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requests/min:</span>
                    <span className="font-medium">{systemHealth.api.requestsPerMinute}</span>
                  </div>
                </div>
                
                <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(systemHealth.api.status)}`}>
                  {systemHealth.api.status.toUpperCase()}
                </div>
              </div>

              {/* Storage Health */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaGlobe className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Storage</span>
                  </div>
                  {getStatusIcon(systemHealth.storage.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium">{systemHealth.storage.usedSpace}GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{systemHealth.storage.totalSpace}GB</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(systemHealth.storage.usedSpace / systemHealth.storage.totalSpace) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(systemHealth.storage.status)}`}>
                  {systemHealth.storage.status.toUpperCase()}
                </div>
              </div>

              {/* Cache Health */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaChartLine className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Cache</span>
                  </div>
                  {getStatusIcon(systemHealth.cache.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hit Rate:</span>
                    <span className="font-medium">{systemHealth.cache.hitRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-medium">{systemHealth.cache.memoryUsage}%</span>
                  </div>
                </div>
                
                <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(systemHealth.cache.status)}`}>
                  {systemHealth.cache.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'tenant_created' && <FaUsers className={`w-5 h-5 ${getSeverityColor(activity.severity)}`} />}
                    {activity.type === 'payment_received' && <FaCreditCard className={`w-5 h-5 ${getSeverityColor(activity.severity)}`} />}
                    {activity.type === 'system_error' && <FaExclamationTriangle className={`w-5 h-5 ${getSeverityColor(activity.severity)}`} />}
                    {activity.type === 'security_alert' && <FaShieldAlt className={`w-5 h-5 ${getSeverityColor(activity.severity)}`} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaCog className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Auto Backup</div>
                    <div className="text-sm text-gray-500">Daily at 2:00 AM UTC</div>
                  </div>
                </div>
                <div className="text-green-600 font-medium">Enabled</div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">SSL Certificate</div>
                    <div className="text-sm text-gray-500">Valid until Mar 15, 2026</div>
                  </div>
                </div>
                <div className="text-green-600 font-medium">Valid</div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaDatabase className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Database Version</div>
                    <div className="text-sm text-gray-500">PostgreSQL 14.9</div>
                  </div>
                </div>
                <div className="text-green-600 font-medium">Current</div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaServer className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Server Load</div>
                    <div className="text-sm text-gray-500">CPU usage across nodes</div>
                  </div>
                </div>
                <div className="text-yellow-600 font-medium">65%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          
          <div className="text-center text-gray-500">
            <FaChartLine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Performance charts would be implemented here</p>
            <p className="text-sm">Integration with monitoring services like Grafana, New Relic, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}