/**
 * Agent Leads Page with Offline Sync
 * Enhanced with offline capabilities for lead management
 */

'use client';

// Force dynamic rendering to avoid prerender errors with navigator
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAgentOfflineSync } from '@/hooks/useAgentOfflineSync';
import { OfflineSyncStatus } from '@/components/agent/OfflineSyncStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  WifiOff,
  CheckCircle
} from 'lucide-react';

interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATING' | 'WON' | 'LOST';
  source: string;
  interestedIn: string;
  budget?: number;
  notes: string;
  createdAt: string;
  lastContactedAt?: string;
}

interface NewLeadData {
  customerName: string;
  email: string;
  phone: string;
  source: string;
  interestedIn: string;
  budget: string;
  notes: string;
}

export default function AgentLeadsPage() {
  const { toast } = useToast();
  const {
    syncStatus,
    createLeadOffline,
    updateLeadStatusOffline,
    addLeadNoteOffline,
  } = useAgentOfflineSync();

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState<NewLeadData>({
    customerName: '',
    email: '',
    phone: '',
    source: '',
    interestedIn: '',
    budget: '',
    notes: '',
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');

  // Load leads
  const loadLeads = async () => {
    try {
      const response = await fetch('/api/agent/leads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      } else {
        throw new Error('Failed to load leads');
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      if (!syncStatus.isOnline) {
        toast({
          title: "📱 Offline Mode",
          description: "Showing cached data. Changes will sync when online.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Create new lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const leadData = {
        ...newLeadData,
        budget: newLeadData.budget ? parseFloat(newLeadData.budget) : undefined,
      };

      if (syncStatus.isOnline) {
        // Try online first
        const response = await fetch('/api/agent/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
          },
          body: JSON.stringify(leadData),
        });

        if (response.ok) {
          const newLead = await response.json();
          setLeads(prev => [newLead, ...prev]);
          toast({
            title: "✅ Lead Created",
            description: "Lead created successfully",
          });
        } else {
          throw new Error('Online creation failed');
        }
      } else {
        // Queue for offline sync
        await createLeadOffline(leadData);
        
        // Add to local state with temporary ID
        const tempLead: Lead = {
          id: `temp_${Date.now()}`,
          ...leadData,
          status: 'NEW',
          budget: leadData.budget,
          createdAt: new Date().toISOString(),
        };
        setLeads(prev => [tempLead, ...prev]);
      }

      // Reset form
      setNewLeadData({
        customerName: '',
        email: '',
        phone: '',
        source: '',
        interestedIn: '',
        budget: '',
        notes: '',
      });
      setShowNewLeadForm(false);

    } catch (error) {
      // Fallback to offline mode
      await createLeadOffline(newLeadData);
      
      const tempLead: Lead = {
        id: `temp_${Date.now()}`,
        ...newLeadData,
        status: 'NEW',
        budget: newLeadData.budget ? parseFloat(newLeadData.budget) : undefined,
        createdAt: new Date().toISOString(),
      };
      setLeads(prev => [tempLead, ...prev]);
      
      // Reset form
      setNewLeadData({
        customerName: '',
        email: '',
        phone: '',
        source: '',
        interestedIn: '',
        budget: '',
        notes: '',
      });
      setShowNewLeadForm(false);
    }
  };

  // Update lead status
  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      if (syncStatus.isOnline) {
        const response = await fetch(`/api/agent/leads/${leadId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          setLeads(prev => prev.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
          ));
          toast({
            title: "✅ Status Updated",
            description: `Lead status changed to ${newStatus}`,
          });
          return;
        }
      }

      // Fallback to offline queue
      await updateLeadStatusOffline(leadId, newStatus);
      
      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
      ));

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  // Add note to lead
  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim()) return;

    try {
      if (syncStatus.isOnline) {
        const response = await fetch(`/api/agent/leads/${leadId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
          },
          body: JSON.stringify({ note: newNote }),
        });

        if (response.ok) {
          toast({
            title: "✅ Note Added",
            description: "Note added successfully",
          });
          setNewNote('');
          return;
        }
      }

      // Fallback to offline queue
      await addLeadNoteOffline(leadId, newNote);
      setNewNote('');

    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "❌ Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500';
      case 'CONTACTED': return 'bg-yellow-500';
      case 'QUALIFIED': return 'bg-orange-500';
      case 'PROPOSAL_SENT': return 'bg-purple-500';
      case 'NEGOTIATING': return 'bg-indigo-500';
      case 'WON': return 'bg-green-500';
      case 'LOST': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Sync Status */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">My Leads</h1>
          <p className="text-muted-foreground">
            Manage your sales leads {!syncStatus.isOnline && '(Offline Mode)'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OfflineSyncStatus showDetails={false} />
          <Button onClick={() => setShowNewLeadForm(!showNewLeadForm)}>
            <Plus className="h-4 w-4 mr-1" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Offline Sync Details */}
      {(!syncStatus.isOnline || syncStatus.queuedCount > 0) && (
        <OfflineSyncStatus />
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUALIFIED">Qualified</SelectItem>
            <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
            <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* New Lead Form */}
      {showNewLeadForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Lead
              {!syncStatus.isOnline && (
                <Badge variant="secondary" className="ml-2">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Will sync when online
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    required
                    value={newLeadData.customerName}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={newLeadData.email}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    required
                    value={newLeadData.phone}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="Facebook, Website, Referral..."
                    value={newLeadData.source}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, source: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="interestedIn">Interested In</Label>
                  <Input
                    id="interestedIn"
                    placeholder="Vehicle model or type..."
                    value={newLeadData.interestedIn}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, interestedIn: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={newLeadData.budget}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information..."
                  value={newLeadData.notes}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Lead
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewLeadForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leads Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{lead.customerName}</CardTitle>
                <Badge className={`${getStatusColor(lead.status)} text-white`}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
              {lead.id.startsWith('temp_') && (
                <Badge variant="secondary" className="w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Sync
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
                {lead.interestedIn && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{lead.interestedIn}</span>
                  </div>
                )}
                {lead.budget && (
                  <div className="text-lg font-semibold text-green-600">
                    ${lead.budget.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Select
                  value={lead.status}
                  onValueChange={(value) => handleUpdateStatus(lead.id, value)}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
                    <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                    <SelectItem value="WON">Won</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLead(lead)}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              </div>

              {/* Add Note Section */}
              {selectedLead?.id === lead.id && (
                <div className="border-t pt-3 space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddNote(lead.id)}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLead(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No leads match your current filters'
                : 'Start by creating your first lead'
              }
            </p>
            {!showNewLeadForm && (
              <Button onClick={() => setShowNewLeadForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}