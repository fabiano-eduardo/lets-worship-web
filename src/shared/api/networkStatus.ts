// Network status hook and sync manager

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/auth";

export interface NetworkStatus {
  isOnline: boolean;
  isAuthenticated: boolean;
  canSync: boolean;
}

// Hook to track network and auth status
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isAuthenticated,
    canSync: isOnline && isAuthenticated,
  };
}

// Sync status for background operations
export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  error: string | null;
}

// Hook for managing sync state
export function useSyncManager() {
  const { canSync, isOnline, isAuthenticated } = useNetworkStatus();
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    lastSyncAt: null,
    error: null,
  });

  // Attempt to sync with exponential backoff
  const sync = useCallback(
    async (syncFn: () => Promise<void>) => {
      if (!canSync) {
        return;
      }

      setSyncState((prev) => ({ ...prev, status: "syncing", error: null }));

      let attempt = 0;
      const maxAttempts = 3;
      const baseDelay = 1000;

      while (attempt < maxAttempts) {
        try {
          await syncFn();
          setSyncState({
            status: "success",
            lastSyncAt: new Date(),
            error: null,
          });
          return;
        } catch (err) {
          attempt++;

          if (attempt >= maxAttempts) {
            setSyncState({
              status: "error",
              lastSyncAt: null,
              error: err instanceof Error ? err.message : "Sync failed",
            });
            return;
          }

          // Exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    },
    [canSync],
  );

  // Auto-sync when coming online (if authenticated)
  useEffect(() => {
    if (canSync && syncState.status === "idle") {
      // Could trigger automatic sync here
    }
  }, [canSync, syncState.status]);

  return {
    ...syncState,
    isOnline,
    isAuthenticated,
    canSync,
    sync,
  };
}
