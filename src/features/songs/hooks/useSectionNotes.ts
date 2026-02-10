// Section Notes hooks — Online-first via GraphQL

import { useQueryClient } from "@tanstack/react-query";
import { useGraphQLQuery, useGraphQLMutation } from "@/graphql/hooks";
import { queryKeys } from "@/app/queryClient";
import {
  SectionNotesDocument,
  SectionNotesBySectionDocument,
  CreateSectionNoteDocument,
  UpdateSectionNoteDocument,
  DeleteSectionNoteDocument,
} from "@/graphql/generated/graphql";
import type {
  SectionNotesQuery,
  AnchorType,
} from "@/graphql/generated/graphql";
import type { SectionNoteAnchor, SectionNoteEntity } from "@/shared/types";

// ---------------------------------------------------------------------------
// Derived type from codegen
// ---------------------------------------------------------------------------
export type SectionNoteFromServer = SectionNotesQuery["sectionNotes"][number];

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get all notes for a version */
export function useSectionNotes(versionId: string) {
  const result = useGraphQLQuery(
    queryKeys.notes.byVersion(versionId),
    SectionNotesDocument,
    { versionId },
    { enabled: !!versionId },
  );

  const rawNotes = result.data?.sectionNotes ?? [];
  const normalizedNotes: SectionNoteEntity[] = rawNotes.map((n) => ({
    id: n.id,
    versionId: n.versionId,
    sectionId: n.sectionId,
    anchor: {
      type: n.anchor.type.toLowerCase() as "line" | "range" | "word",
      lineIndex: n.anchor.lineIndex ?? undefined,
      wordOffset: n.anchor.wordOffset ?? undefined,
      fromLineIndex: n.anchor.fromLineIndex ?? undefined,
      toLineIndex: n.anchor.toLineIndex ?? undefined,
    },
    text: n.text,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }));

  return {
    ...result,
    data: normalizedNotes,
  };
}

/** Get notes for a specific section */
export function useSectionNotesBySection(versionId: string, sectionId: string) {
  const result = useGraphQLQuery(
    queryKeys.notes.bySection(versionId, sectionId),
    SectionNotesBySectionDocument,
    { versionId, sectionId },
    { enabled: !!versionId && !!sectionId },
  );

  const rawNotes = result.data?.sectionNotesBySection ?? [];
  const normalizedNotes: SectionNoteEntity[] = rawNotes.map((n) => ({
    id: n.id,
    versionId: n.versionId,
    sectionId: n.sectionId,
    anchor: {
      type: n.anchor.type.toLowerCase() as "line" | "range" | "word",
      lineIndex: n.anchor.lineIndex ?? undefined,
      wordOffset: n.anchor.wordOffset ?? undefined,
      fromLineIndex: n.anchor.fromLineIndex ?? undefined,
      toLineIndex: n.anchor.toLineIndex ?? undefined,
    },
    text: n.text,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }));

  return {
    ...result,
    data: normalizedNotes,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create note */
export function useCreateSectionNote() {
  const queryClient = useQueryClient();

  const mutation = useGraphQLMutation(CreateSectionNoteDocument, {
    onSuccess: (data) => {
      if (!data.createSectionNote.ok) return;
      const note = data.createSectionNote.sectionNote;
      if (note) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notes.byVersion(note.versionId),
        });
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: async (input: {
      versionId: string;
      sectionId: string;
      occurrenceId?: string | null;
      anchor: SectionNoteAnchor;
      text: string;
    }) => {
      const result = await mutation.mutateAsync({
        input: {
          versionId: input.versionId,
          sectionId: input.sectionId,
          occurrenceId: input.occurrenceId ?? undefined,
          text: input.text,
          anchor: {
            type: input.anchor.type.toUpperCase() as AnchorType,
            lineIndex: input.anchor.lineIndex,
            wordOffset: input.anchor.wordOffset,
            fromLineIndex: input.anchor.fromLineIndex,
            toLineIndex: input.anchor.toLineIndex,
          },
        },
      });
      const payload = result.createSectionNote;
      if (!payload.ok || !payload.sectionNote) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao criar nota";
        throw new Error(msg);
      }
      return payload.sectionNote;
    },
  };
}

/** Update note */
export function useUpdateSectionNote() {
  const queryClient = useQueryClient();

  const mutation = useGraphQLMutation(UpdateSectionNoteDocument, {
    onSuccess: (data) => {
      if (!data.updateSectionNote.ok) return;
      const note = data.updateSectionNote.sectionNote;
      if (note) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notes.byVersion(note.versionId),
        });
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: async (args: {
      id: string;
      anchor?: SectionNoteAnchor;
      text?: string;
      occurrenceId?: string | null;
    }) => {
      const { id, ...patch } = args;
      const gqlPatch: Record<string, unknown> = {};
      if (patch.text !== undefined) gqlPatch.text = patch.text;
      if (patch.occurrenceId !== undefined)
        gqlPatch.occurrenceId = patch.occurrenceId;
      if (patch.anchor) {
        gqlPatch.anchor = {
          type: patch.anchor.type.toUpperCase() as AnchorType,
          lineIndex: patch.anchor.lineIndex,
          wordOffset: patch.anchor.wordOffset,
          fromLineIndex: patch.anchor.fromLineIndex,
          toLineIndex: patch.anchor.toLineIndex,
        };
      }
      const result = await mutation.mutateAsync({ id, patch: gqlPatch });
      const payload = result.updateSectionNote;
      if (!payload.ok || !payload.sectionNote) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao atualizar nota";
        throw new Error(msg);
      }
      return payload.sectionNote;
    },
  };
}

/** Delete note */
export function useDeleteSectionNote(versionId: string) {
  const queryClient = useQueryClient();

  const mutation = useGraphQLMutation(DeleteSectionNoteDocument, {
    onSuccess: (data) => {
      if (!data.deleteSectionNote.ok) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.byVersion(versionId),
      });
    },
  });

  return {
    ...mutation,
    mutateAsync: async (id: string) => {
      const result = await mutation.mutateAsync({ id });
      const payload = result.deleteSectionNote;
      if (!payload.ok) {
        const msg =
          payload.errors?.map((e) => e.message).join(", ") ??
          "Erro ao remover nota";
        throw new Error(msg);
      }
      return true;
    },
  };
}
