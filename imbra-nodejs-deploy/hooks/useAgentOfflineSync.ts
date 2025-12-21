'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, queueAction, listQueued, clearQueued, countQueued, QueuedAction, ActionType } from '../lib/offline-queue';
import { useToast } from '@/components/ui/use-toast';
import { makeApiUrl } from '@/lib/config/api';

export interface SyncStatus {
  isOnline: boolean;
  isConnectedToServer: boolean;
  queuedCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncErrors: string[];
}

export interface AgentSyncHook {
  // Status
  syncStatus: SyncStatus;
  
  // Queue management
  queueAction: (action: Omit<QueuedAction, 'clientGeneratedId' | 'createdAt'>) => Promise<string>;
  listQueued: () => Promise<QueuedAction[]>;
  clearQueue: () => Promise<void>;
  
  // Sync operations
  syncNow: () => Promise<void>;
  enableAutoSync: (intervalMs?: number) => void;
  disableAutoSync: () => void;
  
  // Specific agent actions
  createLeadOffline: (leadData: any) => Promise<string>;
  updateLeadStatusOffline: (leadId: string, status: string, notes?: string) => Promise<string>;
  addLeadNoteOffline: (leadId: string, note: string) => Promise<string>;
  updateAgentProfileOffline: (profileData: any) => Promise<string>;
  createQuoteOffline: (quoteData: any) => Promise<string>;
}

