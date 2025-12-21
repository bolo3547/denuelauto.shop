/**
 * Payment Proof Upload Component
 * Handles file upload and payment proof creation
 */

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  CreditCard,
  Smartphone,
  Building,
  DollarSign
} from 'lucide-react';

interface PaymentProofUploadProps {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  onUploadSuccess?: (paymentProof: any) => void;
  onCancel?: () => void;
}

export function PaymentProofUpload({ 
  invoiceId, 
  invoiceNumber, 
  totalAmount, 
  onUploadSuccess, 
  onCancel 
}: PaymentProofUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>(totalAmount.toString());
  const [notes, setNotes] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image (JPEG, PNG, GIF, WebP) or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload payment proof
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !paymentMethod || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // 1) Request presigned URL and create DB record
      const signResp = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          invoiceId,
          filename: selectedFile.name,
          contentType: selectedFile.type,
          paymentMethod,
          amount,
          notes
        })
      });

      if (!signResp.ok) {
        const error = await signResp.json();
        throw new Error(error.error || 'Failed to obtain upload URL');
      }

      const { uploadUrl, fileUrl, proofId } = await signResp.json();

      // 2) Upload the file directly to S3 (presigned PUT)
      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile
      });

      if (!putResp.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3) Confirm upload (will trigger virus scan on server if available)
      const confirmResp = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ proofId })
      });

      const confirmResult = await confirmResp.json();

      if (!confirmResp.ok) {
        throw new Error(confirmResult.error || 'Upload confirmation failed');
      }

      toast({
        title: "✅ Payment Proof Uploaded",
        description: confirmResult.message || "Your payment proof has been uploaded and is pending approval.",
      });

      // Provide result object similar to previous behaviour
      const result = { paymentProof: { id: proofId, fileUrl, status: confirmResult.message ? 'succeeded' : 'pending_scan' } };

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setPaymentMethod('');
      setAmount(totalAmount.toString());
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess?.(result.paymentProof);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload payment proof',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload payment proof',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Payment Proof
        </CardTitle>
        <CardDescription>
          Upload payment proof for Invoice {invoiceNumber} (${totalAmount.toLocaleString()})
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Payment Proof Document *</Label>
            
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Payment Screenshot or Receipt</h3>
                <p className="text-muted-foreground mb-4">
                  Select an image or PDF file (max 10MB)
                </p>
                <Badge variant="secondary" className="mb-2">
                  Supported: JPEG, PNG, GIF, WebP, PDF
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded border flex items-center justify-center">
                        <File className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedFile.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready to upload
                      </Badge>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Change File Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Change File
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Payment Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOBILE_MONEY">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="CREDIT_CARD">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="CASH">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount Paid (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about the payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 mb-1">Important Notes:</h4>
                <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Ensure the payment proof clearly shows the transaction details</li>
                  <li>The amount should match the invoice total or be clearly explained</li>
                  <li>HQ will review and approve your payment proof within 2-3 business days</li>
                  <li>You will be notified once the payment is approved</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!selectedFile || !paymentMethod || !amount || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Payment Proof
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}