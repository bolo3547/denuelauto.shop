import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  lastCheck: string;
}

interface SupportTicket {
  id: string;
  title: string;
  requester: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  category: string;
}

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: string;
  lastRun: string;
  nextRun: string;
}

export default function ITPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [backups, setBackups] = useState<BackupJob[]>([]);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setSystems([
      { name: 'Main Server', status: 'operational', uptime: '99.99%', lastCheck: '2 min ago' },
      { name: 'Database Server', status: 'operational', uptime: '99.95%', lastCheck: '2 min ago' },
      { name: 'Email Server', status: 'operational', uptime: '99.90%', lastCheck: '2 min ago' },
      { name: 'Backup Server', status: 'degraded', uptime: '98.50%', lastCheck: '5 min ago' },
      { name: 'Website', status: 'operational', uptime: '99.99%', lastCheck: '1 min ago' },
      { name: 'API Gateway', status: 'operational', uptime: '99.97%', lastCheck: '1 min ago' },
    ]);

    setTickets([
      { id: 'TKT-001', title: 'Cannot access email', requester: 'John Sales', department: 'Sales', priority: 'high', status: 'in-progress', createdAt: '2024-12-10 09:30', category: 'Email' },
      { id: 'TKT-002', title: 'Printer not working', requester: 'Sarah HR', department: 'HR', priority: 'medium', status: 'open', createdAt: '2024-12-10 10:15', category: 'Hardware' },
      { id: 'TKT-003', title: 'Software installation request', requester: 'Mike Marketing', department: 'Marketing', priority: 'low', status: 'open', createdAt: '2024-12-10 11:00', category: 'Software' },
      { id: 'TKT-004', title: 'VPN connection issues', requester: 'Lisa Finance', department: 'Finance', priority: 'high', status: 'resolved', createdAt: '2024-12-09 14:30', category: 'Network' },
      { id: 'TKT-005', title: 'New user account setup', requester: 'Tom HR', department: 'HR', priority: 'medium', status: 'in-progress', createdAt: '2024-12-10 08:00', category: 'Account' },
    ]);

    setBackups([
      { id: '1', name: 'Database Full Backup', type: 'full', status: 'completed', size: '45.2 GB', lastRun: '2024-12-10 02:00', nextRun: '2024-12-11 02:00' },
      { id: '2', name: 'File Server Incremental', type: 'incremental', status: 'completed', size: '2.1 GB', lastRun: '2024-12-10 04:00', nextRun: '2024-12-11 04:00' },
      { id: '3', name: 'Email Backup', type: 'differential', status: 'running', size: '-- GB', lastRun: 'In progress', nextRun: '2024-12-11 03:00' },
      { id: '4', name: 'System State Backup', type: 'full', status: 'scheduled', size: '-- GB', lastRun: '2024-12-09 06:00', nextRun: '2024-12-12 06:00' },
    ]);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'monitoring', label: 'Monitoring', icon: '📡' },
    { id: 'tickets', label: 'Support Tickets', icon: '🎫' },
    { id: 'backups', label: 'Backups', icon: '💾' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'assets', label: 'IT Assets', icon: '💻' },
  ];

  return (
    <>
      <Head>
        <title>IT Department | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-xl">💻</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">IT Department</h1>
                  <p className="text-slate-400 text-xs">System Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  All Systems Operational
                </span>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition">
                  + New Ticket
                </button>
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
                    ? 'bg-cyan-600 text-white'
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
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📡</span>
                    <span className="text-slate-400 text-sm">Systems Online</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{systems.filter(s => s.status === 'operational').length}/{systems.length}</p>
                  <p className="text-green-400 text-xs mt-1">All critical systems up</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎫</span>
                    <span className="text-slate-400 text-sm">Open Tickets</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}</p>
                  <p className="text-yellow-400 text-xs mt-1">{tickets.filter(t => t.priority === 'high' || t.priority === 'critical').length} high priority</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💾</span>
                    <span className="text-slate-400 text-sm">Last Backup</span>
                  </div>
                  <p className="text-white text-2xl font-bold">2h ago</p>
                  <p className="text-green-400 text-xs mt-1">All backups successful</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <span className="text-slate-400 text-sm">Security Status</span>
                  </div>
                  <p className="text-white text-2xl font-bold">Secure</p>
                  <p className="text-green-400 text-xs mt-1">No threats detected</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">System Status</h3>
                  <div className="space-y-3">
                    {systems.map((system) => (
                      <div key={system.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${
                            system.status === 'operational' ? 'bg-green-500' :
                            system.status === 'degraded' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></span>
                          <span className="text-white">{system.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 text-sm">{system.uptime}</span>
                          <span className={`px-2 py-1 text-xs rounded capitalize ${
                            system.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                            system.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {system.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Tickets</h3>
                  <div className="space-y-3">
                    {tickets.slice(0, 4).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{ticket.title}</p>
                          <p className="text-slate-400 text-xs">{ticket.requester} • {ticket.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                            ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-600 text-slate-400'
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                            ticket.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">CPU Usage</h3>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Main Server</span>
                      <span className="text-cyan-400 font-bold">45%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-cyan-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Database Server</span>
                      <span className="text-cyan-400 font-bold">68%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-cyan-500 h-3 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Memory Usage</h3>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Main Server</span>
                      <span className="text-green-400 font-bold">32%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Database Server</span>
                      <span className="text-yellow-400 font-bold">78%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Disk Usage</h3>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Main Server</span>
                      <span className="text-purple-400 font-bold">56%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{ width: '56%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Database Server</span>
                      <span className="text-orange-400 font-bold">82%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-orange-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Service Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Web Server', status: 'running', icon: '🌐' },
                    { name: 'Database', status: 'running', icon: '💾' },
                    { name: 'Cache Server', status: 'running', icon: '⚡' },
                    { name: 'Queue Worker', status: 'running', icon: '📋' },
                    { name: 'Email Service', status: 'running', icon: '📧' },
                    { name: 'Scheduler', status: 'running', icon: '⏰' },
                    { name: 'File Service', status: 'warning', icon: '📁' },
                    { name: 'Logging', status: 'running', icon: '📝' },
                  ].map((service) => (
                    <div key={service.name} className="p-4 bg-slate-700/30 rounded-lg text-center">
                      <span className="text-3xl mb-2 block">{service.icon}</span>
                      <p className="text-white font-medium text-sm">{service.name}</p>
                      <span className={`px-2 py-1 text-xs rounded mt-2 inline-block ${
                        service.status === 'running' ? 'bg-green-500/20 text-green-400' :
                        service.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">Support Tickets</h3>
                <div className="flex gap-2">
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Status</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Priority</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Ticket</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Requester</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Category</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Priority</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{ticket.title}</p>
                        <p className="text-slate-400 text-xs">{ticket.id} • {ticket.createdAt}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-300 text-sm">{ticket.requester}</p>
                        <p className="text-slate-400 text-xs">{ticket.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-600 text-slate-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                          ticket.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                          ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-600 text-slate-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-cyan-400 hover:text-cyan-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Assign</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Backup Jobs</h3>
                  <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">
                    + Create Backup
                  </button>
                </div>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          backup.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          backup.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                          backup.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600 text-slate-400'
                        }`}>
                          <span className="text-2xl">💾</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{backup.name}</p>
                          <p className="text-slate-400 text-xs capitalize">{backup.type} backup</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Size</p>
                          <p className="text-white font-medium">{backup.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Last Run</p>
                          <p className="text-white">{backup.lastRun}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Next Run</p>
                          <p className="text-white">{backup.nextRun}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded capitalize ${
                          backup.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          backup.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                          backup.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600 text-slate-400'
                        }`}>
                          {backup.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">Total Backup Storage</p>
                  <p className="text-white text-2xl font-bold">245 GB</p>
                  <p className="text-cyan-400 text-xs">of 500 GB used</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">Successful Backups</p>
                  <p className="text-green-400 text-2xl font-bold">98.5%</p>
                  <p className="text-slate-400 text-xs">Last 30 days</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">Retention Period</p>
                  <p className="text-white text-2xl font-bold">30 Days</p>
                  <p className="text-slate-400 text-xs">Full backups</p>
                </div>
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Network Status</p>
                  <p className="text-green-400 text-xl font-bold">Healthy</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Connected Devices</p>
                  <p className="text-white text-xl font-bold">47</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Bandwidth Usage</p>
                  <p className="text-cyan-400 text-xl font-bold">125 Mbps</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">VPN Connections</p>
                  <p className="text-white text-xl font-bold">8</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Network Devices</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Main Router', ip: '192.168.1.1', status: 'online', type: 'Router' },
                    { name: 'Core Switch', ip: '192.168.1.2', status: 'online', type: 'Switch' },
                    { name: 'Firewall', ip: '192.168.1.3', status: 'online', type: 'Security' },
                    { name: 'Wireless AP 1', ip: '192.168.1.10', status: 'online', type: 'Access Point' },
                    { name: 'Wireless AP 2', ip: '192.168.1.11', status: 'offline', type: 'Access Point' },
                  ].map((device) => (
                    <div key={device.name} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <div>
                          <p className="text-white font-medium">{device.name}</p>
                          <p className="text-slate-400 text-xs">{device.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-mono text-sm">{device.ip}</span>
                        <span className={`px-2 py-1 text-xs rounded ${device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {device.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Security Score</p>
                  <p className="text-green-400 text-2xl font-bold">92/100</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Threats Blocked</p>
                  <p className="text-white text-2xl font-bold">1,245</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Failed Logins</p>
                  <p className="text-yellow-400 text-2xl font-bold">23</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Last Scan</p>
                  <p className="text-white text-2xl font-bold">2h ago</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Security Alerts</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Multiple failed login attempts', severity: 'medium', time: '1 hour ago', source: '192.168.1.105' },
                    { title: 'Unusual network traffic detected', severity: 'low', time: '3 hours ago', source: 'Firewall' },
                    { title: 'Software update available', severity: 'info', time: '5 hours ago', source: 'System' },
                  ].map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{alert.title}</p>
                        <p className="text-slate-400 text-xs">Source: {alert.source} • {alert.time}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        alert.severity === 'low' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-600 text-slate-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* IT Assets Tab */}
          {activeTab === 'assets' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">IT Assets</h3>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">
                  + Add Asset
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Asset</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Type</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Assigned To</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'LAP-001', name: 'Dell Latitude 5520', type: 'Laptop', assignedTo: 'John Smith', status: 'In Use' },
                    { id: 'DES-003', name: 'HP ProDesk 400', type: 'Desktop', assignedTo: 'Reception', status: 'In Use' },
                    { id: 'MON-015', name: 'Dell 27" Monitor', type: 'Monitor', assignedTo: 'Sarah HR', status: 'In Use' },
                    { id: 'PRN-002', name: 'HP LaserJet Pro', type: 'Printer', assignedTo: 'Shared', status: 'In Use' },
                    { id: 'LAP-005', name: 'Lenovo ThinkPad', type: 'Laptop', assignedTo: '-', status: 'Available' },
                  ].map((asset) => (
                    <tr key={asset.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{asset.name}</p>
                        <p className="text-slate-400 text-xs">{asset.id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{asset.type}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{asset.assignedTo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          asset.status === 'In Use' ? 'bg-green-500/20 text-green-400' :
                          asset.status === 'Available' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-cyan-400 hover:text-cyan-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