export function useAgentOfflineSync(): AgentSyncHook {
  const { toast } = useToast();
  
  // State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isConnectedToServer: false,
    queuedCount: 0,
    isSyncing: false,
    lastSyncAt: null,
    syncErrors: [],
  });
  
  const [autoSyncInterval, setAutoSyncInterval] = useState<NodeJS.Timeout | null>(null);

  /**
   * Check server connectivity
   */
  const checkServerConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(makeApiUrl('/api/agent/ping'), {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      return response.ok;
    } catch (error) {
      console.warn('Server connection check failed:', error);
      return false;
    }
  }, []);

  /**
   * Update sync status
   */
  const updateSyncStatus = useCallback(async () => {
    const queuedCount = await countQueued();
    const isConnectedToServer = syncStatus.isOnline ? await checkServerConnection() : false;
    
    setSyncStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isConnectedToServer,
      queuedCount,
    }));
  }, [checkServerConnection, syncStatus.isOnline]);

  /**
   * Sync queued actions with server
   */
  const syncQueuedActions = useCallback(async (): Promise<void> => {
    if (!syncStatus.isOnline || !syncStatus.isConnectedToServer || syncStatus.isSyncing) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      const queuedActions = await listQueued();
      if (queuedActions.length === 0) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSyncAt: new Date() 
        }));
        return;
      }

      console.log(`🔄 Syncing ${queuedActions.length} queued actions...`);

      const syncResponse = await fetch(makeApiUrl('/api/agent/sync'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
        },
        body: JSON.stringify({ actions: queuedActions }),
      });

      if (!syncResponse.ok) {
        throw new Error(`Sync failed: ${syncResponse.status} ${syncResponse.statusText}`);
      }

      const result = await syncResponse.json();
      
      // Clear successfully synced actions
      if (result.syncedActions && result.syncedActions.length > 0) {
        await Promise.all(
          result.syncedActions.map((actionId: string) => clearQueued(actionId))
        );
        
        toast({
          title: "🔄 Sync Complete",
          description: `${result.syncedActions.length} actions synced successfully`,
        });
      }

      // Handle sync errors
      const syncErrors: string[] = [];
      if (result.failedActions && result.failedActions.length > 0) {
        result.failedActions.forEach((failed: any) => {
          syncErrors.push(`${failed.actionId}: ${failed.error}`);
        });
      }

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncErrors,
        queuedCount: prev.queuedCount - (result.syncedActions?.length || 0),
      }));

      if (syncErrors.length > 0) {
        toast({
          title: "⚠️ Partial Sync",
          description: `${syncErrors.length} actions failed to sync`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [errorMessage],
      }));

      toast({
        title: "❌ Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [syncStatus.isOnline, syncStatus.isConnectedToServer, syncStatus.isSyncing, toast]);

  /**
   * Queue an action (wrapper with UI feedback)
   */
  const queueActionWithFeedback = useCallback(async (action: Omit<QueuedAction, 'clientGeneratedId' | 'createdAt'>): Promise<string> => {
    const actionId = await queueAction(action);
    
    // Update queued count
    setSyncStatus(prev => ({ 
      ...prev, 
      queuedCount: prev.queuedCount + 1 
    }));

    // Show offline notification
    if (!syncStatus.isOnline) {
      toast({
        title: "📱 Offline Action",
        description: "Action saved locally. Will sync when online.",
      });
    } else {
      toast({
        title: "📄 Action Queued",
        description: "Action queued for sync.",
      });
      
      // Auto-sync if online
      setTimeout(syncQueuedActions, 1000);
    }

    return actionId;
  }, [syncStatus.isOnline, syncQueuedActions, toast]);

  /**
   * Specific agent actions
   */
  const createLeadOffline = useCallback(async (leadData: any): Promise<string> => {
    return await queueActionWithFeedback({
      type: 'CREATE_LEAD',
      payload: leadData,
    });
  }, [queueActionWithFeedback]);

  const updateLeadStatusOffline = useCallback(async (leadId: string, status: string, notes?: string): Promise<string> => {
    return await queueActionWithFeedback({
      type: 'UPDATE_LEAD_STATUS',
      payload: { leadId, status, notes },
    });
  }, [queueActionWithFeedback]);

  const addLeadNoteOffline = useCallback(async (leadId: string, note: string): Promise<string> => {
    return await queueActionWithFeedback({
      type: 'ADD_LEAD_NOTE',
      payload: { leadId, note },
    });
  }, [queueActionWithFeedback]);

  const updateAgentProfileOffline = useCallback(async (profileData: any): Promise<string> => {
    return await queueActionWithFeedback({
      type: 'UPDATE_AGENT_PROFILE',
      payload: profileData,
    });
  }, [queueActionWithFeedback]);

  const createQuoteOffline = useCallback(async (quoteData: any): Promise<string> => {
    return await queueActionWithFeedback({
      type: 'CREATE_QUOTE',
      payload: quoteData,
    });
  }, [queueActionWithFeedback]);

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(async (): Promise<void> => {
    await offlineQueue.clearAll();
    setSyncStatus(prev => ({ ...prev, queuedCount: 0 }));
    
    toast({
      title: "🗑️ Queue Cleared",
      description: "All queued actions have been cleared.",
    });
  }, [toast]);

  /**
   * Enable auto-sync
   */
  const enableAutoSync = useCallback((intervalMs: number = 30000): void => {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
    }

    const interval = setInterval(async () => {
      if (syncStatus.isOnline && !syncStatus.isSyncing) {
        await syncQueuedActions();
      }
    }, intervalMs);

    setAutoSyncInterval(interval);
    console.log('🔄 Auto-sync enabled with interval:', intervalMs);
  }, [autoSyncInterval, syncStatus.isOnline, syncStatus.isSyncing, syncQueuedActions]);

  /**
   * Disable auto-sync
   */
  const disableAutoSync = useCallback((): void => {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      setAutoSyncInterval(null);
    }
    console.log('⏹️ Auto-sync disabled');
  }, [autoSyncInterval]);

  /**
   * Manual sync trigger
   */
  const syncNow = useCallback(async (): Promise<void> => {
    await syncQueuedActions();
  }, [syncQueuedActions]);

  // Effects
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "🌐 Back Online",
        description: "Connection restored. Syncing queued actions...",
      });
      setTimeout(syncQueuedActions, 1000);
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, isConnectedToServer: false }));
      toast({
        title: "📱 Offline Mode",
        description: "Actions will be queued until connection is restored.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueuedActions, toast]);

  useEffect(() => {
    updateSyncStatus();
  }, [updateSyncStatus]);

  useEffect(() => {
    // Initial sync check
    if (syncStatus.isOnline) {
      syncQueuedActions();
    }
  }, [syncStatus.isOnline, syncQueuedActions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
      }
    };
  }, [autoSyncInterval]);

  return {
    syncStatus,
    queueAction: queueActionWithFeedback,
    listQueued,
    clearQueue,
    syncNow,
    enableAutoSync,
    disableAutoSync,
    createLeadOffline,
    updateLeadStatusOffline,
    addLeadNoteOffline,
    updateAgentProfileOffline,
    createQuoteOffline,
  };
}