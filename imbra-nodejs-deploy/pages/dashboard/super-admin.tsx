import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export default function SuperAdminPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    siteName: '',
    timezone: 'UTC',
    currency: 'USD',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setUsers([
      { id: '1', name: 'John Admin', email: 'john@dealer.com', role: 'Super Admin', status: 'active', lastLogin: '2 mins ago' },
      { id: '2', name: 'Sarah Manager', email: 'sarah@dealer.com', role: 'Marketing', status: 'active', lastLogin: '1 hour ago' },
      { id: '3', name: 'Mike Accountant', email: 'mike@dealer.com', role: 'Accounting', status: 'active', lastLogin: '3 hours ago' },
      { id: '4', name: 'Lisa HR', email: 'lisa@dealer.com', role: 'HR', status: 'inactive', lastLogin: '2 days ago' },
      { id: '5', name: 'Tom IT', email: 'tom@dealer.com', role: 'IT', status: 'active', lastLogin: '30 mins ago' },
    ]);

    setAuditLogs([
      { id: '1', action: 'User Login', user: 'John Admin', timestamp: '2 mins ago', details: 'Successful login from 192.168.1.1' },
      { id: '2', action: 'Settings Changed', user: 'John Admin', timestamp: '1 hour ago', details: 'Updated email notifications' },
      { id: '3', action: 'User Created', user: 'Sarah Manager', timestamp: '3 hours ago', details: 'Created new agent account' },
      { id: '4', action: 'Car Added', user: 'Mike Sales', timestamp: '5 hours ago', details: 'Added Toyota Camry 2024' },
    ]);

    const tenant = localStorage.getItem('tenantData');
    if (tenant) {
      const parsed = JSON.parse(tenant);
      setSystemSettings(prev => ({ ...prev, siteName: parsed.name || 'My Dealership' }));
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
  ];

  return (
    <>
      <Head>
        <title>Super Admin | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Super Admin Portal</h1>
                  <p className="text-slate-400 text-xs">Full system control</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: '12', icon: '👥', change: '+2 this month' },
                  { label: 'Active Sessions', value: '5', icon: '🟢', change: 'Currently online' },
                  { label: 'API Calls Today', value: '1,234', icon: '🔌', change: '+15% from yesterday' },
                  { label: 'Storage Used', value: '2.4 GB', icon: '💾', change: 'of 10 GB' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-slate-400 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
                          📝
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{log.action}</p>
                          <p className="text-slate-400 text-xs">{log.user} • {log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">System Health</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Server Status', status: 'Operational', color: 'green' },
                      { label: 'Database', status: 'Healthy', color: 'green' },
                      { label: 'API Gateway', status: 'Operational', color: 'green' },
                      { label: 'File Storage', status: 'Operational', color: 'green' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">{item.label}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">User Management</h3>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
                  + Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">User</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Role</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Last Login</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{user.name}</p>
                              <p className="text-slate-400 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{user.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{user.lastLogin}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                            <button className="px-2 py-1 text-red-400 hover:text-red-300 text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-6">System Settings</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Site Name</label>
                  <input
                    type="text"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Timezone</label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                      <option>UTC</option>
                      <option>Africa/Lusaka</option>
                      <option>America/New_York</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Currency</label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                      <option>USD</option>
                      <option>ZMW</option>
                      <option>EUR</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={systemSettings.emailNotifications} className="w-4 h-4 rounded" />
                    <span className="text-slate-300">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={systemSettings.smsNotifications} className="w-4 h-4 rounded" />
                    <span className="text-slate-300">SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={systemSettings.maintenanceMode} className="w-4 h-4 rounded" />
                    <span className="text-slate-300">Maintenance Mode</span>
                  </label>
                </div>
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg border border-purple-500/30">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Professional Plan</p>
                    <p className="text-white text-2xl font-bold">$99/month</p>
                    <p className="text-slate-400 text-sm">Next billing: Jan 1, 2025</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                    Upgrade Plan
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Payment History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Dec 1, 2024', amount: '$99.00', status: 'Paid' },
                    { date: 'Nov 1, 2024', amount: '$99.00', status: 'Paid' },
                    { date: 'Oct 1, 2024', amount: '$99.00', status: 'Paid' },
                  ].map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">{payment.date}</span>
                      <span className="text-white font-medium">{payment.amount}</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">{payment.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-bold">Audit Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Action</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">User</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Details</th>
                      <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-t border-slate-700/50">
                        <td className="px-4 py-3 text-white text-sm">{log.action}</td>
                        <td className="px-4 py-3 text-slate-300 text-sm">{log.user}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{log.details}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold">API Keys</h3>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
                  + Generate New Key
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Production Key', key: 'sk_live_****************************1234', created: 'Nov 15, 2024' },
                  { name: 'Development Key', key: 'sk_test_****************************5678', created: 'Oct 1, 2024' },
                ].map((apiKey, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{apiKey.name}</p>
                      <p className="text-slate-400 text-sm font-mono">{apiKey.key}</p>
                      <p className="text-slate-500 text-xs mt-1">Created: {apiKey.created}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm">Copy</button>
                      <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm">Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
