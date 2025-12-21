/**
 * AI Audit Logging Service
 * 
 * Logs all AI interactions for compliance, analytics, and debugging.
 * Supports multiple storage backends and retention policies.
 */

import { DepartmentPortal } from './pricing-tiers';
import { PlanTier } from './pricing-tiers';

// =============================================================================
// TYPES
// =============================================================================

export interface AIAuditEntry {
  id: string;
  tenantId: string;
  userId: string;
  department: DepartmentPortal;
  timestamp: Date;
  action: AIAuditAction;
  promptId?: string;
  quickActionId?: string;
  inputContext?: Record<string, any>;
  outputContent?: string;
  tokensUsed: number;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export type AIAuditAction = 
  | 'prompt_executed'
  | 'quick_action_executed'
  | 'rewrite'
  | 'summarize'
  | 'suggest'
  | 'custom_prompt'
  | 'error';

export interface AIUsageStats {
  tenantId: string;
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  totalRequests: number;
  totalTokens: number;
  byDepartment: Record<DepartmentPortal, {
    requests: number;
    tokens: number;
  }>;
  byAction: Record<AIAuditAction, number>;
  averageProcessingTime: number;
  errorRate: number;
}

export interface AuditLoggerConfig {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'minimal' | 'standard' | 'verbose';
  sensitiveFieldMasks: string[];
  batchSize: number;
  flushInterval: number;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: AuditLoggerConfig = {
  enabled: true,
  retentionDays: 90,
  logLevel: 'standard',
  sensitiveFieldMasks: ['password', 'token', 'secret', 'apiKey', 'creditCard'],
  batchSize: 50,
  flushInterval: 5000, // 5 seconds
};

// =============================================================================
// AUDIT LOGGER CLASS
// =============================================================================

export class AIAuditLogger {
  private config: AuditLoggerConfig;
  private buffer: AIAuditEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (this.config.enabled && typeof window !== 'undefined') {
      this.startFlushTimer();
    }
  }

  /**
   * Log an AI interaction
   */
  async log(entry: Omit<AIAuditEntry, 'id' | 'timestamp'>): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }

