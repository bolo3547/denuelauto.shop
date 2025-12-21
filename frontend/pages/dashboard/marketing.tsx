import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'sms' | 'ads';
  status: 'active' | 'draft' | 'completed' | 'paused';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  interest: string;
  score: number;
  createdAt: string;
}

export default function MarketingPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setCampaigns([
      { id: '1', name: 'Holiday Car Sale', type: 'email', status: 'active', budget: 5000, spent: 3200, leads: 145, conversions: 23, startDate: '2024-12-01', endDate: '2024-12-31' },
      { id: '2', name: 'Facebook Retargeting', type: 'ads', status: 'active', budget: 3000, spent: 1800, leads: 89, conversions: 12, startDate: '2024-12-05', endDate: '2024-12-25' },
      { id: '3', name: 'New Year Promo SMS', type: 'sms', status: 'draft', budget: 1500, spent: 0, leads: 0, conversions: 0, startDate: '2024-12-26', endDate: '2025-01-05' },
      { id: '4', name: 'Instagram Campaign', type: 'social', status: 'completed', budget: 2000, spent: 2000, leads: 210, conversions: 31, startDate: '2024-11-01', endDate: '2024-11-30' },
    ]);

    setLeads([
      { id: '1', name: 'James Wilson', email: 'james@email.com', phone: '+1234567890', source: 'Facebook Ads', status: 'new', interest: '2024 Toyota Camry', score: 85, createdAt: '2024-12-10' },
      { id: '2', name: 'Emily Brown', email: 'emily@email.com', phone: '+1234567891', source: 'Website', status: 'contacted', interest: 'Honda CR-V', score: 72, createdAt: '2024-12-09' },
      { id: '3', name: 'Michael Davis', email: 'michael@email.com', phone: '+1234567892', source: 'Email Campaign', status: 'qualified', interest: 'Ford F-150', score: 90, createdAt: '2024-12-08' },
      { id: '4', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1234567893', source: 'Referral', status: 'converted', interest: 'BMW X5', score: 95, createdAt: '2024-12-07' },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'campaigns', label: 'Campaigns', icon: '📢' },
    { id: 'leads', label: 'Leads', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'email', label: 'Email Marketing', icon: '📧' },
    { id: 'content', label: 'Content', icon: '📝' },
  ];

  return (
    <>
      <Head>
        <title>Marketing Department | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <span className="text-xl">📢</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Marketing Department</h1>
                  <p className="text-slate-400 text-xs">Campaigns & Lead Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition"
              >
                + New Campaign
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
                    ? 'bg-pink-600 text-white'
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
                    <span className="text-2xl">📢</span>
                    <span className="text-slate-400 text-sm">Active Campaigns</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                  <p className="text-pink-400 text-xs mt-1">{formatCurrency(campaigns.filter(c => c.status === 'active').reduce((sum, c) => sum + c.budget, 0))} budget</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-slate-400 text-sm">Total Leads</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</p>
                  <p className="text-green-400 text-xs mt-1">+45 this week</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-slate-400 text-sm">Total Spent</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(campaigns.reduce((sum, c) => sum + c.spent, 0))}</p>
                  <p className="text-slate-400 text-xs mt-1">of {formatCurrency(campaigns.reduce((sum, c) => sum + c.budget, 0))}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✅</span>
                    <span className="text-slate-400 text-sm">Conversions</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.conversions, 0)}</p>
                  <p className="text-green-400 text-xs mt-1">14.8% rate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Active Campaigns Performance</h3>
                  <div className="space-y-4">
                    {campaigns.filter(c => c.status === 'active').map((campaign) => {
                      const progress = (campaign.spent / campaign.budget) * 100;
                      return (
                        <div key={campaign.id} className="p-4 bg-slate-700/30 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium">{campaign.name}</p>
                              <p className="text-slate-400 text-xs capitalize">{campaign.type}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-2">
                            <div>
                              <p className="text-pink-400 font-bold">{campaign.leads}</p>
                              <p className="text-slate-400 text-xs">Leads</p>
                            </div>
                            <div>
                              <p className="text-green-400 font-bold">{campaign.conversions}</p>
                              <p className="text-slate-400 text-xs">Conversions</p>
                            </div>
                            <div>
                              <p className="text-blue-400 font-bold">{formatCurrency(campaign.spent)}</p>
                              <p className="text-slate-400 text-xs">Spent</p>
                            </div>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{progress.toFixed(0)}% budget used</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Leads</h3>
                  <div className="space-y-3">
                    {leads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            lead.score >= 90 ? 'bg-green-500' : lead.score >= 70 ? 'bg-yellow-500' : 'bg-slate-500'
                          }`}>
                            {lead.score}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{lead.name}</p>
                            <p className="text-slate-400 text-xs">{lead.source} • {lead.interest}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                          lead.status === 'qualified' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Campaigns</h3>
                <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Completed</option>
                </select>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Campaign</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Type</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Budget</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Leads</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Conv.</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-slate-400 text-xs">{campaign.startDate} - {campaign.endDate}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded capitalize">{campaign.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'draft' ? 'bg-slate-600 text-slate-400' :
                          campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{formatCurrency(campaign.spent)}</p>
                        <p className="text-slate-400 text-xs">of {formatCurrency(campaign.budget)}</p>
                      </td>
                      <td className="px-4 py-3 text-pink-400 font-bold">{campaign.leads}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">{campaign.conversions}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Edit</button>
                        </div>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Status</option>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Converted</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Lead</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Source</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Interest</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Score</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-slate-400 text-xs">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{lead.source}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{lead.interest}</td>
                      <td className="px-4 py-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          lead.score >= 90 ? 'bg-green-500' : lead.score >= 70 ? 'bg-yellow-500' : 'bg-slate-500'
                        }`}>
                          {lead.score}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                          lead.status === 'qualified' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-pink-400 hover:text-pink-300 text-sm">Contact</button>
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Lead Sources</h3>
                  <div className="space-y-3">
                    {[
                      { source: 'Facebook Ads', count: 145, percentage: 35 },
                      { source: 'Google Ads', count: 98, percentage: 24 },
                      { source: 'Website', count: 87, percentage: 21 },
                      { source: 'Referral', count: 52, percentage: 13 },
                      { source: 'Other', count: 32, percentage: 7 },
                    ].map((item) => (
                      <div key={item.source}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{item.source}</span>
                          <span className="text-slate-400">{item.count}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Conversion Funnel</h3>
                  <div className="space-y-4">
                    {[
                      { stage: 'Visitors', count: 12500, color: 'bg-blue-500' },
                      { stage: 'Leads', count: 450, color: 'bg-purple-500' },
                      { stage: 'Qualified', count: 180, color: 'bg-pink-500' },
                      { stage: 'Converted', count: 66, color: 'bg-green-500' },
                    ].map((item, idx) => (
                      <div key={item.stage} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300 text-sm">{item.stage}</span>
                            <span className="text-white font-bold">{item.count.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">ROI Summary</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                      <p className="text-slate-400 text-sm">Total Revenue from Leads</p>
                      <p className="text-green-400 text-2xl font-bold">{formatCurrency(285000)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-slate-400 text-xs">Total Spent</p>
                        <p className="text-white font-bold">{formatCurrency(7000)}</p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-slate-400 text-xs">ROI</p>
                        <p className="text-green-400 font-bold">4,071%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  {[
                    { platform: 'Facebook', icon: '📘', followers: '12.5K', connected: true },
                    { platform: 'Instagram', icon: '📷', followers: '8.2K', connected: true },
                    { platform: 'Twitter', icon: '🐦', followers: '3.1K', connected: true },
                    { platform: 'LinkedIn', icon: '💼', followers: '1.8K', connected: false },
                  ].map((account) => (
                    <div key={account.platform} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{account.icon}</span>
                        <div>
                          <p className="text-white font-medium">{account.platform}</p>
                          <p className="text-slate-400 text-xs">{account.followers} followers</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded ${account.connected ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                        {account.connected ? 'Connected' : 'Connect'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Schedule Post</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Content</label>
                    <textarea 
                      rows={4}
                      placeholder="Write your post..."
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Platform</label>
                      <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        <option>All Platforms</option>
                        <option>Facebook</option>
                        <option>Instagram</option>
                        <option>Twitter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Schedule</label>
                      <input 
                        type="datetime-local"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  <button className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold transition">
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Marketing Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Subscribers</p>
                  <p className="text-white text-2xl font-bold">2,450</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Open Rate</p>
                  <p className="text-green-400 text-2xl font-bold">24.5%</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Click Rate</p>
                  <p className="text-blue-400 text-2xl font-bold">3.8%</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Unsubscribes</p>
                  <p className="text-red-400 text-2xl font-bold">12</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Email Campaigns</h3>
                  <button className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium">
                    + Create Campaign
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Holiday Sale Newsletter', sent: 2450, opened: 612, clicked: 89, date: 'Dec 5, 2024' },
                    { name: 'New Inventory Alert', sent: 1850, opened: 425, clicked: 67, date: 'Nov 28, 2024' },
                    { name: 'Black Friday Deals', sent: 2200, opened: 890, clicked: 156, date: 'Nov 24, 2024' },
                  ].map((campaign, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-slate-400 text-xs">Sent: {campaign.date}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-white font-bold">{campaign.sent}</p>
                          <p className="text-slate-400 text-xs">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-green-400 font-bold">{campaign.opened}</p>
                          <p className="text-slate-400 text-xs">Opened</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-400 font-bold">{campaign.clicked}</p>
                          <p className="text-slate-400 text-xs">Clicked</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Content Library</h3>
                  <button className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium">
                    + Upload
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((item) => (
                    <div key={item} className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
                      <span className="text-4xl text-slate-500">🖼️</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Blog Posts</h3>
                <div className="space-y-3">
                  {[
                    { title: '10 Tips for Buying Your First Car', status: 'Published', views: 1250 },
                    { title: 'Best Cars for Families in 2024', status: 'Draft', views: 0 },
                    { title: 'Electric vs Hybrid: Which is Right?', status: 'Published', views: 890 },
                  ].map((post, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{post.title}</p>
                        <p className="text-slate-400 text-xs">{post.views > 0 ? `${post.views} views` : 'Not published'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${post.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                        {post.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
