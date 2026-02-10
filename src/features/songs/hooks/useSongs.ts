// TanStack Query hooks for Songs — Online-first via GraphQL

import { useQueryClient } from "@tanstack/react-query";
import { useGraphQLQuery, useGraphQLMutation } from "@/graphql/hooks";
import { queryKeys } from "@/app/queryClient";
import {
  SongsDocument,
  SongDocument,
  CreateSongDocument,
  UpdateSongDocument,
  DeleteSongDocument,
} from "@/graphql/generated/graphql";
import type { SongsQuery, SongQuery } from "@/graphql/generated/graphql";

// ---------------------------------------------------------------------------
// Derived types from codegen
// ---------------------------------------------------------------------------
export type SongFromServer = NonNullable<SongsQuery["songs"]["songs"]>[number];
export type SongDetailFromServer = NonNullable<SongQuery["song"]>;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Hook to get all songs
 */
export function useSongs(search?: string) {
  const result = useGraphQLQuery(
    queryKeys.songs.list(search ? { search } : undefined),
    SongsDocument,
    { search: search || undefined },
  );

  return {
    ...result,
    data: result.data?.songs.songs,
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
  const result = useGraphQLQuery(
    queryKeys.songs.detail(id),
    SongDocument,
    { id },
    { enabled: !!id },
  );

  return {
    ...result,
    data: result.data?.song ?? undefined,
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

  const mutation = useGraphQLMutation(CreateSongDocument, {
    onSuccess: (data) => {
      if (!data.createSong.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (input: { title: string; artist?: string | null }) => {
      const result = await mutation.mutateAsync({ input });
      const payload = result.createSong;
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

  const mutation = useGraphQLMutation(UpdateSongDocument, {
    onSuccess: (data) => {
      if (!data.updateSong.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      if (data.updateSong.song) {
        queryClient.setQueryData(
          queryKeys.songs.detail(data.updateSong.song.id),
          { song: data.updateSong.song },
        );
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
      const result = await mutation.mutateAsync({
        id: args.id,
        input: args.input,
      });
      const payload = result.updateSong;
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

  const mutation = useGraphQLMutation(DeleteSongDocument, {
    onSuccess: (data) => {
      if (!data.deleteSong.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (id: string) => {
      const result = await mutation.mutateAsync({ id });
      const payload = result.deleteSong;
      if (!payload.ok) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao remover música";
        throw new Error(msg);
      }
    },
  };
}
