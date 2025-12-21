import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface PendingAgent {
  id: string;
  code: string;
  email: string;
  name: string;
  phone: string;
  status: 'pending' | 'activated' | 'expired' | 'revoked';
  createdAt: string;
  activatedAt?: string;
  expiresAt: string;
  invitedBy: string;
}

interface RegisteredAgent {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  totalSales: number;
  totalCommission: number;
  lastActive: string;
  avatar?: string;
}

export default function ZRPortal() {
  const [activeTab, setActiveTab] = useState('register');
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [registeredAgents, setRegisteredAgents] = useState<RegisteredAgent[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [activationMessage, setActivationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // New agent invite form
  const [newInvite, setNewInvite] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: 5,
    validDays: 7,
  });

  // Generated link info
  const [generatedLink, setGeneratedLink] = useState({
    link: '',
    code: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock pending agents
    setPendingAgents([
      {
        id: '1',
        code: 'ZR-AGT-2024-001',
        email: 'john.doe@email.com',
        name: 'John Doe',
        phone: '+233 24 123 4567',
        status: 'pending',
        createdAt: '2024-12-05',
        expiresAt: '2024-12-12',
        invitedBy: 'Admin',
      },
      {
        id: '2',
        code: 'ZR-AGT-2024-002',
        email: 'sarah.smith@email.com',
        name: 'Sarah Smith',
        phone: '+233 20 987 6543',
        status: 'pending',
        createdAt: '2024-12-06',
        expiresAt: '2024-12-13',
        invitedBy: 'Admin',
      },
      {
        id: '3',
        code: 'ZR-AGT-2024-003',
        email: 'mike.wilson@email.com',
        name: 'Mike Wilson',
        phone: '+233 27 555 1234',
        status: 'expired',
        createdAt: '2024-11-20',
        expiresAt: '2024-11-27',
        invitedBy: 'HR Manager',
      },
    ]);

    // Mock registered agents
    setRegisteredAgents([
      {
        id: '1',
        code: 'ZR-AGT-2024-100',
        name: 'Emmanuel Adjei',
        email: 'emmanuel.a@email.com',
        phone: '+233 24 111 2222',
        status: 'active',
        joinedAt: '2024-10-15',
        totalSales: 12,
        totalCommission: 4500,
        lastActive: '2024-12-07',
      },
      {
        id: '2',
        code: 'ZR-AGT-2024-101',
        name: 'Ama Serwaa',
        email: 'ama.s@email.com',
        phone: '+233 20 333 4444',
        status: 'active',
        joinedAt: '2024-11-01',
        totalSales: 8,
        totalCommission: 3200,
        lastActive: '2024-12-06',
      },
      {
        id: '3',
        code: 'ZR-AGT-2024-102',
        name: 'Kwame Mensah',
        email: 'kwame.m@email.com',
        phone: '+233 27 555 6666',
        status: 'inactive',
        joinedAt: '2024-09-20',
        totalSales: 5,
        totalCommission: 1800,
        lastActive: '2024-11-15',
      },
    ]);
  };

  const generateRegistrationLink = () => {
    const code = `ZR-AGT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + newInvite.validDays);
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdealership.com';
    const link = `${baseUrl}/agent/register?code=${code}&email=${encodeURIComponent(newInvite.email)}`;
    
    setGeneratedLink({
      link,
      code,
      expiresAt: expiryDate.toISOString().split('T')[0],
    });

    // Add to pending agents
    const newPending: PendingAgent = {
      id: Date.now().toString(),
      code,
      email: newInvite.email,
      name: newInvite.name,
      phone: newInvite.phone,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: expiryDate.toISOString().split('T')[0],
      invitedBy: 'Admin',
    };
    setPendingAgents([newPending, ...pendingAgents]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const activateAgent = () => {
    setActivationStatus('checking');
    
    // Simulate API call
    setTimeout(() => {
      // Find pending agent with this code
      const agent = pendingAgents.find(a => 
        a.code === activationCode || 
        activationCode.includes(a.code)
      );

      if (agent) {
        if (agent.status === 'pending') {
          // Activate the agent
          setPendingAgents(pendingAgents.map(a => 
            a.id === agent.id ? { ...a, status: 'activated' as const, activatedAt: new Date().toISOString().split('T')[0] } : a
          ));

          // Add to registered agents
          const newRegistered: RegisteredAgent = {
            id: Date.now().toString(),
            code: agent.code,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            status: 'active',
            joinedAt: new Date().toISOString().split('T')[0],
            totalSales: 0,
            totalCommission: 0,
            lastActive: new Date().toISOString().split('T')[0],
          };
          setRegisteredAgents([newRegistered, ...registeredAgents]);

          setActivationStatus('success');
          setActivationMessage(`✅ Agent "${agent.name}" has been successfully activated! They can now log in to the Agent Portal.`);
        } else if (agent.status === 'expired') {
          setActivationStatus('error');
          setActivationMessage('❌ This registration link has expired. Please generate a new invite.');
        } else if (agent.status === 'activated') {
          setActivationStatus('error');
          setActivationMessage('⚠️ This agent has already been activated.');
        }
      } else {
        setActivationStatus('error');
        setActivationMessage('❌ Invalid registration code. Please check the link and try again.');
      }
    }, 1500);
  };

  const resendInvite = (agent: PendingAgent) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdealership.com';
    const link = `${baseUrl}/agent/register?code=${agent.code}&email=${encodeURIComponent(agent.email)}`;
    copyToClipboard(link);
    alert(`Invite link for ${agent.name} copied! You can send it via email or SMS.`);
  };

  const revokeInvite = (id: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      setPendingAgents(pendingAgents.map(a => 
        a.id === id ? { ...a, status: 'revoked' as const } : a
      ));
    }
  };

  const toggleAgentStatus = (id: string) => {
    setRegisteredAgents(registeredAgents.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  };

  const filteredPending = pendingAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredRegistered = registeredAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalAgents: registeredAgents.length,
    activeAgents: registeredAgents.filter(a => a.status === 'active').length,
    pendingInvites: pendingAgents.filter(a => a.status === 'pending').length,
    totalCommissions: registeredAgents.reduce((sum, a) => sum + a.totalCommission, 0),
  };

  return (
    <>
      <Head>
        <title>ZR Port - Agent Registration Portal | Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                  ← Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-slate-600" />
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🔗</span> ZR Port - Agent Registration
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowActivateModal(true); setActivationStatus('idle'); setActivationCode(''); }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <span>✅</span> Activate Agent
                </button>
                <button
                  onClick={() => { setShowGenerateModal(true); setGeneratedLink({ link: '', code: '', expiresAt: '' }); }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  <span>➕</span> Generate Invite Link
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Agents', value: stats.totalAgents, icon: '👥', color: 'from-blue-500 to-indigo-600' },
              { label: 'Active Agents', value: stats.activeAgents, icon: '✅', color: 'from-emerald-500 to-teal-600' },
              { label: 'Pending Invites', value: stats.pendingInvites, icon: '⏳', color: 'from-amber-500 to-orange-600' },
              { label: 'Total Commissions', value: `$${stats.totalCommissions.toLocaleString()}`, icon: '💰', color: 'from-purple-500 to-pink-600' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Activation Box */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl">
                🔗
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Quick Agent Activation</h2>
                <p className="text-slate-300 mt-1">Paste the agent{"'"}s registration link or code to activate their account</p>
              </div>
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder="Paste registration link or code here..."
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    setActivationCode(registrationLink);
                    setShowActivateModal(true);
                    setActivationStatus('idle');
                  }}
                  disabled={!registrationLink}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Activate Now
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'register', label: 'Pending Invites', icon: '⏳', count: stats.pendingInvites },
              { key: 'agents', label: 'Registered Agents', icon: '👥', count: stats.totalAgents },
              { key: 'activity', label: 'Activity Log', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-white/20' : 'bg-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
            {activeTab === 'register' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="activated">Activated</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            )}
          </div>

          {/* Pending Invites Tab */}
          {activeTab === 'register' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Agent</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Code</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Contact</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Expires</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Invited By</th>
                      <th className="text-right px-6 py-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredPending.map(agent => (
                      <tr key={agent.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{agent.name}</p>
                              <p className="text-slate-400 text-sm">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-slate-700 rounded text-indigo-400 text-sm">{agent.code}</code>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{agent.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            agent.status === 'activated' ? 'bg-emerald-500/20 text-emerald-400' :
                            agent.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{agent.expiresAt}</td>
                        <td className="px-6 py-4 text-slate-300">{agent.invitedBy}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {agent.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => resendInvite(agent)}
                                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                  title="Copy Link"
                                >
                                  📋 Copy Link
                                </button>
                                <button
                                  onClick={() => revokeInvite(agent.id)}
                                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                            {agent.status === 'expired' && (
                              <button
                                onClick={() => {
                                  setNewInvite({ ...newInvite, name: agent.name, email: agent.email, phone: agent.phone });
                                  setShowGenerateModal(true);
                                }}
                                className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors"
                              >
                                Resend Invite
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPending.length === 0 && (
                <div className="p-12 text-center">
                  <span className="text-4xl">📭</span>
                  <p className="text-slate-400 mt-4">No pending invites found</p>
                </div>
              )}
            </div>
          )}

          {/* Registered Agents Tab */}
          {activeTab === 'agents' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Agent</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Code</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Joined</th>
                      <th className="text-right px-6 py-4 text-slate-300 font-medium">Sales</th>
                      <th className="text-right px-6 py-4 text-slate-300 font-medium">Commission</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Last Active</th>
                      <th className="text-right px-6 py-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredRegistered.map(agent => (
                      <tr key={agent.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{agent.name}</p>
                              <p className="text-slate-400 text-sm">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-slate-700 rounded text-emerald-400 text-sm">{agent.code}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            agent.status === 'inactive' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{agent.joinedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-white font-medium">{agent.totalSales}</span>
                          <span className="text-slate-400 text-sm ml-1">cars</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-emerald-400 font-medium">${agent.totalCommission.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{agent.lastActive}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleAgentStatus(agent.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                agent.status === 'active'
                                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              }`}
                            >
                              {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <Link
                              href={`/dashboard/agents?id=${agent.id}`}
                              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRegistered.length === 0 && (
                <div className="p-12 text-center">
                  <span className="text-4xl">👥</span>
                  <p className="text-slate-400 mt-4">No registered agents found</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'Agent Activated', agent: 'Emmanuel Adjei', time: '2 hours ago', icon: '✅', color: 'emerald' },
                  { action: 'Invite Sent', agent: 'John Doe', time: '5 hours ago', icon: '📧', color: 'blue' },
                  { action: 'Login', agent: 'Ama Serwaa', time: '1 day ago', icon: '🔑', color: 'purple' },
                  { action: 'Commission Paid', agent: 'Emmanuel Adjei', time: '2 days ago', icon: '💰', color: 'amber' },
                  { action: 'Sale Recorded', agent: 'Ama Serwaa', time: '3 days ago', icon: '🚗', color: 'pink' },
                  { action: 'Invite Expired', agent: 'Mike Wilson', time: '1 week ago', icon: '⏰', color: 'red' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                    <div className={`w-10 h-10 bg-${log.color}-500/20 rounded-full flex items-center justify-center text-xl`}>
                      {log.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-slate-400 text-sm">{log.agent}</p>
                    </div>
                    <span className="text-slate-500 text-sm">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate Invite Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔗</span> Generate Agent Invite Link
              </h3>
              
              {!generatedLink.link ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm">Agent Name</label>
                    <input
                      type="text"
                      value={newInvite.name}
                      onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm">Email Address</label>
                    <input
                      type="email"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      placeholder="agent@email.com"
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm">Phone Number</label>
                    <input
                      type="tel"
                      value={newInvite.phone}
                      onChange={(e) => setNewInvite({ ...newInvite, phone: e.target.value })}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm">Commission Rate (%)</label>
                      <input
                        type="number"
                        value={newInvite.commissionRate}
                        onChange={(e) => setNewInvite({ ...newInvite, commissionRate: Number(e.target.value) })}
                        min={1}
                        max={20}
                        className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">Link Valid For (days)</label>
                      <select
                        value={newInvite.validDays}
                        onChange={(e) => setNewInvite({ ...newInvite, validDays: Number(e.target.value) })}
                        className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value={3}>3 days</option>
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateRegistrationLink}
                      disabled={!newInvite.name || !newInvite.email}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Generate Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <span>✅</span> Link Generated Successfully!
                    </div>
                    <p className="text-slate-300 text-sm">
                      Send this link to <strong>{newInvite.name}</strong> to complete their registration.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm">Registration Code</label>
                    <div className="mt-1 p-3 bg-slate-700 rounded-lg">
                      <code className="text-indigo-400 font-mono">{generatedLink.code}</code>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm">Registration Link</label>
                    <div className="mt-1 p-3 bg-slate-700 rounded-lg flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedLink.link}
                        readOnly
                        className="flex-1 bg-transparent text-white text-sm font-mono outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(generatedLink.link)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded text-sm hover:bg-indigo-500/30 transition-colors"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Expires:</span>
                    <span className="text-white">{generatedLink.expiresAt}</span>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 text-sm">
                      ⚠️ When the agent registers using this link, you'll need to activate their account by pasting the link in the "Quick Activation" box or the Activate Agent modal.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowGenerateModal(false);
                        setNewInvite({ name: '', email: '', phone: '', commissionRate: 5, validDays: 7 });
                        setGeneratedLink({ link: '', code: '', expiresAt: '' });
                      }}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedLink.link)}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activate Agent Modal */}
        {showActivateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✅</span> Activate Agent Account
              </h3>
              
              {activationStatus === 'idle' && (
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Paste the registration link or code sent by the agent to activate their account.
                  </p>

                  <div>
                    <label className="text-slate-400 text-sm">Registration Link or Code</label>
                    <textarea
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="Paste the full URL or just the code (e.g., ZR-AGT-2024-001)"
                      rows={3}
                      className="w-full mt-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                    />
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-slate-400 text-sm">
                      <strong className="text-white">How it works:</strong>
                    </p>
                    <ol className="text-slate-400 text-sm mt-2 space-y-1 list-decimal list-inside">
                      <li>Agent receives the invite link via email/SMS</li>
                      <li>Agent clicks the link and fills registration form</li>
                      <li>Agent sends confirmation back to you</li>
                      <li>You paste the link/code here to activate</li>
                      <li>Agent can now log in to the Agent Portal!</li>
                    </ol>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowActivateModal(false)}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={activateAgent}
                      disabled={!activationCode}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Activate Agent
                    </button>
                  </div>
                </div>
              )}

              {activationStatus === 'checking' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-white mt-4">Verifying registration code...</p>
                </div>
              )}

              {(activationStatus === 'success' || activationStatus === 'error') && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${
                    activationStatus === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <p className={activationStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                      {activationMessage}
                    </p>
                  </div>

                  {activationStatus === 'success' && (
                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <p className="text-slate-300 text-sm">
                        The agent can now log in using their email and the password they created during registration.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowActivateModal(false);
                      setActivationStatus('idle');
                      setActivationCode('');
                      setRegistrationLink('');
                    }}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
