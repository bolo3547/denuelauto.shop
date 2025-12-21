'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChartFix as BarChart,
  BarFix as Bar,
  XAxisFix as XAxis,
  YAxisFix as YAxis,
  CartesianGridFix as CartesianGrid,
  TooltipFix as Tooltip,
  LegendFix as Legend,
  ResponsiveContainerFix as ResponsiveContainer,
  FunnelChartFix as FunnelChart,
  FunnelFix as Funnel,
  LabelListFix as LabelList,
  CellFix as Cell,
  PieChartFix as PieChart,
  PieFix as Pie,
  LineChartFix as LineChart,
  LineFix as Line,
} from '@/lib/recharts-fix';

interface FunnelStageData {
  stage: string;
  label: string;
  count: number;
  value: number;
  conversionRate: number;
  fill: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: string;
  stage: string;
  score: number;
  createdAt: string;
  lastContactedAt?: string;
}

interface SourceData {
  source: string;
  leads: number;
  conversions: number;
  rate: number;
}

const STAGE_COLORS: Record<string, string> = {
  visitor: '#94a3b8',
  lead: '#60a5fa',
  inquiry: '#818cf8',
  viewing: '#a78bfa',
  negotiation: '#f59e0b',
  deposit: '#10b981',
  sale: '#22c55e',
  delivery: '#06b6d4',
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  hot: { bg: 'bg-red-100', text: 'text-red-800' },
  warm: { bg: 'bg-orange-100', text: 'text-orange-800' },
  cold: { bg: 'bg-blue-100', text: 'text-blue-800' },
  new: { bg: 'bg-green-100', text: 'text-green-800' },
  won: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  lost: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function SalesFunnelDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'sources'>('overview');
  const [dateRange, setDateRange] = useState('30');
  
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    averageTimeToConversion: 0,
    totalRevenue: 0,
    averageDealValue: 0,
  });
  
  const [funnelData, setFunnelData] = useState<FunnelStageData[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [followUps, setFollowUps] = useState<Lead[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics({
        totalLeads: 247,
        newLeads: 45,
        convertedLeads: 23,
        conversionRate: 9.3,
        averageTimeToConversion: 12.5,
        totalRevenue: 1250000,
        averageDealValue: 54348,
      });

      setFunnelData([
        { stage: 'visitor', label: 'Visitors', count: 1250, value: 0, conversionRate: 100, fill: STAGE_COLORS.visitor },
        { stage: 'lead', label: 'Leads', count: 247, value: 0, conversionRate: 19.8, fill: STAGE_COLORS.lead },
        { stage: 'inquiry', label: 'Inquiries', count: 156, value: 0, conversionRate: 63.2, fill: STAGE_COLORS.inquiry },
        { stage: 'viewing', label: 'Viewings', count: 89, value: 0, conversionRate: 57.1, fill: STAGE_COLORS.viewing },
        { stage: 'negotiation', label: 'Negotiations', count: 45, value: 0, conversionRate: 50.6, fill: STAGE_COLORS.negotiation },
        { stage: 'deposit', label: 'Deposits', count: 28, value: 750000, conversionRate: 62.2, fill: STAGE_COLORS.deposit },
        { stage: 'sale', label: 'Sales', count: 23, value: 1250000, conversionRate: 82.1, fill: STAGE_COLORS.sale },
      ]);

      setLeads([
        { id: '1', name: 'John Mwanza', phone: '+260 97 1234567', email: 'john@email.com', source: 'website', status: 'hot', stage: 'negotiation', score: 85, createdAt: '2024-12-10', lastContactedAt: '2024-12-12' },
        { id: '2', name: 'Mary Banda', phone: '+260 96 2345678', source: 'facebook', status: 'warm', stage: 'viewing', score: 65, createdAt: '2024-12-08', lastContactedAt: '2024-12-11' },
        { id: '3', name: 'Peter Tembo', phone: '+260 95 3456789', email: 'peter@email.com', source: 'referral', status: 'hot', stage: 'deposit', score: 92, createdAt: '2024-12-05', lastContactedAt: '2024-12-12' },
        { id: '4', name: 'Grace Phiri', phone: '+260 97 4567890', source: 'walk_in', status: 'new', stage: 'lead', score: 45, createdAt: '2024-12-12' },
        { id: '5', name: 'David Lungu', phone: '+260 96 5678901', email: 'david@email.com', source: 'google_ads', status: 'warm', stage: 'inquiry', score: 58, createdAt: '2024-12-09', lastContactedAt: '2024-12-10' },
      ]);

      setSources([
        { source: 'Website', leads: 78, conversions: 8, rate: 10.3 },
        { source: 'Facebook', leads: 45, conversions: 4, rate: 8.9 },
        { source: 'Google Ads', leads: 38, conversions: 5, rate: 13.2 },
        { source: 'Walk-in', leads: 32, conversions: 3, rate: 9.4 },
        { source: 'Referral', leads: 28, conversions: 2, rate: 7.1 },
        { source: 'WhatsApp', leads: 26, conversions: 1, rate: 3.8 },
      ]);

      setFollowUps([
        { id: '4', name: 'Grace Phiri', phone: '+260 97 4567890', source: 'walk_in', status: 'new', stage: 'lead', score: 45, createdAt: '2024-12-12' },
        { id: '5', name: 'David Lungu', phone: '+260 96 5678901', source: 'google_ads', status: 'warm', stage: 'inquiry', score: 58, createdAt: '2024-12-09', lastContactedAt: '2024-12-10' },
      ]);

      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Funnel Analytics</h1>
          <p className="text-gray-500">Track leads from inquiry to sale</p>
        </div>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalLeads}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+{metrics.newLeads} new this period</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.conversionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{metrics.convertedLeads} conversions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Avg: {formatCurrency(metrics.averageDealValue)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Time to Close</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.averageTimeToConversion}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">days average</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'leads', 'sources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Sales Funnel</h3>
            <ResponsiveContainer width="100%" height={400}>
              <FunnelChart>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Funnel
                  dataKey="count"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    position="right"
                    dataKey="label"
                    fill="#333"
                    stroke="none"
                    fontSize={12}
                  />
                  <LabelList
                    position="center"
                    dataKey="count"
                    fill="#fff"
                    stroke="none"
                    fontSize={14}
                    fontWeight="bold"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Stage Conversion Rates</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={funnelData.slice(1)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="label" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="conversionRate" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {funnelData.slice(1).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Follow-ups Required */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Leads Requiring Follow-up</h3>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {followUps.length} pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {followUps.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${STAGE_COLORS[lead.stage]}20`,
                            color: STAGE_COLORS[lead.stage],
                          }}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${lead.score}%`,
                                backgroundColor: lead.score >= 70 ? '#ef4444' : lead.score >= 50 ? '#f59e0b' : '#3b82f6',
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.lastContactedAt || 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Call</button>
                        <button className="text-green-600 hover:text-green-800">WhatsApp</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">All Leads</h3>
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search leads..."
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-4 py-2 border rounded-lg">
                <option>All Stages</option>
                {Object.entries(STAGE_COLORS).map(([stage]) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <select className="px-4 py-2 border rounded-lg">
                <option>All Status</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_BADGES[lead.status]?.bg} ${STATUS_BADGES[lead.status]?.text}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${STAGE_COLORS[lead.stage]}20`,
                          color: STAGE_COLORS[lead.stage],
                        }}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${lead.score}%`,
                              backgroundColor: lead.score >= 70 ? '#ef4444' : lead.score >= 50 ? '#f59e0b' : '#3b82f6',
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="leads"
                  nameKey="source"
                >
                  {sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(STAGE_COLORS)[index % Object.values(STAGE_COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Source Conversion Rates */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Conversion by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Source Table */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Source Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv. Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sources.map((source, index) => (
                    <tr key={source.source} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {source.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {source.leads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {source.conversions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${source.rate >= 10 ? 'text-green-600' : 'text-gray-600'}`}>
                          {source.rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${index % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {index % 2 === 0 ? '↑ +5%' : '↓ -2%'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
