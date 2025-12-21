/**
 * IndexedDB Queue Utility for Agent Offline Sync
 * Handles queuing of actions when offline and syncing when online
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface OfflineQueueDB extends DBSchema {
  actions: {
    key: string; // clientGeneratedId
    value: QueuedAction;
    indexes: {
      'by-created': string; // createdAt
      'by-type': string;    // type
    };
  };
}

export interface QueuedAction {
  clientGeneratedId: string; // UUID
  type: ActionType;
  payload: any;
  createdAt: string; // ISO string
  retryCount?: number;
  lastError?: string;
}

export type ActionType = 
  | 'CREATE_LEAD' 
  | 'UPDATE_LEAD_STATUS' 
  | 'ADD_LEAD_NOTE'
  | 'UPDATE_LEAD'
  | 'CREATE_QUOTE'
  | 'UPDATE_AGENT_PROFILE';

class OfflineQueue {
  private dbName = 'denuel-agent-offline';
  private version = 1;
  private db: IDBPDatabase<OfflineQueueDB> | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineQueueDB>(this.dbName, this.version, {
      upgrade(db) {
        // Create actions store
        const actionsStore = db.createObjectStore('actions', {
          keyPath: 'clientGeneratedId'
        });

        // Create indexes
        actionsStore.createIndex('by-created', 'createdAt');
        actionsStore.createIndex('by-type', 'type');
      },
    });
  }

  /**
   * Queue an action for later sync
   */
  async queueAction(action: Omit<QueuedAction, 'clientGeneratedId' | 'createdAt'>): Promise<string> {
    await this.init();
    
    const clientGeneratedId = this.generateUUID();
    const queuedAction: QueuedAction = {
      ...action,
      clientGeneratedId,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    await this.db!.add('actions', queuedAction);
    
    console.log('📄 Action queued:', queuedAction);
    return clientGeneratedId;
  }

  /**
   * Get all queued actions
   */
  async listQueued(): Promise<QueuedAction[]> {
    await this.init();
    return await this.db!.getAll('actions');
  }

  /**
   * Get queued actions by type
   */
  async getQueuedByType(type: ActionType): Promise<QueuedAction[]> {
    await this.init();
    return await this.db!.getAllFromIndex('actions', 'by-type', type);
  }

  /**
   * Clear a specific queued action by clientGeneratedId
   */
  async clearQueued(clientGeneratedId: string): Promise<void> {
    await this.init();
    await this.db!.delete('actions', clientGeneratedId);
    console.log('✅ Action cleared from queue:', clientGeneratedId);
  }

  /**
   * Clear multiple queued actions
   */
  async clearMultiple(clientGeneratedIds: string[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('actions', 'readwrite');
    
    await Promise.all([
      ...clientGeneratedIds.map(id => tx.store.delete(id)),
      tx.done
    ]);
    
    console.log('✅ Multiple actions cleared from queue:', clientGeneratedIds.length);
  }

  /**
   * Update retry count and error for failed action
   */
  async updateRetryInfo(clientGeneratedId: string, error: string): Promise<void> {
    await this.init();
    
    const action = await this.db!.get('actions', clientGeneratedId);
    if (!action) return;

    action.retryCount = (action.retryCount || 0) + 1;
    action.lastError = error;

    await this.db!.put('actions', action);
    console.log('🔄 Action retry updated:', clientGeneratedId, 'retries:', action.retryCount);
  }

  /**
   * Count total queued actions
   */
  async countQueued(): Promise<number> {
    await this.init();
    return await this.db!.count('actions');
  }

  /**
   * Clear all queued actions (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('actions');
    console.log('🗑️ All queued actions cleared');
  }

  /**
   * Get actions older than specified hours (for cleanup)
   */
  async getOldActions(hoursOld: number = 24): Promise<QueuedAction[]> {
    await this.init();
    
    const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    const allActions = await this.db!.getAll('actions');
    
    return allActions.filter(action => 
      new Date(action.createdAt) < cutoffDate
    );
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<ActionType, number>;
    oldestAction: string | null;
    newestAction: string | null;
  }> {
    await this.init();
    
    const actions = await this.db!.getAll('actions');
    const byType: Record<ActionType, number> = {} as any;
    
    actions.forEach(action => {
      byType[action.type] = (byType[action.type] || 0) + 1;
    });

    const sortedByDate = actions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      total: actions.length,
      byType,
      oldestAction: sortedByDate[0]?.createdAt || null,
      newestAction: sortedByDate[sortedByDate.length - 1]?.createdAt || null,
    };
  }

  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

// Utility functions for easier usage
export async function queueAction(action: Omit<QueuedAction, 'clientGeneratedId' | 'createdAt'>): Promise<string> {
  return await offlineQueue.queueAction(action);
}

export async function listQueued(): Promise<QueuedAction[]> {
  return await offlineQueue.listQueued();
}

export async function clearQueued(clientGeneratedId: string): Promise<void> {
  return await offlineQueue.clearQueued(clientGeneratedId);
}

export async function countQueued(): Promise<number> {
  return await offlineQueue.countQueued();
}

export async function getQueueStats() {
  return await offlineQueue.getStats();
}

// Export the class for advanced usage
export { OfflineQueue };