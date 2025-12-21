/**
 * Agent Offline Sync Status Component
 * Shows connection status and sync queue information
 */

'use client';

import React from 'react';
import { useAgentOfflineSync } from '@/hooks/useAgentOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Server,
  Smartphone
} from 'lucide-react';

interface OfflineSyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function OfflineSyncStatus({ showDetails = true, className }: OfflineSyncStatusProps) {
  const {
    syncStatus,
    syncNow,
    clearQueue,
    enableAutoSync,
    disableAutoSync,
  } = useAgentOfflineSync();

  const getConnectionBadge = () => {
    if (!syncStatus.isOnline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      );
    }

    if (!syncStatus.isConnectedToServer) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          Server Unreachable
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <Wifi className="h-3 w-3" />
        Online
      </Badge>
    );
  };

  const getSyncBadge = () => {
    if (syncStatus.isSyncing) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing...
        </Badge>
      );
    }

    if (syncStatus.queuedCount > 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {syncStatus.queuedCount} Queued
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        Synced
      </Badge>
    );
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getConnectionBadge()}
        {getSyncBadge()}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Offline Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          {getConnectionBadge()}
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sync Status</span>
          {getSyncBadge()}
        </div>

        {/* Last Sync */}
        {syncStatus.lastSyncAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm">
              {syncStatus.lastSyncAt.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Sync Errors */}
        {syncStatus.syncErrors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              Sync Errors ({syncStatus.syncErrors.length})
            </div>
            <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
              {syncStatus.syncErrors.map((error, index) => (
                <div key={index} className="truncate">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={syncNow}
            disabled={!syncStatus.isOnline || syncStatus.isSyncing}
            className="flex-1"
          >
            {syncStatus.isSyncing ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Sync Now
          </Button>

          {syncStatus.queuedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearQueue}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Auto-sync Controls */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-sync every 30s</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => enableAutoSync(30000)}
            className="h-6 px-2 text-xs"
          >
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact sync status for navigation bars
 */
export function CompactSyncStatus({ className }: { className?: string }) {
  return <OfflineSyncStatus showDetails={false} className={className} />;
}