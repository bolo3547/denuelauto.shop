/**
 * Data Export Service
 * Export data to CSV, Excel, and PDF formats
 */

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export type ExportType =
  | 'inventory'
  | 'sales'
  | 'leads'
  | 'customers'
  | 'payments'
  | 'reservations'
  | 'test_drives'
  | 'reviews'
  | 'audit_logs'
  | 'analytics';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'percent';
  transform?: (value: any, row: any) => string | number;
}

export interface ExportOptions {
  format: ExportFormat;
  columns?: ExportColumn[];
  filename?: string;
  title?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  currencyCode?: string;
  locale?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  rowCount: number;
  size: number;
  data?: string | Buffer;
  url?: string;
  error?: string;
}

// Column definitions for different export types
export const EXPORT_COLUMNS: Record<ExportType, ExportColumn[]> = {
  inventory: [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'vin', header: 'VIN', width: 20 },
    { key: 'make', header: 'Make', width: 15 },
    { key: 'model', header: 'Model', width: 15 },
    { key: 'year', header: 'Year', width: 8, format: 'number' },
    { key: 'trim', header: 'Trim', width: 15 },
    { key: 'color', header: 'Color', width: 12 },
    { key: 'mileage', header: 'Mileage', width: 12, format: 'number' },
    { key: 'price', header: 'Price', width: 15, format: 'currency' },
    { key: 'costPrice', header: 'Cost Price', width: 15, format: 'currency' },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'condition', header: 'Condition', width: 12 },
    { key: 'fuelType', header: 'Fuel Type', width: 12 },
    { key: 'transmission', header: 'Transmission', width: 12 },
    { key: 'bodyType', header: 'Body Type', width: 12 },
    { key: 'engineSize', header: 'Engine Size', width: 12 },
    { key: 'daysInStock', header: 'Days in Stock', width: 12, format: 'number' },
    { key: 'location', header: 'Location', width: 20 },
    { key: 'createdAt', header: 'Added Date', width: 15, format: 'date' },
  ],

  sales: [
    { key: 'id', header: 'Sale ID', width: 12 },
    { key: 'orderNumber', header: 'Order Number', width: 15 },
    { key: 'date', header: 'Sale Date', width: 12, format: 'date' },
    { key: 'customerName', header: 'Customer', width: 20 },
    { key: 'customerEmail', header: 'Email', width: 25 },
    { key: 'customerPhone', header: 'Phone', width: 15 },
    { key: 'vehicleInfo', header: 'Vehicle', width: 30 },
    { key: 'vin', header: 'VIN', width: 20 },
    { key: 'salePrice', header: 'Sale Price', width: 15, format: 'currency' },
    { key: 'costPrice', header: 'Cost', width: 15, format: 'currency' },
    { key: 'profit', header: 'Profit', width: 15, format: 'currency' },
    { key: 'paymentMethod', header: 'Payment Method', width: 15 },
    { key: 'paymentStatus', header: 'Payment Status', width: 12 },
    { key: 'salesPerson', header: 'Sales Person', width: 20 },
    { key: 'source', header: 'Lead Source', width: 15 },
    { key: 'deliveryDate', header: 'Delivery Date', width: 12, format: 'date' },
    { key: 'status', header: 'Status', width: 12 },
  ],

  leads: [
    { key: 'id', header: 'Lead ID', width: 12 },
    { key: 'createdAt', header: 'Date', width: 12, format: 'date' },
    { key: 'name', header: 'Name', width: 20 },
    { key: 'email', header: 'Email', width: 25 },
    { key: 'phone', header: 'Phone', width: 15 },
    { key: 'source', header: 'Source', width: 15 },
    { key: 'vehicleInterest', header: 'Vehicle Interest', width: 25 },
    { key: 'budget', header: 'Budget', width: 15, format: 'currency' },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'stage', header: 'Funnel Stage', width: 15 },
    { key: 'score', header: 'Lead Score', width: 10, format: 'number' },
    { key: 'assignedTo', header: 'Assigned To', width: 20 },
    { key: 'lastContactDate', header: 'Last Contact', width: 12, format: 'date' },
    { key: 'nextFollowUp', header: 'Next Follow-up', width: 12, format: 'date' },
    { key: 'notes', header: 'Notes', width: 40 },
  ],

  customers: [
    { key: 'id', header: 'Customer ID', width: 12 },
    { key: 'name', header: 'Name', width: 20 },
    { key: 'email', header: 'Email', width: 25 },
    { key: 'phone', header: 'Phone', width: 15 },
    { key: 'address', header: 'Address', width: 30 },
    { key: 'city', header: 'City', width: 15 },
    { key: 'region', header: 'Region', width: 15 },
    { key: 'country', header: 'Country', width: 15 },
    { key: 'totalPurchases', header: 'Total Purchases', width: 12, format: 'number' },
    { key: 'totalSpent', header: 'Total Spent', width: 15, format: 'currency' },
    { key: 'lastPurchaseDate', header: 'Last Purchase', width: 12, format: 'date' },
    { key: 'customerSince', header: 'Customer Since', width: 12, format: 'date' },
    { key: 'loyaltyTier', header: 'Loyalty Tier', width: 12 },
  ],

  payments: [
    { key: 'id', header: 'Payment ID', width: 12 },
    { key: 'date', header: 'Date', width: 12, format: 'datetime' },
    { key: 'reference', header: 'Reference', width: 20 },
    { key: 'orderNumber', header: 'Order', width: 15 },
    { key: 'customerName', header: 'Customer', width: 20 },
    { key: 'amount', header: 'Amount', width: 15, format: 'currency' },
    { key: 'method', header: 'Method', width: 15 },
    { key: 'provider', header: 'Provider', width: 15 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'transactionId', header: 'Transaction ID', width: 25 },
    { key: 'fees', header: 'Fees', width: 12, format: 'currency' },
    { key: 'netAmount', header: 'Net Amount', width: 15, format: 'currency' },
  ],

  reservations: [
    { key: 'id', header: 'Reservation ID', width: 15 },
    { key: 'createdAt', header: 'Created', width: 12, format: 'datetime' },
    { key: 'customerName', header: 'Customer', width: 20 },
    { key: 'customerEmail', header: 'Email', width: 25 },
    { key: 'customerPhone', header: 'Phone', width: 15 },
    { key: 'vehicleInfo', header: 'Vehicle', width: 30 },
    { key: 'depositAmount', header: 'Deposit', width: 15, format: 'currency' },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'expiresAt', header: 'Expires', width: 12, format: 'datetime' },
    { key: 'convertedToSale', header: 'Converted', width: 10, format: 'boolean' },
  ],

  test_drives: [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'scheduledDate', header: 'Date', width: 12, format: 'date' },
    { key: 'scheduledTime', header: 'Time', width: 10 },
    { key: 'customerName', header: 'Customer', width: 20 },
    { key: 'customerPhone', header: 'Phone', width: 15 },
    { key: 'vehicleInfo', header: 'Vehicle', width: 30 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'salesPerson', header: 'Sales Person', width: 20 },
    { key: 'feedback', header: 'Feedback', width: 30 },
    { key: 'convertedToSale', header: 'Converted', width: 10, format: 'boolean' },
  ],

  reviews: [
    { key: 'id', header: 'Review ID', width: 12 },
    { key: 'createdAt', header: 'Date', width: 12, format: 'date' },
    { key: 'customerName', header: 'Customer', width: 20 },
    { key: 'rating', header: 'Rating', width: 8, format: 'number' },
    { key: 'title', header: 'Title', width: 30 },
    { key: 'content', header: 'Review', width: 50 },
    { key: 'vehicleInfo', header: 'Vehicle', width: 25 },
    { key: 'verified', header: 'Verified', width: 10, format: 'boolean' },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'response', header: 'Response', width: 40 },
  ],

  audit_logs: [
    { key: 'id', header: 'Log ID', width: 15 },
    { key: 'timestamp', header: 'Timestamp', width: 20, format: 'datetime' },
    { key: 'action', header: 'Action', width: 15 },
    { key: 'resource', header: 'Resource', width: 15 },
    { key: 'resourceId', header: 'Resource ID', width: 15 },
    { key: 'userId', header: 'User ID', width: 15 },
    { key: 'userName', header: 'User', width: 20 },
    { key: 'ipAddress', header: 'IP Address', width: 15 },
    { key: 'userAgent', header: 'User Agent', width: 30 },
    { key: 'status', header: 'Status', width: 10 },
    { key: 'details', header: 'Details', width: 40 },
  ],

  analytics: [
    { key: 'date', header: 'Date', width: 12, format: 'date' },
    { key: 'pageViews', header: 'Page Views', width: 12, format: 'number' },
    { key: 'uniqueVisitors', header: 'Unique Visitors', width: 15, format: 'number' },
    { key: 'vehicleViews', header: 'Vehicle Views', width: 12, format: 'number' },
    { key: 'inquiries', header: 'Inquiries', width: 12, format: 'number' },
    { key: 'testDriveRequests', header: 'Test Drive Requests', width: 18, format: 'number' },
    { key: 'reservations', header: 'Reservations', width: 12, format: 'number' },
    { key: 'sales', header: 'Sales', width: 10, format: 'number' },
    { key: 'revenue', header: 'Revenue', width: 15, format: 'currency' },
    { key: 'conversionRate', header: 'Conversion Rate', width: 15, format: 'percent' },
  ],
};

