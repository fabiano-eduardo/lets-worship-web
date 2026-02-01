// TanStack Query hooks for Songs

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { songRepository } from "@/db/songRepository";
import { queryKeys } from "@/app/queryClient";
import type { CreateSongInput, UpdateSongInput } from "@/shared/types";

/**
 * Hook to get all songs
 */
export function useSongs() {
  return useQuery({
    queryKey: queryKeys.songs.list(),
    queryFn: () => songRepository.getAll(),
  });
}

/**
 * Hook to search songs
 */
export function useSearchSongs(query: string) {
  return useQuery({
    queryKey: queryKeys.songs.search(query),
    queryFn: () => songRepository.search(query),
    enabled: query.length > 0,
  });
}

/**
 * Hook to get a single song
 */
export function useSong(id: string) {
  return useQuery({
    queryKey: queryKeys.songs.detail(id),
    queryFn: () => songRepository.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a song
 */
export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSongInput) => songRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });
}

/**
 * Hook to update a song
 */
export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSongInput }) =>
      songRepository.update(id, input),
    onSuccess: (song) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.setQueryData(queryKeys.songs.detail(song.id), song);
    },
  });
}

/**
 * Hook to delete a song
 */
export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => songRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
    },
  });
}
