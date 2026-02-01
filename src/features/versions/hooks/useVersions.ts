// TanStack Query hooks for Versions

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { versionRepository } from "@/db/versionRepository";
import { queryKeys } from "@/app/queryClient";
import type { CreateVersionInput, UpdateVersionInput } from "@/shared/types";

/**
 * Hook to get all versions for a song
 */
export function useVersions(songId: string) {
  return useQuery({
    queryKey: queryKeys.versions.bySong(songId),
    queryFn: () => versionRepository.getBySongId(songId),
    enabled: !!songId,
  });
}

/**
 * Hook to get a single version
 */
export function useVersion(id: string) {
  return useQuery({
    queryKey: queryKeys.versions.detail(id),
    queryFn: () => versionRepository.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get pinned versions
 */
export function usePinnedVersions() {
  return useQuery({
    queryKey: queryKeys.versions.pinned(),
    queryFn: () => versionRepository.getPinned(),
  });
}

/**
 * Hook to create a version
 */
export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVersionInput) => versionRepository.create(input),
    onSuccess: (version) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.versions.bySong(version.songId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });
}

/**
 * Hook to update a version
 */
export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVersionInput }) =>
      versionRepository.update(id, input),
    onSuccess: (version) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.versions.bySong(version.songId),
      });
      queryClient.setQueryData(queryKeys.versions.detail(version.id), version);
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.pinned() });
    },
  });
}

/**
 * Hook to toggle pinned status
 */
export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => versionRepository.togglePinned(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
    },
  });
}

/**
 * Hook to delete a version
 */
export function useDeleteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => versionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });
}
