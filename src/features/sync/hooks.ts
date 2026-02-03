// Sync hooks for React components

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  syncManager,
  type SyncStatus,
  type SyncEvent,
} from "./SyncManager";
import { syncNow, type SyncMode } from "./syncNow";
import { logSyncEvent } from "./syncTrace";
import { useAuth } from "@/app/auth";
import { useNetworkStatus } from "@/shared/api";
import { AuthenticationError } from "@/shared/api";
import { outboxRepository } from "./outboxRepository";
import { getSyncState } from "@/db";
import { queryKeys } from "@/app/queryClient";
import { sectionNotesKeys } from "@/features/songs/hooks/useSectionNotes";
import { songMapItemsKeys } from "@/features/versions/hooks/useSongMapItems";

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
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async (
    source: "manual" | "auto" = "manual",
    mode: SyncMode = "normal",
    clearLocalData: boolean = false,
  ) => {
    if (!isAuthenticated) {
      console.log("[useSync] Cannot sync: not authenticated");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncNow({ source, mode, clearLocalData });
      if (result.status === "success") {
        // Invalidate all relevant queries after sync
        const invalidatedKeys = [
          queryKeys.songs.all,
          queryKeys.versions.all,
          sectionNotesKeys.all,
          songMapItemsKeys.all,
          ["syncState"],
        ];

        invalidatedKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });

        logSyncEvent({
          correlationId: result.correlationId,
          source,
          event: "UI_INVALIDATE",
          payload: { queryKeys: invalidatedKeys },
        });
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient, isAuthenticated]);

  const canSync = isAuthenticated && !isSyncing;

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
      sync("auto");
    }
  }, [isOnline, isAuthenticated, sync]);

  // Sync on visibility change (coming back to foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && canSync && isOnline) {
        console.log("[useAutoSync] Visibility changed to visible, syncing...");
        sync("auto");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sync, canSync]);

  // Initial sync on mount
  useEffect(() => {
    if (canSync && isOnline) {
      sync("auto");
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sync, canSync };
}
