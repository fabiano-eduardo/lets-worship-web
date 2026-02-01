// Song repository - data access layer for Songs

import { v4 as uuidv4 } from "uuid";
import { db } from "./index";
import { outboxRepository } from "@/features/sync";
import type { Song, CreateSongInput, UpdateSongInput } from "@/shared/types";
import { validateSong, validateSongTitle } from "@/shared/types/validation";

export const songRepository = {
  /**
   * Get all songs (excluding soft-deleted)
   */
  async getAll(): Promise<Song[]> {
    return db.songs.filter((song) => !song.deleted).toArray();
  },

  /**
   * Get a single song by ID
   */
  async getById(id: string): Promise<Song | undefined> {
    const song = await db.songs.get(id);
    if (song?.deleted) return undefined;
    return song;
  },

  /**
   * Search songs by title or artist
   */
  async search(query: string): Promise<Song[]> {
    const lowerQuery = query.toLowerCase();
    return db.songs
      .filter((song) => {
        if (song.deleted) return false;
        const matchesTitle = song.title.toLowerCase().includes(lowerQuery);
        const matchesArtist =
          song.artist?.toLowerCase().includes(lowerQuery) ?? false;
        return matchesTitle || matchesArtist;
      })
      .toArray();
  },

  /**
   * Create a new song
   */
  async create(input: CreateSongInput): Promise<Song> {
    validateSongTitle(input.title);

    const now = new Date().toISOString();
    const song: Song = {
      id: uuidv4(),
      title: input.title.trim(),
      artist: input.artist?.trim() || null,
      defaultVersionId: null,
      createdAt: now,
      updatedAt: now,
      dirty: true, // Mark as dirty for future sync
    };

    await db.songs.add(song);

    // Add to outbox for sync
    await outboxRepository.add("song", "UPSERT", song.id, undefined, {
      id: song.id,
      title: song.title,
      artist: song.artist,
      defaultVersionId: song.defaultVersionId,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    });

    return song;
  },

  /**
   * Update an existing song
   */
  async update(id: string, input: UpdateSongInput): Promise<Song> {
    const existing = await db.songs.get(id);
    if (!existing || existing.deleted) {
      throw new Error("Música não encontrada");
    }

    validateSong(input);

    const updates: Partial<Song> = {
      updatedAt: new Date().toISOString(),
      dirty: true,
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.artist !== undefined) {
      updates.artist = input.artist?.trim() || null;
    }
    if (input.defaultVersionId !== undefined) {
      updates.defaultVersionId = input.defaultVersionId;
    }

    await db.songs.update(id, updates);
    const updated = { ...existing, ...updates };

    // Add to outbox for sync
    await outboxRepository.add("song", "UPSERT", id, existing.remoteRev, {
      id: updated.id,
      title: updated.title,
      artist: updated.artist,
      defaultVersionId: updated.defaultVersionId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });

    return updated;
  },

  /**
   * Soft delete a song (marks as deleted for future sync)
   */
  async delete(id: string): Promise<void> {
    const song = await db.songs.get(id);
    if (!song) return;

    // For local-only (no remoteId), hard delete
    // For synced items, soft delete
    if (song.remoteId) {
      await db.songs.update(id, {
        deleted: true,
        dirty: true,
        updatedAt: new Date().toISOString(),
      });

      // Add DELETE to outbox
      await outboxRepository.add("song", "DELETE", id, song.remoteRev);
    } else {
      // Also delete all versions
      const versions = await db.versions.where("songId").equals(id).toArray();
      await db.transaction("rw", [db.songs, db.versions], async () => {
        for (const version of versions) {
          await db.versions.delete(version.id);
        }
        await db.songs.delete(id);
      });
    }
  },

  /**
   * Hard delete a song (for import merge conflicts or local cleanup)
   */
  async hardDelete(id: string): Promise<void> {
    await db.transaction("rw", [db.songs, db.versions], async () => {
      await db.versions.where("songId").equals(id).delete();
      await db.songs.delete(id);
    });
  },

  /**
   * Import a song (used for backup restore)
   */
  async import(song: Song): Promise<void> {
    const existing = await db.songs.get(song.id);
    if (existing) {
      // Merge: update if imported is newer
      if (new Date(song.updatedAt) > new Date(existing.updatedAt)) {
        await db.songs.put(song);
      }
    } else {
      await db.songs.add(song);
    }
  },
};
