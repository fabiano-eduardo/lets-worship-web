// Section Notes repository

import { db } from "@/db";
import { outboxRepository } from "@/features/sync";
import type { SectionNoteEntity, SectionNoteAnchor } from "@/shared/types";

export interface CreateSectionNoteInput {
  versionId: string;
  sectionId: string;
  occurrenceId?: string | null;
  anchor: SectionNoteAnchor;
  text: string;
}

export interface UpdateSectionNoteInput {
  anchor?: SectionNoteAnchor;
  text?: string;
  occurrenceId?: string | null;
}

export const sectionNotesRepository = {
  // Get all notes for a version
  async getByVersion(versionId: string): Promise<SectionNoteEntity[]> {
    return db.sectionNotes
      .where("versionId")
      .equals(versionId)
      .filter((n) => !n.deleted)
      .toArray();
  },

  // Get all notes for a specific section
  async getBySection(
    versionId: string,
    sectionId: string,
  ): Promise<SectionNoteEntity[]> {
    return db.sectionNotes
      .where({ versionId, sectionId })
      .filter((n) => !n.deleted)
      .toArray();
  },

  // Get a single note by ID
  async getById(id: string): Promise<SectionNoteEntity | undefined> {
    return db.sectionNotes.get(id);
  },

  // Create a new note
  async create(input: CreateSectionNoteInput): Promise<SectionNoteEntity> {
    const now = new Date().toISOString();
    const note: SectionNoteEntity = {
      id: crypto.randomUUID(),
      versionId: input.versionId,
      sectionId: input.sectionId,
      occurrenceId: input.occurrenceId ?? null,
      anchor: input.anchor,
      text: input.text,
      createdAt: now,
      updatedAt: now,
      dirty: true,
    };

    await db.sectionNotes.add(note);

    // Add to outbox for sync
    await outboxRepository.add(
      "sectionNote",
      "UPSERT",
      note.id,
      undefined, // No baseRev for new notes
      {
        id: note.id,
        versionId: note.versionId,
        sectionId: note.sectionId,
        occurrenceId: note.occurrenceId ?? null,
        anchor: note.anchor,
        text: note.text,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    );

    return note;
  },

  // Update a note
  async update(
    id: string,
    input: UpdateSectionNoteInput,
  ): Promise<SectionNoteEntity | undefined> {
    const existing = await db.sectionNotes.get(id);
    if (!existing || existing.deleted) {
      return undefined;
    }

    const now = new Date().toISOString();
    const updates: Partial<SectionNoteEntity> = {
      ...input,
      updatedAt: now,
      dirty: true,
    };

    await db.sectionNotes.update(id, updates);

    const updated = await db.sectionNotes.get(id);
    if (!updated) return undefined;

    // Add to outbox for sync
    await outboxRepository.add(
      "sectionNote",
      "UPSERT",
      updated.id,
      updated.remoteRev,
      {
        id: updated.id,
        versionId: updated.versionId,
        sectionId: updated.sectionId,
        occurrenceId: updated.occurrenceId ?? null,
        anchor: updated.anchor,
        text: updated.text,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    );

    return updated;
  },

  // Delete a note (soft delete)
  async delete(id: string): Promise<boolean> {
    const existing = await db.sectionNotes.get(id);
    if (!existing) {
      return false;
    }

    const now = new Date().toISOString();
    await db.sectionNotes.update(id, {
      deleted: true,
      updatedAt: now,
      dirty: true,
    });

    // Add to outbox for sync
    await outboxRepository.add("sectionNote", "DELETE", id, existing.remoteRev);

    return true;
  },

  // Delete all notes for a version
  async deleteByVersion(versionId: string): Promise<number> {
    const notes = await db.sectionNotes
      .where("versionId")
      .equals(versionId)
      .toArray();

    const now = new Date().toISOString();

    for (const note of notes) {
      if (!note.deleted) {
        await db.sectionNotes.update(note.id, {
          deleted: true,
          updatedAt: now,
          dirty: true,
        });

        await outboxRepository.add(
          "sectionNote",
          "DELETE",
          note.id,
          note.remoteRev,
        );
      }
    }

    return notes.filter((n) => !n.deleted).length;
  },

  // Count notes for a version
  async countByVersion(versionId: string): Promise<number> {
    return db.sectionNotes
      .where("versionId")
      .equals(versionId)
      .filter((n) => !n.deleted)
      .count();
  },
};
