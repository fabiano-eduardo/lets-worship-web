// TanStack Query hooks for Songs — Online-first via GraphQL SDK

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/queryClient";
import {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} from "@/graphql/api";
import type { SongFromList, SongDetail } from "@/graphql/api";
import type { GraphQLRequestError } from "@/graphql/client";

// ---------------------------------------------------------------------------
// Re-export derived types for backward compatibility
// ---------------------------------------------------------------------------
export type SongFromServer = SongFromList;
export type SongDetailFromServer = SongDetail;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Hook to get all songs
 */
export function useSongs(search?: string) {
  const result = useQuery<
    Awaited<ReturnType<typeof listSongs>>,
    GraphQLRequestError
  >({
    queryKey: queryKeys.songs.list(search ? { search } : undefined),
    queryFn: () => listSongs({ search: search || undefined }),
  });

  return {
    ...result,
    data: result.data?.songs,
  };
}

/**
 * Hook to search songs (convenience wrapper)
 */
export function useSearchSongs(query: string) {
  return useSongs(query.length > 0 ? query : undefined);
}

/**
 * Hook to get a single song
 */
export function useSong(id: string) {
  const result = useQuery<
    Awaited<ReturnType<typeof getSong>>,
    GraphQLRequestError
  >({
    queryKey: queryKeys.songs.detail(id),
    queryFn: () => getSong(id),
    enabled: !!id,
  });

  return {
    ...result,
    data: result.data ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Hook to create a song.
 * Returns the created song from the Payload.
 */
export function useCreateSong() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof createSong>>,
    GraphQLRequestError,
    { title: string; artist?: string | null }
  >({
    mutationFn: (input) => createSong(input),
    onSuccess: (data) => {
      if (!data.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (input: { title: string; artist?: string | null }) => {
      const payload = await mutation.mutateAsync(input);
      if (!payload.ok || !payload.song) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao criar música";
        throw new Error(msg);
      }
      return payload.song;
    },
  };
}

/**
 * Hook to update a song.
 */
export function useUpdateSong() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof updateSong>>,
    GraphQLRequestError,
    {
      id: string;
      input: {
        title?: string;
        artist?: string | null;
        defaultVersionId?: string | null;
      };
    }
  >({
    mutationFn: (args) => updateSong(args.id, args.input),
    onSuccess: (data) => {
      if (!data.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      if (data.song) {
        queryClient.setQueryData(queryKeys.songs.detail(data.song.id), {
          song: data.song,
        });
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: async (args: {
      id: string;
      input: {
        title?: string;
        artist?: string | null;
        defaultVersionId?: string | null;
      };
    }) => {
      const payload = await mutation.mutateAsync(args);
      if (!payload.ok || !payload.song) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao atualizar música";
        throw new Error(msg);
      }
      return payload.song;
    },
  };
}

/**
 * Hook to delete a song.
 */
export function useDeleteSong() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof deleteSong>>,
    GraphQLRequestError,
    string
  >({
    mutationFn: (id) => deleteSong(id),
    onSuccess: (data) => {
      if (!data.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (id: string) => {
      const payload = await mutation.mutateAsync(id);
      if (!payload.ok) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao remover música";
        throw new Error(msg);
      }
    },
  };
}
