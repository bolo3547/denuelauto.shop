import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  salesThisMonth: number;
  totalSales: number;
  commission: number;
  rating: number;
  leads: number;
  avatar?: string;
}

interface Deal {
  id: string;
  car: string;
  customer: string;
  salePrice: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  agent: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  interest: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  assignedDate: string;
}

export default function AgentsPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setAgents([
      { id: '1', name: 'Michael Johnson', email: 'michael@dealer.com', phone: '+1234567890', status: 'active', salesThisMonth: 8, totalSales: 125, commission: 15200, rating: 4.8, leads: 12 },
      { id: '2', name: 'Sarah Williams', email: 'sarah@dealer.com', phone: '+1234567891', status: 'active', salesThisMonth: 6, totalSales: 98, commission: 11800, rating: 4.6, leads: 8 },
      { id: '3', name: 'David Chen', email: 'david@dealer.com', phone: '+1234567892', status: 'active', salesThisMonth: 10, totalSales: 145, commission: 18500, rating: 4.9, leads: 15 },
      { id: '4', name: 'Emily Brown', email: 'emily@dealer.com', phone: '+1234567893', status: 'pending', salesThisMonth: 0, totalSales: 0, commission: 0, rating: 0, leads: 5 },
      { id: '5', name: 'James Wilson', email: 'james@dealer.com', phone: '+1234567894', status: 'inactive', salesThisMonth: 0, totalSales: 67, commission: 8200, rating: 4.2, leads: 0 },
    ]);

    setDeals([
      { id: 'D001', car: '2024 Toyota Camry', customer: 'John Smith', salePrice: 35000, commission: 1750, status: 'completed', date: '2024-12-10', agent: 'Michael Johnson' },
      { id: 'D002', car: '2023 Honda Accord', customer: 'Mary Johnson', salePrice: 32000, commission: 1600, status: 'completed', date: '2024-12-09', agent: 'Sarah Williams' },
      { id: 'D003', car: '2024 BMW X5', customer: 'Robert Davis', salePrice: 65000, commission: 3250, status: 'pending', date: '2024-12-10', agent: 'David Chen' },
      { id: 'D004', car: '2024 Ford F-150', customer: 'Lisa Anderson', salePrice: 48000, commission: 2400, status: 'completed', date: '2024-12-08', agent: 'Michael Johnson' },
      { id: 'D005', car: '2023 Mercedes C-Class', customer: 'Tom Wilson', salePrice: 55000, commission: 2750, status: 'cancelled', date: '2024-12-07', agent: 'Sarah Williams' },
    ]);

    setLeads([
      { id: 'L001', name: 'Peter Parker', phone: '+1234567895', interest: 'SUV under $40k', status: 'new', source: 'Website', assignedDate: '2024-12-10' },
      { id: 'L002', name: 'Bruce Wayne', phone: '+1234567896', interest: 'Luxury Sedan', status: 'contacted', source: 'Referral', assignedDate: '2024-12-09' },
      { id: 'L003', name: 'Clark Kent', phone: '+1234567897', interest: 'Family Car', status: 'qualified', source: 'Walk-in', assignedDate: '2024-12-08' },
      { id: 'L004', name: 'Tony Stark', phone: '+1234567898', interest: 'Sports Car', status: 'converted', source: 'Facebook', assignedDate: '2024-12-05' },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'agents', label: 'Agents', icon: '👤' },
    { id: 'deals', label: 'Deals', icon: '🤝' },
    { id: 'leads', label: 'Leads', icon: '🎯' },
    { id: 'commissions', label: 'Commissions', icon: '💰' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'territories', label: 'Territories', icon: '🗺️' },
  ];

  return (
    <>
      <Head>
        <title>Agents Portal | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Agents Portal</h1>
                  <p className="text-slate-400 text-xs">Sales Team Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddAgentModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition"
              >
                + Add Agent
              </button>
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
                    ? 'bg-orange-600 text-white'
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
                    <span className="text-2xl">👥</span>
                    <span className="text-slate-400 text-sm">Active Agents</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
                  <p className="text-green-400 text-xs mt-1">{agents.filter(a => a.status === 'pending').length} pending approval</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🤝</span>
                    <span className="text-slate-400 text-sm">Deals This Month</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{deals.filter(d => d.status === 'completed').length}</p>
                  <p className="text-green-400 text-xs mt-1">+15% from last month</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-slate-400 text-sm">Total Commissions</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(agents.reduce((sum, a) => sum + a.commission, 0))}</p>
                  <p className="text-orange-400 text-xs mt-1">This month</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-slate-400 text-sm">Open Leads</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length}</p>
                  <p className="text-blue-400 text-xs mt-1">{leads.filter(l => l.status === 'new').length} new today</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Top Performers</h3>
                  <div className="space-y-3">
                    {agents.filter(a => a.status === 'active').sort((a, b) => b.salesThisMonth - a.salesThisMonth).slice(0, 3).map((agent, idx) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                            idx === 1 ? 'bg-slate-400 text-slate-900' :
                            'bg-orange-700 text-orange-200'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{agent.name}</p>
                            <p className="text-slate-400 text-xs">{agent.salesThisMonth} sales this month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 font-bold">{formatCurrency(agent.commission)}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(agent.rating) ? 'text-yellow-400' : 'text-slate-600'}>⭐</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Deals */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Deals</h3>
                  <div className="space-y-3">
                    {deals.slice(0, 4).map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{deal.car}</p>
                          <p className="text-slate-400 text-xs">{deal.customer} • {deal.agent}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{formatCurrency(deal.salePrice)}</p>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            deal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            deal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {deal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Agents</h3>
                <select
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  aria-label="Filter agents by status"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Agent</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Contact</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Sales</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Commission</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Rating</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{agent.name}</p>
                            <p className="text-slate-400 text-xs">ID: {agent.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-300 text-sm">{agent.email}</p>
                        <p className="text-slate-400 text-xs">{agent.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-bold">{agent.salesThisMonth}</p>
                        <p className="text-slate-400 text-xs">{agent.totalSales} total</p>
                      </td>
                      <td className="px-4 py-3 text-orange-400 font-bold">{formatCurrency(agent.commission)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white">{agent.rating || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          agent.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-orange-400 hover:text-orange-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Deals</h3>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Deal</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Customer</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Agent</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Sale Price</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Commission</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{deal.car}</p>
                        <p className="text-slate-400 text-xs">{deal.id} • {deal.date}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{deal.customer}</td>
                      <td className="px-4 py-3 text-slate-300">{deal.agent}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">{formatCurrency(deal.salePrice)}</td>
                      <td className="px-4 py-3 text-orange-400 font-bold">{formatCurrency(deal.commission)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          deal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          deal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">Lead Management</h3>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">
                  + Add Lead
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Lead</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Interest</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Source</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Assigned</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-slate-400 text-xs">{lead.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{lead.interest}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{lead.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                          lead.status === 'qualified' ? 'bg-purple-500/20 text-purple-400' :
                          lead.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{lead.assignedDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-orange-400 hover:text-orange-300 text-sm">Contact</button>
                          <button className="text-slate-400 hover:text-white text-sm">Assign</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Total Due</p>
                  <p className="text-orange-400 text-2xl font-bold">{formatCurrency(45500)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Paid This Month</p>
                  <p className="text-green-400 text-2xl font-bold">{formatCurrency(32000)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Pending Approval</p>
                  <p className="text-yellow-400 text-2xl font-bold">{formatCurrency(8500)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Commission Rate</p>
                  <p className="text-white text-2xl font-bold">5%</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Commission Summary by Agent</h3>
                <div className="space-y-4">
                  {agents.filter(a => a.status === 'active').map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xl font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{agent.name}</p>
                          <p className="text-slate-400 text-sm">{agent.salesThisMonth} sales this month</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Earned</p>
                          <p className="text-orange-400 font-bold">{formatCurrency(agent.commission)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Pending</p>
                          <p className="text-yellow-400 font-bold">{formatCurrency(agent.commission * 0.2)}</p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                          Pay Out
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Sales Performance</h3>
                <div className="space-y-4">
                  {agents.filter(a => a.status === 'active').map((agent) => {
                    const target = 10;
                    const progress = (agent.salesThisMonth / target) * 100;
                    return (
                      <div key={agent.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white">{agent.name}</span>
                          <span className="text-slate-400">{agent.salesThisMonth}/{target} sales</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Conversion Rates</h3>
                  <div className="space-y-3">
                    {agents.filter(a => a.status === 'active').map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white">{agent.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold">{Math.floor(Math.random() * 30 + 20)}%</span>
                          <span className="text-xs text-slate-400">conversion</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Response Times</h3>
                  <div className="space-y-3">
                    {agents.filter(a => a.status === 'active').map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white">{agent.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">{Math.floor(Math.random() * 45 + 15)} min</span>
                          <span className="text-xs text-slate-400">avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Territories Tab */}
          {activeTab === 'territories' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Sales Territories</h3>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">
                  + Add Territory
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'North Region', agents: ['Michael Johnson'], sales: 45, revenue: 125000 },
                  { name: 'South Region', agents: ['Sarah Williams'], sales: 38, revenue: 98000 },
                  { name: 'East Region', agents: ['David Chen'], sales: 52, revenue: 145000 },
                  { name: 'West Region', agents: ['Emily Brown'], sales: 0, revenue: 0 },
                ].map((territory, idx) => (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{territory.name}</h4>
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Agents</span>
                        <span className="text-white">{territory.agents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sales</span>
                        <span className="text-white">{territory.sales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Revenue</span>
                        <span className="text-green-400 font-bold">{formatCurrency(territory.revenue)}</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition">
                      Manage Territory
                    </button>
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
