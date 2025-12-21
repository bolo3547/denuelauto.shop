/**
 * Payment Proof Management Component for HQ Admin
 * Allows approval, rejection, and management of payment proofs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  DollarSign,
  File,
  User,
  Building,
  Smartphone,
  CreditCard,
  Clock,
  Filter,
  Search,
  Download,
  ExternalLink
} from 'lucide-react';

interface PaymentProof {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  paymentMethod: string;
  amount: number;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  adminNotes: string;
  createdAt: string;
  approvedAt?: string;
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    car?: {
      make: string;
      model: string;
      year: number;
      stockNumber: string;
    };
  };
  uploadedBy: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function PaymentProofManager() {
  const { toast } = useToast();

  // State
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [reviewAction, setReviewAction] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load payment proofs
  const loadPaymentProofs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/payment-proofs?${params}`);
      if (!response.ok) throw new Error('Failed to load payment proofs');

      const data = await response.json();
      setPaymentProofs(data.paymentProofs);
      setPagination(data.pagination);

    } catch (error) {
      console.error('Error loading payment proofs:', error);
      toast({
        title: "Error",
        description: "Failed to load payment proofs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentProofs();
  }, [statusFilter]);

  // Filter proofs by search term
  const filteredProofs = paymentProofs.filter(proof =>
    proof.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proof.uploadedBy.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proof.uploadedBy.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proof.uploadedBy.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle review action
  const handleReviewAction = async () => {
    if (!selectedProof || !reviewAction) return;

    setProcessing(true);

    try {
      const response = await fetch(`/api/payment-proofs/${selectedProof.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: reviewAction,
          notes: reviewNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Review action failed');
      }

      const result = await response.json();

      toast({
        title: "✅ Action Completed",
        description: `Payment proof has been ${reviewAction}d successfully`,
      });

      // Update local state
      setPaymentProofs(prev =>
        prev.map(proof =>
          proof.id === selectedProof.id
            ? { ...proof, ...result.paymentProof }
            : proof
        )
      );

      // Reset form
      setSelectedProof(null);
      setReviewAction('');
      setReviewNotes('');

    } catch (error) {
      console.error('Review action error:', error);
      toast({
        title: "❌ Action Failed",
        description: error instanceof Error ? error.message : 'Failed to process review action',
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      case 'CHANGES_REQUESTED': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY': return <Smartphone className="h-4 w-4" />;
      case 'BANK_TRANSFER': return <Building className="h-4 w-4" />;
      case 'CREDIT_CARD': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment proofs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Proof Management</h1>
          <p className="text-muted-foreground">Review and approve payment proofs from tenants</p>
        </div>
        <Button onClick={() => loadPaymentProofs()} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice, customer name, or email..."
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Proofs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProofs.map((proof) => (
          <Card key={proof.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Invoice {proof.invoice.invoiceNumber}
                </CardTitle>
                <Badge className={`${getStatusColor(proof.status)} text-white`}>
                  {proof.status.replace('_', ' ')}
                </Badge>
              </div>
              {proof.invoice.car && (
                <CardDescription>
                  {proof.invoice.car.year} {proof.invoice.car.make} {proof.invoice.car.model}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Amount and Payment Method */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-green-600">
                  ${proof.amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getPaymentMethodIcon(proof.paymentMethod)}
                  {proof.paymentMethod.replace('_', ' ')}
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {proof.uploadedBy.firstName[0]}{proof.uploadedBy.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {proof.uploadedBy.firstName} {proof.uploadedBy.lastName}
                </span>
              </div>

              {/* File Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <File className="h-4 w-4" />
                <span className="truncate">{proof.fileName}</span>
                <span className="text-xs">
                  ({(proof.fileSize / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>

              {/* Dates */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Uploaded: {new Date(proof.createdAt).toLocaleDateString()}
                </div>
                {proof.approvedAt && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approved: {new Date(proof.approvedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              {proof.adminNotes && (
                <div className="bg-muted p-2 rounded text-xs">
                  <span className="font-medium">Admin Notes: </span>
                  {proof.adminNotes}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedProof(proof)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Payment Proof Review</DialogTitle>
                      <DialogDescription>
                        Invoice {proof.invoice.invoiceNumber} - ${proof.amount.toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* File Preview */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Payment Proof Document</h4>
                        <div className="border rounded-lg p-4">
                          {proof.mimeType.startsWith('image/') ? (
                            <div className="text-center">
                              <img 
                                src={proof.fileUrl} 
                                alt="Payment proof" 
                                className="max-w-full max-h-96 mx-auto rounded border"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 p-4 bg-muted rounded">
                              <File className="h-12 w-12 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{proof.fileName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  PDF Document • {(proof.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(proof.fileUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Payment Method</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPaymentMethodIcon(proof.paymentMethod)}
                            <span>{proof.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <div className="text-lg font-semibold text-green-600 mt-1">
                            ${proof.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {proof.notes && (
                        <div>
                          <Label>Customer Notes</Label>
                          <div className="bg-muted p-3 rounded mt-1">
                            {proof.notes}
                          </div>
                        </div>
                      )}

                      {/* Current Status */}
                      <div>
                        <Label>Current Status</Label>
                        <Badge className={`${getStatusColor(proof.status)} text-white mt-1`}>
                          {proof.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Review Actions */}
                      {proof.status === 'PENDING' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reviewAction">Review Action</Label>
                            <Select value={reviewAction} onValueChange={setReviewAction}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approve">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Approve Payment
                                  </div>
                                </SelectItem>
                                <SelectItem value="reject">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Reject Payment
                                  </div>
                                </SelectItem>
                                <SelectItem value="request_changes">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    Request Changes
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="reviewNotes">Admin Notes</Label>
                            <Textarea
                              id="reviewNotes"
                              placeholder="Add notes about your review decision..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>

                          <Button
                            onClick={handleReviewAction}
                            disabled={!reviewAction || processing}
                            className="w-full"
                          >
                            {processing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                {reviewAction === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                                {reviewAction === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                                {reviewAction === 'request_changes' && <AlertCircle className="h-4 w-4 mr-2" />}
                                {reviewAction ? `${reviewAction.charAt(0).toUpperCase() + reviewAction.slice(1)} Payment` : 'Select Action'}
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Approval Info */}
                      {proof.approvedBy && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Approved by:</span>
                          </div>
                          <p className="text-green-700">
                            {proof.approvedBy.firstName} {proof.approvedBy.lastName}
                          </p>
                          <p className="text-sm text-green-600">
                            {new Date(proof.approvedAt!).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {proof.mimeType.startsWith('image/') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(proof.fileUrl, '_blank')}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProofs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Payment Proofs Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No payment proofs match your current filters'
                : 'No payment proofs have been uploaded yet'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadPaymentProofs(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => loadPaymentProofs(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}