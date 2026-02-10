// TanStack Query hooks for Versions — Online-first via GraphQL SDK

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/queryClient";
import {
  listSongVersions,
  getSongVersion,
  createSongVersion,
  updateSongVersion,
  deleteSongVersion,
} from "@/graphql/api";
import type { VersionListItem, VersionDetail } from "@/graphql/api";
import type { GraphQLRequestError } from "@/graphql/client";
import type {
  CreateSongVersionInput,
  UpdateSongVersionInput,
  MusicalMode,
} from "@/graphql/generated/sdk";
import type {
  ArrangementBlock,
  KeySignature,
  MusicalMeta,
  VersionArrangement,
  VersionReference,
} from "@/shared/types";

// ---------------------------------------------------------------------------
// Re-export derived types for backward compatibility
// ---------------------------------------------------------------------------
export type { VersionListItem, VersionDetail };

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Hook to get all versions for a song
 */
export function useVersions(songId: string) {
  const result = useQuery<
    Awaited<ReturnType<typeof listSongVersions>>,
    GraphQLRequestError
  >({
    queryKey: queryKeys.versions.bySong(songId),
    queryFn: () => listSongVersions(songId),
    enabled: !!songId,
  });

  return {
    ...result,
    data: result.data,
  };
}

/**
 * Hook to get a single version (full detail)
 */
export function useVersion(id: string) {
  const result = useQuery<
    Awaited<ReturnType<typeof getSongVersion>>,
    GraphQLRequestError
  >({
    queryKey: queryKeys.versions.detail(id),
    queryFn: () => getSongVersion(id),
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
 * Hook to create a version.
 */
export function useCreateVersion() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof createSongVersion>>,
    GraphQLRequestError,
    {
      songId: string;
      label: string;
      reference?: VersionReference;
      musicalMeta?: MusicalMeta;
      arrangement?: VersionArrangement;
    }
  >({
    mutationFn: (input) => {
      const gqlInput: CreateSongVersionInput = {
        songId: input.songId,
        label: input.label,
        reference: input.reference
          ? {
              youtubeUrl: input.reference.youtubeUrl || undefined,
              spotifyUrl: input.reference.spotifyUrl || undefined,
              descriptionIfNoLink:
                input.reference.descriptionIfNoLink || undefined,
            }
          : undefined,
        musicalMeta: input.musicalMeta
          ? {
              bpm: input.musicalMeta.bpm,
              timeSignature: input.musicalMeta.timeSignature,
              originalKey: input.musicalMeta.originalKey
                ? mapKeySignatureToInput(input.musicalMeta.originalKey)
                : undefined,
            }
          : undefined,
        arrangement: input.arrangement
          ? mapArrangementToInput(input.arrangement)
          : undefined,
      };
      return createSongVersion(gqlInput);
    },
    onSuccess: (data) => {
      if (!data.ok) return;
      const sv = data.songVersion;
      if (sv) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.versions.bySong(sv.songId),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: async (input: {
      songId: string;
      label: string;
      reference?: VersionReference;
      musicalMeta?: MusicalMeta;
      arrangement?: VersionArrangement;
    }) => {
      const payload = await mutation.mutateAsync(input);
      if (!payload.ok || !payload.songVersion) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao criar versão";
        throw new Error(msg);
      }
      return payload.songVersion;
    },
  };
}

/**
 * Hook to update a version.
 */
export function useUpdateVersion() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof updateSongVersion>>,
    GraphQLRequestError,
    {
      id: string;
      input: {
        label?: string;
        reference?: VersionReference;
        musicalMeta?: MusicalMeta;
        arrangement?: VersionArrangement;
      };
    }
  >({
    mutationFn: (args) => {
      const inp = args.input;
      const gqlInput: UpdateSongVersionInput = {};
      if (inp.label !== undefined) gqlInput.label = inp.label;
      if (inp.reference) {
        gqlInput.reference = {
          youtubeUrl: inp.reference.youtubeUrl || undefined,
          spotifyUrl: inp.reference.spotifyUrl || undefined,
          descriptionIfNoLink: inp.reference.descriptionIfNoLink || undefined,
        };
      }
      if (inp.musicalMeta) {
        gqlInput.musicalMeta = {
          bpm: inp.musicalMeta.bpm,
          timeSignature: inp.musicalMeta.timeSignature,
          originalKey: inp.musicalMeta.originalKey
            ? mapKeySignatureToInput(inp.musicalMeta.originalKey)
            : undefined,
        };
      }
      if (inp.arrangement) {
        gqlInput.arrangement = mapArrangementToInput(inp.arrangement);
      }
      return updateSongVersion(args.id, gqlInput);
    },
    onSuccess: (data) => {
      if (!data.ok) return;
      const sv = data.songVersion;
      if (sv) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.versions.bySong(sv.songId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.versions.detail(sv.id),
        });
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: async (args: {
      id: string;
      input: {
        label?: string;
        reference?: VersionReference;
        musicalMeta?: MusicalMeta;
        arrangement?: VersionArrangement;
      };
    }) => {
      const payload = await mutation.mutateAsync(args);
      if (!payload.ok || !payload.songVersion) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao atualizar versão";
        throw new Error(msg);
      }
      return payload.songVersion;
    },
  };
}

/**
 * Hook to delete a version.
 */
export function useDeleteVersion() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Awaited<ReturnType<typeof deleteSongVersion>>,
    GraphQLRequestError,
    string
  >({
    mutationFn: (id) => deleteSongVersion(id),
    onSuccess: (data) => {
      if (!data.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (id: string) => {
      const payload = await mutation.mutateAsync(id);
      if (!payload.ok) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao remover versão";
        throw new Error(msg);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapKeySignatureToInput(key: KeySignature) {
  if (key.type === "tonal") {
    return {
      type: "tonal" as const,
      root: key.root,
      tonalQuality: key.tonalQuality,
    };
  }
  return {
    type: "modal" as const,
    root: key.root,
    mode: key.mode.toUpperCase() as MusicalMode,
  };
}

function mapArrangementToInput(arrangement: VersionArrangement) {
  return {
    blocks: arrangement.blocks.map(
      (block: ArrangementBlock, index: number) => ({
        id: block.id,
        label: block.label || undefined,
        content: block.content,
        order: block.order ?? index,
        repeat: block.repeat ?? undefined,
      }),
    ),
  };
}
