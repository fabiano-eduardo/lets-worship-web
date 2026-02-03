// Section Notes hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionNotesRepository } from "../repositories/sectionNotesRepository";
import type { SectionNoteAnchor } from "@/shared/types";

// Query keys for section notes
export const sectionNotesKeys = {
  all: ["sectionNotes"] as const,
  byVersion: (versionId: string) =>
    ["sectionNotes", "byVersion", versionId] as const,
  bySection: (versionId: string, sectionId: string) =>
    ["sectionNotes", "bySection", versionId, sectionId] as const,
  detail: (id: string) => ["sectionNotes", "detail", id] as const,
};

// Get all notes for a version
export function useSectionNotes(versionId: string) {
  return useQuery({
    queryKey: sectionNotesKeys.byVersion(versionId),
    queryFn: () => sectionNotesRepository.getByVersion(versionId),
    enabled: !!versionId,
  });
}

// Get notes for a specific section
export function useSectionNotesBySection(versionId: string, sectionId: string) {
  return useQuery({
    queryKey: sectionNotesKeys.bySection(versionId, sectionId),
    queryFn: () => sectionNotesRepository.getBySection(versionId, sectionId),
    enabled: !!versionId && !!sectionId,
  });
}

// Get a single note
export function useSectionNote(id: string) {
  return useQuery({
    queryKey: sectionNotesKeys.detail(id),
    queryFn: () => sectionNotesRepository.getById(id),
    enabled: !!id,
  });
}

// Create note mutation
export function useCreateSectionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      versionId: string;
      sectionId: string;
      occurrenceId?: string | null;
      anchor: SectionNoteAnchor;
      text: string;
    }) => sectionNotesRepository.create(input),
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: sectionNotesKeys.byVersion(note.versionId),
      });
    },
  });
}

// Update note mutation
export function useUpdateSectionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      anchor?: SectionNoteAnchor;
      text?: string;
      occurrenceId?: string | null;
    }) => sectionNotesRepository.update(id, input),
    onSuccess: (note) => {
      if (note) {
        queryClient.invalidateQueries({
          queryKey: sectionNotesKeys.byVersion(note.versionId),
        });
        queryClient.invalidateQueries({
          queryKey: sectionNotesKeys.detail(note.id),
        });
      }
    },
  });
}

// Delete note mutation
export function useDeleteSectionNote(versionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sectionNotesRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sectionNotesKeys.byVersion(versionId),
      });
    },
  });
}
