// Sync hooks for React components

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncManager, type SyncStatus, type SyncEvent } from "./SyncManager";
import { useAuth } from "@/app/auth";
import { useNetworkStatus } from "@/shared/api";

// Hook to get sync status
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [lastMessage, setLastMessage] = useState<string>();
  const [progress, setProgress] = useState({ pushed: 0, pulled: 0 });

  useEffect(() => {
    return syncManager.subscribe((event: SyncEvent) => {
      if (event.type === "status") {
        setStatus(event.status!);
        setLastMessage(event.message);
      } else if (event.type === "progress") {
        setProgress(event.progress!);
      }
    });
  }, []);

  return { status, lastMessage, progress };
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
