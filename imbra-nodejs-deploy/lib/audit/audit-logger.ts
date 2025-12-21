/**
 * Audit Logging System
 * Track all admin actions for compliance and security
 */

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'SETTINGS_CHANGE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_REFUND'
  | 'RESERVATION_CREATE'
  | 'RESERVATION_CANCEL'
  | 'LEAD_ASSIGN'
  | 'LEAD_STATUS_CHANGE'
  | 'DOCUMENT_GENERATE'
  | 'SMS_SENT'
  | 'EMAIL_SENT'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED';

export type AuditResource =
  | 'user'
  | 'vehicle'
  | 'lead'
  | 'sale'
  | 'payment'
  | 'reservation'
  | 'document'
  | 'settings'
  | 'role'
  | 'permission'
  | 'tenant'
  | 'agent'
  | 'customer'
  | 'report'
  | 'api_key'
  | 'notification'
  | 'sms'
  | 'email';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  
  // Who
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  
  // What
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  
  // Details
  description: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changes?: AuditChange[];
  
  // Metadata
  severity: AuditSeverity;
  timestamp: Date;
  sessionId?: string;
  requestId?: string;
  
  // Additional context
  metadata?: Record<string, any>;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLogFilter {
  tenantId?: string;
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: AuditResource | AuditResource[];
  resourceId?: string;
  severity?: AuditSeverity | AuditSeverity[];
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalEntries: number;
  byAction: Record<AuditAction, number>;
  byResource: Record<AuditResource, number>;
  bySeverity: Record<AuditSeverity, number>;
  topUsers: { userId: string; userName: string; count: number }[];
  recentActivity: AuditLogEntry[];
}

// Severity mapping for actions
const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  CREATE: 'low',
  UPDATE: 'low',
  DELETE: 'medium',
  VIEW: 'low',
  EXPORT: 'medium',
  LOGIN: 'low',
  LOGOUT: 'low',
  LOGIN_FAILED: 'medium',
  PASSWORD_CHANGE: 'medium',
  PERMISSION_CHANGE: 'high',
  SETTINGS_CHANGE: 'medium',
  PAYMENT_RECEIVED: 'medium',
  PAYMENT_REFUND: 'high',
  RESERVATION_CREATE: 'low',
  RESERVATION_CANCEL: 'medium',
  LEAD_ASSIGN: 'low',
  LEAD_STATUS_CHANGE: 'low',
  DOCUMENT_GENERATE: 'low',
  SMS_SENT: 'low',
  EMAIL_SENT: 'low',
  '2FA_ENABLED': 'medium',
  '2FA_DISABLED': 'high',
  API_KEY_CREATED: 'high',
  API_KEY_REVOKED: 'high',
};

/**
 * Generate unique audit log ID
 */
function generateAuditId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `audit_${timestamp}_${random}`;
}

/**
 * Calculate changes between old and new values
 */
export function calculateChanges(
  oldValue: Record<string, any> | undefined,
  newValue: Record<string, any> | undefined
): AuditChange[] {
  const changes: AuditChange[] = [];
  
  if (!oldValue && !newValue) return changes;
  
  const allKeys = new Set([
    ...Object.keys(oldValue || {}),
    ...Object.keys(newValue || {}),
  ]);
  
  for (const key of allKeys) {
    const oldVal = oldValue?.[key];
    const newVal = newValue?.[key];
    
    // Skip internal fields
    if (key.startsWith('_') || key === 'updatedAt' || key === 'createdAt') {
      continue;
    }
    
    // Check if values are different
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }
  
  return changes;
}

/**
 * Mask sensitive data in audit logs
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password', 'secret', 'token', 'apiKey', 'apiSecret',
    'cardNumber', 'cvv', 'pin', 'ssn', 'nationalId',
  ];
  
  const masked = { ...data };
  
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      masked[key] = '********';
    }
  }
  
  return masked;
}

/**
 * Format audit entry for display
 */
export function formatAuditDescription(entry: Partial<AuditLogEntry>): string {
  const { action, resource, resourceName, userName } = entry;
  
  const actionVerbs: Record<AuditAction, string> = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    VIEW: 'viewed',
    EXPORT: 'exported',
    LOGIN: 'logged in',
    LOGOUT: 'logged out',
    LOGIN_FAILED: 'failed login attempt',
    PASSWORD_CHANGE: 'changed password',
    PERMISSION_CHANGE: 'changed permissions for',
    SETTINGS_CHANGE: 'updated settings',
    PAYMENT_RECEIVED: 'recorded payment for',
    PAYMENT_REFUND: 'processed refund for',
    RESERVATION_CREATE: 'created reservation for',
    RESERVATION_CANCEL: 'cancelled reservation for',
    LEAD_ASSIGN: 'assigned lead',
    LEAD_STATUS_CHANGE: 'changed status for lead',
    DOCUMENT_GENERATE: 'generated document',
    SMS_SENT: 'sent SMS',
    EMAIL_SENT: 'sent email',
    '2FA_ENABLED': 'enabled 2FA',
    '2FA_DISABLED': 'disabled 2FA',
    API_KEY_CREATED: 'created API key',
    API_KEY_REVOKED: 'revoked API key',
  };
  
  const verb = action ? actionVerbs[action] : 'performed action on';
  const target = resourceName || resource || 'unknown';
  
  return `${userName || 'User'} ${verb} ${target}`;
}

/**
 * Audit Logger Class
 */