    const auditEntry: AIAuditEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      inputContext: this.maskSensitiveData(entry.inputContext),
    };

    // Add to buffer
    this.buffer.push(auditEntry);

    // Flush if buffer is full
    if (this.buffer.length >= this.config.batchSize) {
      await this.flush();
    }

    return auditEntry.id;
  }

  /**
   * Log a prompt execution
   */
  async logPrompt(params: {
    tenantId: string;
    userId: string;
    department: DepartmentPortal;
    promptId: string;
    context: Record<string, any>;
    output: string;
    tokensUsed: number;
    processingTimeMs: number;
    success: boolean;
    error?: string;
  }): Promise<string> {
    return this.log({
      tenantId: params.tenantId,
      userId: params.userId,
      department: params.department,
      action: 'prompt_executed',
      promptId: params.promptId,
      inputContext: params.context,
      outputContent: this.config.logLevel === 'verbose' ? params.output : undefined,
      tokensUsed: params.tokensUsed,
      processingTimeMs: params.processingTimeMs,
      success: params.success,
      errorMessage: params.error,
    });
  }

  /**
   * Log a quick action execution
   */
  async logQuickAction(params: {
    tenantId: string;
    userId: string;
    department: DepartmentPortal;
    actionId: string;
    context: Record<string, any>;
    output: string;
    tokensUsed: number;
    processingTimeMs: number;
    success: boolean;
    error?: string;
  }): Promise<string> {
    return this.log({
      tenantId: params.tenantId,
      userId: params.userId,
      department: params.department,
      action: 'quick_action_executed',
      quickActionId: params.actionId,
      inputContext: params.context,
      outputContent: this.config.logLevel === 'verbose' ? params.output : undefined,
      tokensUsed: params.tokensUsed,
      processingTimeMs: params.processingTimeMs,
      success: params.success,
      errorMessage: params.error,
    });
  }

  /**
   * Log an error
   */
  async logError(params: {
    tenantId: string;
    userId: string;
    department: DepartmentPortal;
    error: string;
    context?: Record<string, any>;
  }): Promise<string> {
    return this.log({
      tenantId: params.tenantId,
      userId: params.userId,
      department: params.department,
      action: 'error',
      inputContext: params.context,
      tokensUsed: 0,
      processingTimeMs: 0,
      success: false,
      errorMessage: params.error,
    });
  }

  /**
   * Flush buffered entries to storage
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      // In a real implementation, this would send to backend
      await this.persistEntries(entries);
    } catch (error) {
      // Re-add entries to buffer on failure
      this.buffer = [...entries, ...this.buffer];
      console.error('[AIAuditLogger] Failed to flush entries:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getStats(params: {
    tenantId: string;
    period: 'day' | 'week' | 'month';
    startDate?: Date;
  }): Promise<AIUsageStats> {
    const now = new Date();
    const startDate = params.startDate || this.calculateStartDate(now, params.period);
    const endDate = now;

    // In a real implementation, this would query the backend
    const entries = await this.fetchEntries({
      tenantId: params.tenantId,
      startDate,
      endDate,
    });

    return this.calculateStats(params.tenantId, params.period, startDate, endDate, entries);
  }

  /**
   * Get recent entries for a tenant
   */
  async getRecentEntries(params: {
    tenantId: string;
    limit?: number;
    department?: DepartmentPortal;
    userId?: string;
  }): Promise<AIAuditEntry[]> {
    // In a real implementation, this would query the backend
    return this.fetchEntries({
      tenantId: params.tenantId,
      department: params.department,
      userId: params.userId,
      limit: params.limit || 50,
    });
  }

  /**
   * Cleanup old entries based on retention policy
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    // In a real implementation, this would delete from backend
    return this.deleteEntriesBefore(cutoffDate);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maskSensitiveData(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return undefined;

    const masked = { ...data };
    
    const maskValue = (obj: any, path: string = ''): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const result: any = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const shouldMask = this.config.sensitiveFieldMasks.some(
          field => key.toLowerCase().includes(field.toLowerCase())
        );

        if (shouldMask && typeof value === 'string') {
          result[key] = '***MASKED***';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = maskValue(value, currentPath);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return maskValue(masked);
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private calculateStartDate(now: Date, period: 'day' | 'week' | 'month'): Date {
    const start = new Date(now);
    
    switch (period) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return start;
  }

  private calculateStats(
    tenantId: string,
    period: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date,
    entries: AIAuditEntry[]
  ): AIUsageStats {
    const byDepartment: Record<DepartmentPortal, { requests: number; tokens: number }> = {
      admin: { requests: 0, tokens: 0 },
      sales: { requests: 0, tokens: 0 },
      agent: { requests: 0, tokens: 0 },
      accountant: { requests: 0, tokens: 0 },
      hr: { requests: 0, tokens: 0 },
      graphic_design: { requests: 0, tokens: 0 },
      zr_operations: { requests: 0, tokens: 0 },
      custom: { requests: 0, tokens: 0 },
    };

    const byAction: Record<AIAuditAction, number> = {
      prompt_executed: 0,
      quick_action_executed: 0,
      rewrite: 0,
      summarize: 0,
      suggest: 0,
      custom_prompt: 0,
      error: 0,
    };

    let totalTokens = 0;
    let totalProcessingTime = 0;
    let errorCount = 0;

    for (const entry of entries) {
      byDepartment[entry.department].requests++;
      byDepartment[entry.department].tokens += entry.tokensUsed;
      byAction[entry.action]++;
      totalTokens += entry.tokensUsed;
      totalProcessingTime += entry.processingTimeMs;
      if (!entry.success) errorCount++;
    }

    return {
      tenantId,
      period,
      startDate,
      endDate,
      totalRequests: entries.length,
      totalTokens,
      byDepartment,
      byAction,
      averageProcessingTime: entries.length > 0 ? totalProcessingTime / entries.length : 0,
      errorRate: entries.length > 0 ? errorCount / entries.length : 0,
    };
  }

  // =============================================================================
  // STORAGE METHODS (to be implemented with actual backend)
  // =============================================================================

  private async persistEntries(entries: AIAuditEntry[]): Promise<void> {
    // In production, this would call the backend API
    // For now, we'll use localStorage as a demo
    if (typeof window === 'undefined') return;

    const storageKey = 'denuel_ai_audit_log';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = [...existing, ...entries].slice(-1000); // Keep last 1000 entries
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Also send to backend if available
    try {
      await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
    } catch {
      // Silently fail - entries are already in localStorage
    }
  }

  private async fetchEntries(params: {
    tenantId: string;
    startDate?: Date;
    endDate?: Date;
    department?: DepartmentPortal;
    userId?: string;
    limit?: number;
  }): Promise<AIAuditEntry[]> {
    // In production, this would query the backend API
    if (typeof window === 'undefined') return [];

    const storageKey = 'denuel_ai_audit_log';
    const all: AIAuditEntry[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    let filtered = all.filter(e => e.tenantId === params.tenantId);

    if (params.startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= params.endDate!);
    }
    if (params.department) {
      filtered = filtered.filter(e => e.department === params.department);
    }
    if (params.userId) {
      filtered = filtered.filter(e => e.userId === params.userId);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  private async deleteEntriesBefore(date: Date): Promise<number> {
    if (typeof window === 'undefined') return 0;

    const storageKey = 'denuel_ai_audit_log';
    const all: AIAuditEntry[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = all.filter(e => new Date(e.timestamp) >= date);
    const deleted = all.length - filtered.length;
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    return deleted;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let auditLoggerInstance: AIAuditLogger | null = null;

export function getAuditLogger(config?: Partial<AuditLoggerConfig>): AIAuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AIAuditLogger(config);
  }
  return auditLoggerInstance;
}

// =============================================================================
// REACT HOOK
// =============================================================================

export function useAuditLogger(config?: Partial<AuditLoggerConfig>): AIAuditLogger {
  return getAuditLogger(config);
}

export default AIAuditLogger;
