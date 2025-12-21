'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaWhatsapp, 
  FaEnvelope, 
  FaSms,
  FaPhone,
  FaBell,
  FaCog,
  FaPlay,
  FaPause,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaRobot
} from 'react-icons/fa';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'active' | 'paused' | 'draft';
  created: string;
  lastRun?: string;
  successRate: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'followup' | 'reminder' | 'promotion' | 'update';
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  subject?: string;
  content: string;
  variables: string[];
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  audience: string;
  scheduled?: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

export default function NotificationAutomation() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('automation');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data - replace with actual API
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'Welcome New Customers',
          trigger: 'Customer Registration',
          action: 'Send Welcome Email + SMS',
          channel: 'email',
          status: 'active',
          created: '2024-01-15',
          lastRun: '2024-02-10 09:30',
          successRate: 95.2
        },
        {
          id: '2',
          name: 'Follow Up Inquiries',
          trigger: 'Car Inquiry Submitted',
          action: 'Send Follow-up WhatsApp',
          channel: 'whatsapp',
          status: 'active',
          created: '2024-01-20',
          lastRun: '2024-02-10 14:15',
          successRate: 87.8
        },
        {
          id: '3',
          name: 'Service Reminder',
          trigger: 'Service Due Date',
          action: 'Send Service Reminder',
          channel: 'sms',
          status: 'active',
          created: '2024-02-01',
          lastRun: '2024-02-09 08:00',
          successRate: 92.1
        }
      ];

      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          type: 'welcome',
          channel: 'email',
          subject: 'Welcome to {{tenant_name}}!',
          content: 'Dear {{customer_name}}, welcome to our dealership! We\'re excited to help you find your perfect car.',
          variables: ['customer_name', 'tenant_name', 'login_url']
        },
        {
          id: '2',
          name: 'Car Inquiry Follow-up',
          type: 'followup',
          channel: 'whatsapp',
          content: 'Hi {{customer_name}}! Thank you for your interest in the {{car_make}} {{car_model}}. Would you like to schedule a test drive?',
          variables: ['customer_name', 'car_make', 'car_model', 'agent_name']
        },
        {
          id: '3',
          name: 'Service Reminder SMS',
          type: 'reminder',
          channel: 'sms',
          content: 'Hi {{customer_name}}, your {{car_make}} {{car_model}} is due for service. Call us at {{phone}} to schedule.',
          variables: ['customer_name', 'car_make', 'car_model', 'phone', 'due_date']
        }
      ];

      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'February Car Promotion',
          type: 'email',
          status: 'running',
          audience: 'All Active Customers',
          scheduled: '2024-02-01 09:00',
          sent: 1250,
          opened: 680,
          clicked: 145,
          converted: 23
        },
        {
          id: '2',
          name: 'New Inventory Alert',
          type: 'whatsapp',
          status: 'completed',
          audience: 'Toyota Interested',
          sent: 450,
          opened: 420,
          clicked: 89,
          converted: 12
        },
        {
          id: '3',
          name: 'Service Special Offer',
          type: 'sms',
          status: 'scheduled',
          audience: 'Service Customers',
          scheduled: '2024-02-15 10:00',
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        }
      ];

      setAutomationRules(mockRules);
      setTemplates(mockTemplates);
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <FaWhatsapp className="w-4 h-4 text-green-500" />;
      case 'email':
        return <FaEnvelope className="w-4 h-4 text-blue-500" />;
      case 'sms':
        return <FaSms className="w-4 h-4 text-purple-500" />;
      case 'push':
        return <FaBell className="w-4 h-4 text-orange-500" />;
      default:
        return <FaBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification & Automation</h1>
            <p className="text-gray-600">Manage automated communications and marketing campaigns</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <FaPlus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <FaRobot className="w-4 h-4" />
              <span>New Automation</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automationRules.filter(r => r.status === 'active').length}
                </p>
              </div>
              <FaRobot className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <FaChartLine className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">91.7%</p>
              </div>
              <FaUsers className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'automation', name: 'Automation Rules', icon: FaRobot },
            { id: 'templates', name: 'Templates', icon: FaEnvelope },
            { id: 'campaigns', name: 'Campaigns', icon: FaChartLine },
            { id: 'settings', name: 'Settings', icon: FaCog }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Automation Rules Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {automationRules.map((rule) => (
                <div key={rule.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getChannelIcon(rule.channel)}
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Trigger:</strong> {rule.trigger}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Action:</strong> {rule.action}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Success Rate: {rule.successRate}%</span>
                        {rule.lastRun && <span>Last Run: {rule.lastRun}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        className={`p-2 rounded-lg ${
                          rule.status === 'active'
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {rule.status === 'active' ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                      </button>
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(template.channel)}
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.type}
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3">
                {template.subject && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Subject:</p>
                    <p className="text-sm font-medium text-gray-900">{template.subject}</p>
                  </div>
                )}
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Content:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{template.content}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <span key={variable} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    Edit
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">
                    Clone
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Marketing Campaigns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Campaign</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Audience</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Performance</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          {campaign.scheduled && (
                            <p className="text-xs text-gray-500">
                              <FaCalendarAlt className="inline w-3 h-3 mr-1" />
                              {new Date(campaign.scheduled).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(campaign.type)}
                          <span className="text-sm capitalize">{campaign.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-600">{campaign.audience}</td>
                      <td className="py-3 px-6">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Sent:</span>
                            <span className="font-medium">{campaign.sent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Opened:</span>
                            <span className="font-medium">
                              {campaign.opened} ({campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Clicked:</span>
                            <span className="font-medium">
                              {campaign.clicked} ({campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Converted:</span>
                            <span className="font-medium text-green-600">{campaign.converted}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200">
                            <FaChartLine className="w-3 h-3" />
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

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h3>
          
          <div className="space-y-6">
            {/* WhatsApp Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaWhatsapp className="w-6 h-6 text-green-500" />
                <h4 className="font-medium text-gray-900">WhatsApp Business API</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+256700000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                  <input
                    type="password"
                    placeholder="Your WhatsApp API Token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaEnvelope className="w-6 h-6 text-blue-500" />
                <h4 className="font-medium text-gray-900">Email Configuration</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                  <input
                    type="email"
                    placeholder="noreply@yourdealership.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SMS Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaSms className="w-6 h-6 text-purple-500" />
                <h4 className="font-medium text-gray-900">SMS Gateway</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Twilio</option>
                    <option>Africa's Talking</option>
                    <option>Nexmo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                  <input
                    type="text"
                    placeholder="YourDealership"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}