// Sync hooks for React components

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  syncManager,
  type SyncStatus,
  type SyncEvent,
} from "./SyncManager";
import { useAuth } from "@/app/auth";
import { useNetworkStatus } from "@/shared/api";
import { AuthenticationError } from "@/shared/api";
import { outboxRepository } from "./outboxRepository";
import { getSyncState } from "@/db";

// Hook to get sync status
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [lastMessage, setLastMessage] = useState<string>();
  const [progress, setProgress] = useState({ pushed: 0, pulled: 0 });
  const { isOnline } = useNetworkStatus();
  const [pendingMutationsCount, setPendingMutationsCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [hasAuthError, setHasAuthError] = useState(false);

  const refreshSyncState = useCallback(async () => {
    try {
      const [counts, syncState] = await Promise.all([
        outboxRepository.countByStatus(),
        getSyncState(),
      ]);
      setPendingMutationsCount(counts.PENDING ?? 0);
      setLastSyncAt(syncState?.lastSyncAt ? new Date(syncState.lastSyncAt) : null);
    } catch (error) {
      console.error("[useSyncStatus] Failed to refresh sync state:", error);
    }
  }, []);

  useEffect(() => {
    return syncManager.subscribe((event: SyncEvent) => {
      if (event.type === "status") {
        setStatus(event.status!);
        setLastMessage(event.message);
        if (event.status !== "error") {
          setHasAuthError(false);
        }
        if (event.status === "success") {
          refreshSyncState();
        }
      } else if (event.type === "progress") {
        setProgress(event.progress!);
      } else if (event.type === "error") {
        setHasAuthError(event.error instanceof AuthenticationError);
        refreshSyncState();
      }
    });
  }, [refreshSyncState]);

  useEffect(() => {
    refreshSyncState();
    const interval = window.setInterval(refreshSyncState, 15000);
    return () => window.clearInterval(interval);
  }, [refreshSyncState]);

  return {
    status,
    lastMessage,
    progress,
    isOnline,
    pendingMutationsCount,
    lastSyncAt,
    hasAuthError,
    syncError: status === "error" ? lastMessage : undefined,
  };
}

// Hook to trigger sync with invalidation
export function useSync() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    if (!isAuthenticated || !isOnline) {
      console.log("[useSync] Cannot sync: not authenticated or offline");
      return;
    }

    setIsSyncing(true);
    try {
      await syncManager.sync();
      // Invalidate all relevant queries after sync
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["versions"] });
      queryClient.invalidateQueries({ queryKey: ["sectionNotes"] });
      queryClient.invalidateQueries({ queryKey: ["syncState"] });
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient, isAuthenticated, isOnline]);

  const canSync = isAuthenticated && isOnline && !isSyncing;

  return { sync, isSyncing, canSync };
}

// Hook to auto-sync on visibility change and online/offline
export function useAutoSync() {
  const { sync, canSync } = useSync();
  const { isOnline } = useNetworkStatus();
  const { isAuthenticated } = useAuth();

  // Sync when coming online
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      console.log("[useAutoSync] Online and authenticated, syncing...");
      sync();
    }
  }, [isOnline, isAuthenticated, sync]);

  // Sync on visibility change (coming back to foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && canSync) {
        console.log("[useAutoSync] Visibility changed to visible, syncing...");
        sync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sync, canSync]);

  // Initial sync on mount
  useEffect(() => {
    if (canSync) {
      sync();
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sync, canSync };
}
