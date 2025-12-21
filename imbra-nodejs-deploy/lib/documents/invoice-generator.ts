/**
 * PDF Invoice Generation Service
 * Creates professional PDF invoices, proformas, quotes, and receipts
 */

export type DocumentType = 
  | 'invoice'
  | 'proforma'
  | 'quote'
  | 'receipt'
  | 'delivery_note'
  | 'purchase_order';

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  registrationNo?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
}

export interface VehicleInfo {
  stockNo: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  engineNo?: string;
  color?: string;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  engineSize?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface PaymentInfo {
  method: string;
  bankName?: string;
  accountName?: string;
  accountNo?: string;
  swiftCode?: string;
  mobileMoneyNo?: string;
  instructions?: string;
}

export interface InvoiceData {
  type: DocumentType;
  
  // Document info
  documentNo: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  reference?: string;
  
  // Parties
  company: CompanyInfo;
  customer: CustomerInfo;
  
  // Vehicle (optional)
  vehicle?: VehicleInfo;
  
  // Items
  items: LineItem[];
  
  // Totals
  subtotal: number;
  discount?: number;
  discountPercent?: number;
  taxRate?: number;
  taxAmount?: number;
  shippingCost?: number;
  total: number;
  currency: string;
  
  // Payment
  payment?: PaymentInfo;
  amountPaid?: number;
  balance?: number;
  
  // Additional
  notes?: string;
  terms?: string[];
  footer?: string;
}

/**
 * Generate HTML template for invoice
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const documentTitle = getDocumentTitle(data.type);
  const statusColor = getStatusColor(data.type);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle} - ${data.documentNo}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      background: #fff;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${statusColor};
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-logo {
      max-height: 60px;
      max-width: 200px;
      margin-bottom: 10px;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    
    .company-details {
      color: #666;
      font-size: 11px;
    }
    
    .document-info {
      text-align: right;
    }
    
    .document-type {
      font-size: 28px;
      font-weight: bold;
      color: ${statusColor};
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    
    .document-number {
      font-size: 14px;
      color: #666;
    }
    
    .document-date {
      font-size: 11px;
      color: #888;
      margin-top: 5px;
    }
    
    /* Billing Section */
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .bill-to, .ship-to {
      flex: 1;
      max-width: 45%;
    }
    
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 8px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .customer-name {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    
    .customer-details {
      color: #666;
      font-size: 11px;
    }
    
    /* Vehicle Info */
    .vehicle-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 30px;
    }
    
