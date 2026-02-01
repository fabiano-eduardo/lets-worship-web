// TanStack Query client configuration

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Not needed for local-first
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for type safety and organization
export const queryKeys = {
  songs: {
    all: ["songs"] as const,
    list: () => [...queryKeys.songs.all, "list"] as const,
    detail: (id: string) => [...queryKeys.songs.all, "detail", id] as const,
    search: (query: string) =>
      [...queryKeys.songs.all, "search", query] as const,
  },
  versions: {
    all: ["versions"] as const,
    bySong: (songId: string) =>
      [...queryKeys.versions.all, "bySong", songId] as const,
    detail: (id: string) => [...queryKeys.versions.all, "detail", id] as const,
    pinned: () => [...queryKeys.versions.all, "pinned"] as const,
  },
  storage: {
    stats: ["storage", "stats"] as const,
  },
} as const;