export class AuditLogger {
  private tenantId: string;
  private storage: Map<string, AuditLogEntry> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'tenantId' | 'timestamp' | 'severity'>): Promise<AuditLogEntry> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: generateAuditId(),
      tenantId: this.tenantId,
      timestamp: new Date(),
      severity: ACTION_SEVERITY[entry.action] || 'low',
      description: entry.description || formatAuditDescription(entry),
      oldValue: entry.oldValue ? maskSensitiveData(entry.oldValue) : undefined,
      newValue: entry.newValue ? maskSensitiveData(entry.newValue) : undefined,
    };
    
    // Calculate changes if both old and new values exist
    if (entry.oldValue && entry.newValue && !entry.changes) {
      fullEntry.changes = calculateChanges(entry.oldValue, entry.newValue);
    }
    
    // Store in memory (replace with database in production)
    this.storage.set(fullEntry.id, fullEntry);
    
    // In production, also persist to database
    // await prisma.auditLog.create({ data: fullEntry });
    
    // Log critical events to console
    if (fullEntry.severity === 'critical' || fullEntry.severity === 'high') {
      console.warn(`[AUDIT] ${fullEntry.severity.toUpperCase()}: ${fullEntry.description}`, {
        action: fullEntry.action,
        resource: fullEntry.resource,
        userId: fullEntry.userId,
        timestamp: fullEntry.timestamp,
      });
    }
    
    return fullEntry;
  }

  /**
   * Log user action helper
   */
  async logUserAction(
    user: { id: string; name: string; email: string; role: string },
    action: AuditAction,
    resource: AuditResource,
    details: {
      resourceId?: string;
      resourceName?: string;
      description?: string;
      oldValue?: Record<string, any>;
      newValue?: Record<string, any>;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditLogEntry> {
    const { description, ...rest } = details;
    const entryDescription =
      description ??
      formatAuditDescription({
        action,
        resource,
        resourceName: details.resourceName,
        userName: user.name,
      });

    return this.log({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource,
      description: entryDescription,
      ...rest,
    });
  }

  /**
   * Query audit logs
   */
  async query(filter: AuditLogFilter): Promise<{
    entries: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    let entries = Array.from(this.storage.values());
    
    // Apply filters
    if (filter.tenantId) {
      entries = entries.filter(e => e.tenantId === filter.tenantId);
    }
    if (filter.userId) {
      entries = entries.filter(e => e.userId === filter.userId);
    }
    if (filter.action) {
      const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
      entries = entries.filter(e => actions.includes(e.action));
    }
    if (filter.resource) {
      const resources = Array.isArray(filter.resource) ? filter.resource : [filter.resource];
      entries = entries.filter(e => resources.includes(e.resource));
    }
    if (filter.resourceId) {
      entries = entries.filter(e => e.resourceId === filter.resourceId);
    }
    if (filter.severity) {
      const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity];
      entries = entries.filter(e => severities.includes(e.severity));
    }
    if (filter.startDate) {
      entries = entries.filter(e => new Date(e.timestamp) >= filter.startDate!);
    }
    if (filter.endDate) {
      entries = entries.filter(e => new Date(e.timestamp) <= filter.endDate!);
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      entries = entries.filter(e =>
        e.description.toLowerCase().includes(term) ||
        e.userName.toLowerCase().includes(term) ||
        e.resourceName?.toLowerCase().includes(term)
      );
    }
    
    // Sort by timestamp descending
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const total = entries.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    
    entries = entries.slice(offset, offset + limit);
    
    return {
      entries,
      total,
      hasMore: offset + entries.length < total,
    };
  }

  /**
   * Get statistics
   */
  async getStats(filter?: Partial<AuditLogFilter>): Promise<AuditLogStats> {
    const { entries } = await this.query({ ...filter, limit: 10000 });
    
    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const userCounts: Record<string, { userId: string; userName: string; count: number }> = {};
    
    for (const entry of entries) {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      byResource[entry.resource] = (byResource[entry.resource] || 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
      
      if (!userCounts[entry.userId]) {
        userCounts[entry.userId] = { userId: entry.userId, userName: entry.userName, count: 0 };
      }
      userCounts[entry.userId].count++;
    }
    
    return {
      totalEntries: entries.length,
      byAction: byAction as Record<AuditAction, number>,
      byResource: byResource as Record<AuditResource, number>,
      bySeverity: bySeverity as Record<AuditSeverity, number>,
      topUsers: Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recentActivity: entries.slice(0, 10),
    };
  }

  /**
   * Export audit logs
   */
  async export(filter: AuditLogFilter, format: 'json' | 'csv'): Promise<string> {
    const { entries } = await this.query({ ...filter, limit: 10000 });
    
    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    }
    
    // CSV format
    const headers = [
      'ID', 'Timestamp', 'User', 'Email', 'Role', 'Action',
      'Resource', 'Resource ID', 'Description', 'Severity', 'IP Address'
    ];
    
    const rows = entries.map(e => [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.userName,
      e.userEmail,
      e.userRole,
      e.action,
      e.resource,
      e.resourceId || '',
      `"${e.description.replace(/"/g, '""')}"`,
      e.severity,
      e.ipAddress || '',
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

/**
 * Create audit middleware for API routes
 */
export function createAuditMiddleware(tenantId: string) {
  const logger = new AuditLogger(tenantId);
  
  return {
    logger,
    
    // Log API request
    logRequest: async (
      user: { id: string; name: string; email: string; role: string },
      action: AuditAction,
      resource: AuditResource,
      details: any,
      request: Request
    ) => {
      return logger.logUserAction(user, action, resource, {
        ...details,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      });
    },
  };
}

export default AuditLogger;