    .vehicle-title {
      font-size: 12px;
      font-weight: bold;
      color: ${statusColor};
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .vehicle-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    
    .vehicle-item {
      font-size: 11px;
    }
    
    .vehicle-label {
      color: #888;
      font-size: 10px;
    }
    
    .vehicle-value {
      color: #333;
      font-weight: 500;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: ${statusColor};
      color: white;
    }
    
    .items-table th {
      padding: 12px 15px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      font-size: 11px;
    }
    
    .items-table td:last-child {
      text-align: right;
      font-weight: 500;
    }
    
    .items-table tbody tr:hover {
      background: #fafafa;
    }
    
    /* Totals */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    
    .totals-table {
      width: 300px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
    }
    
    .totals-row.subtotal {
      border-bottom: 1px solid #eee;
    }
    
    .totals-row.total {
      border-top: 2px solid ${statusColor};
      margin-top: 10px;
      padding-top: 15px;
      font-size: 16px;
      font-weight: bold;
      color: ${statusColor};
    }
    
    .totals-row.balance {
      background: #fff3cd;
      margin: 10px -10px;
      padding: 10px;
      border-radius: 4px;
    }
    
    /* Payment Info */
    .payment-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .payment-title {
      font-size: 12px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    
    .payment-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .payment-item {
      font-size: 11px;
    }
    
    .payment-label {
      color: #888;
      font-size: 10px;
      margin-bottom: 3px;
    }
    
    .payment-value {
      color: #333;
      font-weight: 500;
    }
    
    /* Notes & Terms */
    .notes-section {
      margin-bottom: 30px;
    }
    
    .notes-title {
      font-size: 11px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .notes-content {
      font-size: 11px;
      color: #666;
      background: #fafafa;
      padding: 15px;
      border-radius: 4px;
      border-left: 3px solid ${statusColor};
    }
    
    .terms-list {
      font-size: 10px;
      color: #888;
      padding-left: 15px;
      margin-top: 10px;
    }
    
    .terms-list li {
      margin-bottom: 5px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #eee;
      color: #888;
      font-size: 10px;
    }
    
    .footer-text {
      margin-bottom: 5px;
    }
    
    /* Print styles */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .invoice-container {
        padding: 20px;
      }
      
      .no-print {
        display: none;
      }
    }
    
    /* Watermark for drafts */
    ${data.type === 'proforma' || data.type === 'quote' ? `
    .invoice-container::before {
      content: "${data.type.toUpperCase()}";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0, 0, 0, 0.03);
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        ${data.company.logo ? `<img src="${data.company.logo}" alt="${data.company.name}" class="company-logo">` : ''}
        <div class="company-name">${data.company.name}</div>
        <div class="company-details">
          ${data.company.address}<br>
          ${data.company.city}, ${data.company.country}<br>
          📞 ${data.company.phone}<br>
          ✉️ ${data.company.email}
          ${data.company.website ? `<br>🌐 ${data.company.website}` : ''}
          ${data.company.taxId ? `<br>Tax ID: ${data.company.taxId}` : ''}
        </div>
      </div>
      <div class="document-info">
        <div class="document-type">${documentTitle}</div>
        <div class="document-number">#${data.documentNo}</div>
        <div class="document-date">
          Date: ${formatDate(data.date)}<br>
          ${data.dueDate ? `Due: ${formatDate(data.dueDate)}<br>` : ''}
          ${data.validUntil ? `Valid Until: ${formatDate(data.validUntil)}<br>` : ''}
          ${data.reference ? `Ref: ${data.reference}` : ''}
        </div>
      </div>
    </div>
    
    <!-- Billing Section -->
    <div class="billing-section">
      <div class="bill-to">
        <div class="section-title">Bill To</div>
        <div class="customer-name">${data.customer.name}</div>
        <div class="customer-details">
          ${data.customer.address ? `${data.customer.address}<br>` : ''}
          ${data.customer.city ? `${data.customer.city}, ${data.customer.country || ''}<br>` : ''}
          📞 ${data.customer.phone}<br>
          ✉️ ${data.customer.email}
          ${data.customer.taxId ? `<br>Tax ID: ${data.customer.taxId}` : ''}
        </div>
      </div>
    </div>
    
    ${data.vehicle ? `
    <!-- Vehicle Information -->
    <div class="vehicle-section">
      <div class="vehicle-title">🚗 Vehicle Details</div>
      <div class="vehicle-grid">
        <div class="vehicle-item">
          <div class="vehicle-label">Stock No</div>
          <div class="vehicle-value">${data.vehicle.stockNo}</div>
        </div>
        <div class="vehicle-item">
          <div class="vehicle-label">Make / Model</div>
          <div class="vehicle-value">${data.vehicle.make} ${data.vehicle.model}</div>
        </div>
        <div class="vehicle-item">
          <div class="vehicle-label">Year</div>
          <div class="vehicle-value">${data.vehicle.year}</div>
        </div>
        <div class="vehicle-item">
          <div class="vehicle-label">Color</div>
          <div class="vehicle-value">${data.vehicle.color || '-'}</div>
        </div>
        ${data.vehicle.vin ? `
        <div class="vehicle-item">
          <div class="vehicle-label">VIN</div>
          <div class="vehicle-value">${data.vehicle.vin}</div>
        </div>
        ` : ''}
        ${data.vehicle.mileage ? `
        <div class="vehicle-item">
          <div class="vehicle-label">Mileage</div>
          <div class="vehicle-value">${data.vehicle.mileage.toLocaleString()} km</div>
        </div>
        ` : ''}
        ${data.vehicle.transmission ? `
        <div class="vehicle-item">
          <div class="vehicle-label">Transmission</div>
          <div class="vehicle-value">${data.vehicle.transmission}</div>
        </div>
        ` : ''}
        ${data.vehicle.fuelType ? `
        <div class="vehicle-item">
          <div class="vehicle-label">Fuel Type</div>
          <div class="vehicle-value">${data.vehicle.fuelType}</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th style="width: 10%">Qty</th>
          <th style="width: 20%">Unit Price</th>
          <th style="width: 20%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${data.currency} ${item.unitPrice.toLocaleString()}</td>
          <td>${data.currency} ${item.total.toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row subtotal">
          <span>Subtotal</span>
          <span>${data.currency} ${data.subtotal.toLocaleString()}</span>
        </div>
        ${data.discount ? `
        <div class="totals-row">
          <span>Discount ${data.discountPercent ? `(${data.discountPercent}%)` : ''}</span>
          <span>-${data.currency} ${data.discount.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.taxAmount ? `
        <div class="totals-row">
          <span>Tax ${data.taxRate ? `(${data.taxRate}%)` : ''}</span>
          <span>${data.currency} ${data.taxAmount.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.shippingCost ? `
        <div class="totals-row">
          <span>Shipping</span>
          <span>${data.currency} ${data.shippingCost.toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="totals-row total">
          <span>Total</span>
          <span>${data.currency} ${data.total.toLocaleString()}</span>
        </div>
        ${data.amountPaid !== undefined ? `
        <div class="totals-row">
          <span>Amount Paid</span>
          <span>${data.currency} ${data.amountPaid.toLocaleString()}</span>
        </div>
        <div class="totals-row balance">
          <span><strong>Balance Due</strong></span>
          <span><strong>${data.currency} ${(data.balance || 0).toLocaleString()}</strong></span>
        </div>
        ` : ''}
      </div>
    </div>
    
    ${data.payment ? `
    <!-- Payment Information -->
    <div class="payment-section">
      <div class="payment-title">💳 Payment Information</div>
      <div class="payment-grid">
        <div class="payment-item">
          <div class="payment-label">Payment Method</div>
          <div class="payment-value">${data.payment.method}</div>
        </div>
        ${data.payment.bankName ? `
        <div class="payment-item">
          <div class="payment-label">Bank Name</div>
          <div class="payment-value">${data.payment.bankName}</div>
        </div>
        ` : ''}
        ${data.payment.accountName ? `
        <div class="payment-item">
          <div class="payment-label">Account Name</div>
          <div class="payment-value">${data.payment.accountName}</div>
        </div>
        ` : ''}
        ${data.payment.accountNo ? `
        <div class="payment-item">
          <div class="payment-label">Account Number</div>
          <div class="payment-value">${data.payment.accountNo}</div>
        </div>
        ` : ''}
        ${data.payment.swiftCode ? `
        <div class="payment-item">
          <div class="payment-label">SWIFT Code</div>
          <div class="payment-value">${data.payment.swiftCode}</div>
        </div>
        ` : ''}
        ${data.payment.mobileMoneyNo ? `
        <div class="payment-item">
          <div class="payment-label">Mobile Money</div>
          <div class="payment-value">${data.payment.mobileMoneyNo}</div>
        </div>
        ` : ''}
      </div>
      ${data.payment.instructions ? `
      <div style="margin-top: 15px; font-size: 11px; color: #666;">
        <strong>Instructions:</strong> ${data.payment.instructions}
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    ${data.notes || (data.terms && data.terms.length > 0) ? `
    <!-- Notes & Terms -->
    <div class="notes-section">
      ${data.notes ? `
      <div class="notes-title">Notes</div>
      <div class="notes-content">${data.notes}</div>
      ` : ''}
      ${data.terms && data.terms.length > 0 ? `
      <div class="notes-title" style="margin-top: 15px;">Terms & Conditions</div>
      <ul class="terms-list">
        ${data.terms.map(term => `<li>${term}</li>`).join('')}
      </ul>
      ` : ''}
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      ${data.footer ? `<div class="footer-text">${data.footer}</div>` : ''}
      <div class="footer-text">Thank you for your business!</div>
      <div class="footer-text">Generated on ${new Date().toLocaleDateString()}</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get document title based on type
 */
function getDocumentTitle(type: DocumentType): string {
  const titles: Record<DocumentType, string> = {
    invoice: 'Invoice',
    proforma: 'Proforma Invoice',
    quote: 'Quotation',
    receipt: 'Receipt',
    delivery_note: 'Delivery Note',
    purchase_order: 'Purchase Order',
  };
  return titles[type] || 'Document';
}

/**
 * Get status color based on document type
 */
function getStatusColor(type: DocumentType): string {
  const colors: Record<DocumentType, string> = {
    invoice: '#2563eb',      // Blue
    proforma: '#7c3aed',     // Purple
    quote: '#059669',        // Green
    receipt: '#16a34a',      // Green
    delivery_note: '#ea580c', // Orange
    purchase_order: '#dc2626', // Red
  };
  return colors[type] || '#333';
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate document number
 */
export function generateDocumentNumber(
  type: DocumentType,
  sequence: number,
  prefix?: string
): string {
  const typePrefix: Record<DocumentType, string> = {
    invoice: 'INV',
    proforma: 'PRO',
    quote: 'QT',
    receipt: 'RCP',
    delivery_note: 'DN',
    purchase_order: 'PO',
  };
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const docPrefix = prefix || typePrefix[type];
  const seqNum = sequence.toString().padStart(5, '0');
  
  return `${docPrefix}-${year}${month}-${seqNum}`;
}

/**
 * Calculate line item total
 */
export function calculateLineItemTotal(
  quantity: number,
  unitPrice: number,
  discount?: number,
  tax?: number
): number {
  let total = quantity * unitPrice;
  
  if (discount) {
    total -= discount;
  }
  
  if (tax) {
    total += (total * tax) / 100;
  }
  
  return Math.round(total * 100) / 100;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  items: LineItem[],
  discountPercent?: number,
  taxRate?: number,
  shippingCost?: number
): {
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = discountPercent ? (subtotal * discountPercent) / 100 : 0;
  const taxableAmount = subtotal - discount;
  const taxAmount = taxRate ? (taxableAmount * taxRate) / 100 : 0;
  const total = taxableAmount + taxAmount + (shippingCost || 0);
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Default terms and conditions
 */
export const DEFAULT_TERMS: Record<DocumentType, string[]> = {
  invoice: [
    'Payment is due within 30 days of invoice date.',
    'Late payments may incur a 2% monthly interest charge.',
    'All prices are in the currency specified.',
    'Goods remain the property of the seller until fully paid.',
  ],
  proforma: [
    'This is a proforma invoice for customs and reference purposes only.',
    'Prices are subject to change without notice.',
    'Valid for 14 days from the date of issue.',
    'A formal invoice will be issued upon confirmation.',
  ],
  quote: [
    'This quotation is valid for 30 days from the date of issue.',
    'Prices do not include shipping unless specified.',
    'Subject to availability at the time of order confirmation.',
    'Terms may vary based on order quantity and specifications.',
  ],
  receipt: [
    'This receipt confirms payment has been received.',
    'Please retain for your records.',
    'No refunds or exchanges without this receipt.',
  ],
  delivery_note: [
    'Please check all items upon delivery.',
    'Report any damages or discrepancies within 24 hours.',
    'Signature confirms receipt of goods in good condition.',
  ],
  purchase_order: [
    'This purchase order is subject to our standard terms and conditions.',
    'Delivery must be completed by the specified date.',
    'Invoice must reference this PO number.',
  ],
};

export default {
  generateInvoiceHTML,
  generateDocumentNumber,
  calculateLineItemTotal,
  calculateInvoiceTotals,
  DEFAULT_TERMS,
};
