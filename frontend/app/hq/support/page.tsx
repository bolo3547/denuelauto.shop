'use client';

import React, { useEffect, useState } from 'react';
import {
  FaHeadset, FaSearch, FaFilter, FaPlus, FaEye, FaReply, FaCheck, FaClock,
  FaExclamationCircle, FaStore, FaUser, FaEnvelope, FaTimes, FaChevronRight
} from 'react-icons/fa';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  tenantName: string;
  tenantSlug: string;
  contactEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'billing' | 'technical' | 'account' | 'feature' | 'other';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: number;
}

export default function HqSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(r => setTimeout(r, 500));
      
      setTickets([
        { id: '1', ticketNumber: 'TKT-001', subject: 'Cannot upload vehicle images', description: 'Getting error when trying to upload photos to inventory...', tenantName: 'Denuel Auto', tenantSlug: 'denuel-auto', contactEmail: 'admin@denuelauto.com', status: 'open', priority: 'high', category: 'technical', createdAt: '2024-12-11 10:30', updatedAt: '2024-12-11 10:30', messages: 3 },
        { id: '2', ticketNumber: 'TKT-002', subject: 'Invoice payment failed', description: 'My payment was declined but money was deducted...', tenantName: 'Lusaka Motors', tenantSlug: 'lusaka-motors', contactEmail: 'finance@lusakamotors.com', status: 'in_progress', priority: 'urgent', category: 'billing', createdAt: '2024-12-10 14:20', updatedAt: '2024-12-11 09:15', assignedTo: 'support@denuel.com', messages: 5 },
        { id: '3', ticketNumber: 'TKT-003', subject: 'How to add custom domain?', description: 'I want to use my own domain for the public site...', tenantName: 'Copperbelt Cars', tenantSlug: 'copperbelt-cars', contactEmail: 'it@copperbeltcars.com', status: 'open', priority: 'medium', category: 'technical', createdAt: '2024-12-10 11:45', updatedAt: '2024-12-10 11:45', messages: 1 },
        { id: '4', ticketNumber: 'TKT-004', subject: 'Request for bulk import feature', description: 'We need to import 500 vehicles from CSV...', tenantName: 'Kitwe Motors', tenantSlug: 'kitwe-motors', contactEmail: 'manager@kitwemotors.com', status: 'resolved', priority: 'low', category: 'feature', createdAt: '2024-12-08 09:00', updatedAt: '2024-12-10 16:30', assignedTo: 'dev@denuel.com', messages: 8 },
        { id: '5', ticketNumber: 'TKT-005', subject: 'Account access issue', description: 'One of my staff cannot login to their account...', tenantName: 'Ndola Auto', tenantSlug: 'ndola-auto', contactEmail: 'admin@ndolaauto.com', status: 'closed', priority: 'medium', category: 'account', createdAt: '2024-12-05 15:30', updatedAt: '2024-12-07 10:00', messages: 4 },
      ]);

      setLoading(false);
    };
    loadData();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const styles = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${styles[priority]}`}>
        <FaExclamationCircle />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage tenant support requests</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <FaPlus /> Create Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaHeadset className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheck className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaExclamationCircle className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              <p className="text-sm text-gray-500">Urgent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filter by priority"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Ticket List */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="divide-y">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaStore className="text-gray-400" />
                        {ticket.tenantName}
                      </span>
                      <span>{ticket.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-sm text-gray-500">{ticket.messages} messages</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="w-[450px] bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <span className="text-sm font-mono text-gray-500">{selectedTicket.ticketNumber}</span>
                <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {selectedTicket.category}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaStore className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tenant</p>
                    <p className="font-medium">{selectedTicket.tenantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{selectedTicket.contactEmail}</p>
                  </div>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium">{selectedTicket.assignedTo}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <FaReply /> Reply to Ticket
                </button>
                {selectedTicket.status === 'open' && (
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <FaUser /> Assign to Me
                  </button>
                )}
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <button className="w-full px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                    <FaCheck /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
