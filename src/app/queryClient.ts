// TanStack Query client configuration — Online-first

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Unified query keys (single source of truth)
export const queryKeys = {
  songs: {
    all: ["songs"] as const,
    list: (filters?: { search?: string; cursor?: string }) =>
      [...queryKeys.songs.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.songs.all, "detail", id] as const,
  },
  versions: {
    all: ["versions"] as const,
    bySong: (songId: string) =>
      [...queryKeys.versions.all, "bySong", songId] as const,
    detail: (id: string) => [...queryKeys.versions.all, "detail", id] as const,
  },
  notes: {
    all: ["notes"] as const,
    byVersion: (versionId: string) =>
      [...queryKeys.notes.all, "byVersion", versionId] as const,
    bySection: (versionId: string, sectionId: string) =>
      [...queryKeys.notes.all, "bySection", versionId, sectionId] as const,
  },
  offline: {
    all: ["offline"] as const,
    library: () => [...queryKeys.offline.all, "library"] as const,
    version: (versionId: string) =>
      [...queryKeys.offline.all, "version", versionId] as const,
    available: (versionId: string) =>
      [...queryKeys.offline.all, "available", versionId] as const,
  },
  user: {
    me: ["user", "me"] as const,
  },
  health: ["health"] as const,
} as const;
