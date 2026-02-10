// TanStack Query hooks for Versions — Online-first via GraphQL

import { useQueryClient } from "@tanstack/react-query";
import { useGraphQLQuery, useGraphQLMutation } from "@/graphql/hooks";
import { queryKeys } from "@/app/queryClient";
import {
  SongVersionsDocument,
  SongVersionDocument,
  CreateSongVersionDocument,
  UpdateSongVersionDocument,
  DeleteSongVersionDocument,
} from "@/graphql/generated/graphql";
import type {
  SongVersionsQuery,
  SongVersionQuery,
  AnchorType,
} from "@/graphql/generated/graphql";
import type {
  KeySignature,
  MusicalMeta,
  VersionArrangement,
  VersionReference,
} from "@/shared/types";

// ---------------------------------------------------------------------------
// Derived types from codegen
// ---------------------------------------------------------------------------
export type VersionListItem = SongVersionsQuery["songVersions"][number];
export type VersionDetail = NonNullable<SongVersionQuery["songVersion"]>;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Hook to get all versions for a song
 */
export function useVersions(songId: string) {
  const result = useGraphQLQuery(
    queryKeys.versions.bySong(songId),
    SongVersionsDocument,
    { songId },
    { enabled: !!songId },
  );

  return {
    ...result,
    data: result.data?.songVersions,
  };
}

/**
 * Hook to get a single version (full detail)
 */
export function useVersion(id: string) {
  const result = useGraphQLQuery(
    queryKeys.versions.detail(id),
    SongVersionDocument,
    { id },
    { enabled: !!id },
  );

  return {
    ...result,
    data: result.data?.songVersion ?? undefined,
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

  const mutation = useGraphQLMutation(CreateSongVersionDocument, {
    onSuccess: (data) => {
      if (!data.createSongVersion.ok) return;
      const sv = data.createSongVersion.songVersion;
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
      const gqlInput = {
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
          ? {
              sections: input.arrangement.sections.map((s) => ({
                id: s.id,
                name: s.name,
                chordProText: s.chordProText,
                notes: s.notes.map((n) => ({
                  id: n.id,
                  sectionId: n.sectionId,
                  text: n.text,
                  anchor: {
                    type: n.anchor.type.toUpperCase() as AnchorType,
                    lineIndex: n.anchor.lineIndex,
                    wordOffset: n.anchor.wordOffset,
                    fromLineIndex: n.anchor.fromLineIndex,
                    toLineIndex: n.anchor.toLineIndex,
                  },
                })),
              })),
              sequence: input.arrangement.sequence.map((s) => ({
                sectionId: s.sectionId,
                repeat: s.repeat,
                sequenceNotes: s.sequenceNotes,
              })),
            }
          : undefined,
      };
      const result = await mutation.mutateAsync({ input: gqlInput });
      const payload = result.createSongVersion;
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

  const mutation = useGraphQLMutation(UpdateSongVersionDocument, {
    onSuccess: (data) => {
      if (!data.updateSongVersion.ok) return;
      const sv = data.updateSongVersion.songVersion;
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
      const inp = args.input;
      const gqlInput: Record<string, unknown> = {};
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
        gqlInput.arrangement = {
          sections: inp.arrangement.sections.map((s) => ({
            id: s.id,
            name: s.name,
            chordProText: s.chordProText,
            notes: s.notes.map((n) => ({
              id: n.id,
              sectionId: n.sectionId,
              text: n.text,
              anchor: {
                type: n.anchor.type.toUpperCase() as AnchorType,
                lineIndex: n.anchor.lineIndex,
                wordOffset: n.anchor.wordOffset,
                fromLineIndex: n.anchor.fromLineIndex,
                toLineIndex: n.anchor.toLineIndex,
              },
            })),
          })),
          sequence: inp.arrangement.sequence.map((s) => ({
            sectionId: s.sectionId,
            repeat: s.repeat,
            sequenceNotes: s.sequenceNotes,
          })),
        };
      }
      const result = await mutation.mutateAsync({
        id: args.id,
        input: gqlInput,
      });
      const payload = result.updateSongVersion;
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

  const mutation = useGraphQLMutation(DeleteSongVersionDocument, {
    onSuccess: (data) => {
      if (!data.deleteSongVersion.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (id: string) => {
      const result = await mutation.mutateAsync({ id });
      const payload = result.deleteSongVersion;
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
    mode: key.mode.toUpperCase() as import("@/graphql/generated/graphql").MusicalMode,
  };
}