/**
 * Format value based on column format
 */
function formatValue(
  value: any,
  format: ExportColumn['format'],
  options: ExportOptions
): string {
  if (value === null || value === undefined) return '';

  const locale = options.locale || 'en-US';
  const currency = options.currencyCode || 'USD';

  switch (format) {
    case 'number':
      return typeof value === 'number'
        ? value.toLocaleString(locale)
        : String(value);

    case 'currency':
      return typeof value === 'number'
        ? new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
          }).format(value)
        : String(value);

    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString(locale);
      }
      if (typeof value === 'string') {
        return new Date(value).toLocaleDateString(locale);
      }
      return String(value);

    case 'datetime':
      if (value instanceof Date) {
        return value.toLocaleString(locale);
      }
      if (typeof value === 'string') {
        return new Date(value).toLocaleString(locale);
      }
      return String(value);

    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'percent':
      return typeof value === 'number'
        ? `${(value * 100).toFixed(2)}%`
        : String(value);

    default:
      return String(value);
  }
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export to CSV format
 */
export function exportToCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): string {
  const lines: string[] = [];

  // Header row
  if (options.includeHeaders !== false) {
    lines.push(columns.map(col => escapeCSV(col.header)).join(','));
  }

  // Data rows
  for (const row of data) {
    const values = columns.map(col => {
      let value = row[col.key];
      if (col.transform) {
        value = col.transform(value, row);
      }
      const formatted = formatValue(value, col.format, options);
      return escapeCSV(formatted);
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

/**
 * Export to JSON format
 */
export function exportToJSON(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): string {
  const exportData = data.map(row => {
    const obj: Record<string, any> = {};
    for (const col of columns) {
      let value = row[col.key];
      if (col.transform) {
        value = col.transform(value, row);
      }
      obj[col.key] = value;
    }
    return obj;
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate Excel XML format (xlsx compatible)
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): string {
  // Generate Excel 2003 XML format (simpler, more compatible)
  const worksheetName = options.title || 'Sheet1';
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="Currency"/>
    </Style>
    <Style ss:ID="Date">
      <NumberFormat ss:Format="Short Date"/>
    </Style>
    <Style ss:ID="Percent">
      <NumberFormat ss:Format="Percent"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXML(worksheetName)}">
    <Table>`;

  // Column widths
  for (const col of columns) {
    xml += `\n      <Column ss:Width="${(col.width || 10) * 7}"/>`;
  }

  // Header row
  if (options.includeHeaders !== false) {
    xml += '\n      <Row>';
    for (const col of columns) {
      xml += `\n        <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(col.header)}</Data></Cell>`;
    }
    xml += '\n      </Row>';
  }

  // Data rows
  for (const row of data) {
    xml += '\n      <Row>';
    for (const col of columns) {
      let value = row[col.key];
      if (col.transform) {
        value = col.transform(value, row);
      }

      let type = 'String';
      let style = '';
      let displayValue = value;

      if (value === null || value === undefined) {
        displayValue = '';
      } else if (col.format === 'number' || col.format === 'currency') {
        type = 'Number';
        style = col.format === 'currency' ? ' ss:StyleID="Currency"' : '';
        displayValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      } else if (col.format === 'percent') {
        type = 'Number';
        style = ' ss:StyleID="Percent"';
        displayValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      } else if (col.format === 'date' || col.format === 'datetime') {
        type = 'DateTime';
        style = ' ss:StyleID="Date"';
        if (value instanceof Date) {
          displayValue = value.toISOString();
        } else if (typeof value === 'string') {
          displayValue = new Date(value).toISOString();
        }
      } else if (col.format === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else {
        displayValue = escapeXML(String(value));
      }

      xml += `\n        <Cell${style}><Data ss:Type="${type}">${displayValue}</Data></Cell>`;
    }
    xml += '\n      </Row>';
  }

  xml += `
    </Table>
  </Worksheet>
</Workbook>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate PDF-ready HTML
 */
export function exportToPDFHtml(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): string {
  const title = options.title || 'Export';
  const now = new Date().toLocaleString(options.locale || 'en-US');

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      line-height: 1.4;
      padding: 20px;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 5px;
    }
    .meta {
      color: #666;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #4472c4;
      color: white;
      padding: 8px 4px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #2f528f;
    }
    td {
      padding: 6px 4px;
      border: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .number, .currency, .percent {
      text-align: right;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 9px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Generated: ${now} | Total Records: ${data.length}</div>
  <table>
    <thead>
      <tr>`;

  for (const col of columns) {
    html += `\n        <th>${col.header}</th>`;
  }

  html += `
      </tr>
    </thead>
    <tbody>`;

  for (const row of data) {
    html += '\n      <tr>';
    for (const col of columns) {
      let value = row[col.key];
      if (col.transform) {
        value = col.transform(value, row);
      }
      const formatted = formatValue(value, col.format, options);
      const className = ['number', 'currency', 'percent'].includes(col.format || '')
        ? col.format
        : '';
      html += `\n        <td class="${className}">${formatted}</td>`;
    }
    html += '\n      </tr>';
  }

  html += `
    </tbody>
  </table>
  <div class="footer">
    Page 1 | Exported from Car Dealership System
  </div>
</body>
</html>`;

  return html;
}

/**
 * Data Export Service Class
 */
export class DataExportService {
  private tenantId: string;
  private locale: string;
  private currencyCode: string;

  constructor(tenantId: string, locale = 'en-US', currencyCode = 'USD') {
    this.tenantId = tenantId;
    this.locale = locale;
    this.currencyCode = currencyCode;
  }

  /**
   * Export data to specified format
   */
  export(
    type: ExportType,
    data: Record<string, any>[],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const columns = options.columns || EXPORT_COLUMNS[type];
    const format = options.format || 'csv';
    const filename = options.filename || `${type}_export_${Date.now()}`;

    const exportOptions: ExportOptions = {
      format,
      columns,
      filename,
      title: options.title || this.getDefaultTitle(type),
      includeHeaders: options.includeHeaders ?? true,
      locale: options.locale || this.locale,
      currencyCode: options.currencyCode || this.currencyCode,
    };

    try {
      let exportedData: string;
      let extension: string;
      let mimeType: string;

      switch (format) {
        case 'csv':
          exportedData = exportToCSV(data, columns, exportOptions);
          extension = 'csv';
          mimeType = 'text/csv';
          break;

        case 'excel':
          exportedData = exportToExcel(data, columns, exportOptions);
          extension = 'xml';
          mimeType = 'application/vnd.ms-excel';
          break;

        case 'json':
          exportedData = exportToJSON(data, columns, exportOptions);
          extension = 'json';
          mimeType = 'application/json';
          break;

        case 'pdf':
          exportedData = exportToPDFHtml(data, columns, exportOptions);
          extension = 'html';
          mimeType = 'text/html';
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        success: true,
        filename: `${filename}.${extension}`,
        format,
        rowCount: data.length,
        size: new Blob([exportedData]).size,
        data: exportedData,
      };
    } catch (error) {
      return {
        success: false,
        filename: `${filename}.${format}`,
        format,
        rowCount: 0,
        size: 0,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Get default title for export type
   */
  private getDefaultTitle(type: ExportType): string {
    const titles: Record<ExportType, string> = {
      inventory: 'Vehicle Inventory Report',
      sales: 'Sales Report',
      leads: 'Leads Report',
      customers: 'Customer Report',
      payments: 'Payment Transactions',
      reservations: 'Reservations Report',
      test_drives: 'Test Drives Report',
      reviews: 'Customer Reviews',
      audit_logs: 'Audit Log Report',
      analytics: 'Analytics Report',
    };
    return titles[type];
  }

  /**
   * Create downloadable blob URL
   */
  createDownloadUrl(result: ExportResult): string | null {
    if (!result.success || !result.data) return null;

    const mimeTypes: Record<ExportFormat, string> = {
      csv: 'text/csv;charset=utf-8',
      excel: 'application/vnd.ms-excel',
      json: 'application/json',
      pdf: 'text/html',
    };

    const blob = new Blob([result.data], { type: mimeTypes[result.format] });
    return URL.createObjectURL(blob);
  }

  /**
   * Trigger browser download
   */
  download(result: ExportResult): void {
    if (!result.success || !result.data) return;

    const url = this.createDownloadUrl(result);
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export inventory data
   */
  exportInventory(
    vehicles: any[],
    options?: Partial<ExportOptions>
  ): ExportResult {
    return this.export('inventory', vehicles, options);
  }

  /**
   * Export sales data
   */
  exportSales(sales: any[], options?: Partial<ExportOptions>): ExportResult {
    return this.export('sales', sales, options);
  }

  /**
   * Export leads data
   */
  exportLeads(leads: any[], options?: Partial<ExportOptions>): ExportResult {
    return this.export('leads', leads, options);
  }

  /**
   * Export customers data
   */
  exportCustomers(
    customers: any[],
    options?: Partial<ExportOptions>
  ): ExportResult {
    return this.export('customers', customers, options);
  }

  /**
   * Export payments data
   */
  exportPayments(
    payments: any[],
    options?: Partial<ExportOptions>
  ): ExportResult {
    return this.export('payments', payments, options);
  }
}

export default DataExportService;
