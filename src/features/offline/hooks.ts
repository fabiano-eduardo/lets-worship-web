// Offline hooks — React hooks for the offline library

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/queryClient";
import {
  getOfflineLibrary,
  isVersionAvailableOffline,
  downloadVersionOffline,
  updateVersionOffline,
  removeVersionOffline,
} from "./offlineManager";

/**
 * List all offline meta entries.
 */
export function useOfflineLibrary() {
  return useQuery({
    queryKey: queryKeys.offline.library(),
    queryFn: getOfflineLibrary,
  });
}

/**
 * Check if a specific version is available offline.
 */
export function useIsOfflineAvailable(versionId: string) {
  return useQuery({
    queryKey: queryKeys.offline.available(versionId),
    queryFn: () => isVersionAvailableOffline(versionId),
    enabled: !!versionId,
  });
}

/**
 * Download a version for offline use.
 */
export function useDownloadOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => downloadVersionOffline(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offline.all });
    },
  });
}

/**
 * Update an offline version if the server has a newer copy.
 */
export function useUpdateOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => updateVersionOffline(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offline.all });
    },
  });
}

/**
 * Remove a version from offline storage.
 */
export function useRemoveOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => removeVersionOffline(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offline.all });
    },
  });
}
