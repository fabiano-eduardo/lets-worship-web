// Version repository - data access layer for SongVersions

import { v4 as uuidv4 } from "uuid";
import { db } from "./index";
import { outboxRepository } from "@/features/sync";
import type {
  SongVersion,
  CreateVersionInput,
  UpdateVersionInput,
  VersionArrangement,
} from "@/shared/types";
import {
  validateVersion,
  validateVersionLabel,
} from "@/shared/types/validation";

const DEFAULT_ARRANGEMENT: VersionArrangement = {
  sections: [],
  sequence: [],
};

export const versionRepository = {
  /**
   * Get all versions for a song
   */
  async getBySongId(songId: string): Promise<SongVersion[]> {
    return db.versions
      .where("songId")
      .equals(songId)
      .filter((v) => !v.deleted)
      .toArray();
  },

  /**
   * Get a single version by ID
   */
  async getById(id: string): Promise<SongVersion | undefined> {
    console.log({ id });
    const version = await db.versions.get(id);
    if (version?.deleted) return undefined;
    return version;
  },

  /**
   * Get all pinned versions
   */
  async getPinned(): Promise<SongVersion[]> {
    return db.versions.filter((v) => v.pinnedOffline && !v.deleted).toArray();
  },

  /**
   * Get all versions (for export)
   */
  async getAll(): Promise<SongVersion[]> {
    return db.versions.filter((v) => !v.deleted).toArray();
  },

  /**
   * Create a new version
   */
  async create(input: CreateVersionInput): Promise<SongVersion> {
    validateVersionLabel(input.label);
    validateVersion(input as Partial<SongVersion>);

    const now = new Date().toISOString();
    const version: SongVersion = {
      id: uuidv4(),
      songId: input.songId,
      label: input.label.trim(),
      reference: {
        youtubeUrl: input.reference.youtubeUrl?.trim() || undefined,
        spotifyUrl: input.reference.spotifyUrl?.trim() || undefined,
        descriptionIfNoLink:
          input.reference.descriptionIfNoLink?.trim() || undefined,
      },
      musicalMeta: {
        bpm: input.musicalMeta.bpm,
        timeSignature: input.musicalMeta.timeSignature,
        originalKey: input.musicalMeta.originalKey,
      },
      arrangement: input.arrangement || DEFAULT_ARRANGEMENT,
      pinnedOffline: false,
      createdAt: now,
      updatedAt: now,
      dirty: true,
    };

    await db.versions.add(version);

    // Add to outbox for sync
    await outboxRepository.add("songVersion", "UPSERT", version.id, undefined, {
      id: version.id,
      songId: version.songId,
      label: version.label,
      reference: version.reference,
      musicalMeta: version.musicalMeta,
      arrangement: version.arrangement,
      pinnedOffline: version.pinnedOffline,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    });

    return version;
  },

  /**
   * Update an existing version
   */
  async update(id: string, input: UpdateVersionInput): Promise<SongVersion> {
    const existing = await db.versions.get(id);
    if (!existing || existing.deleted) {
      throw new Error("Versão não encontrada");
    }

    validateVersion(input as Partial<SongVersion>);

    const updates: Partial<SongVersion> = {
      updatedAt: new Date().toISOString(),
      dirty: true,
    };

    if (input.label !== undefined) {
      updates.label = input.label.trim();
    }
    if (input.reference !== undefined) {
      updates.reference = {
        youtubeUrl: input.reference.youtubeUrl?.trim() || undefined,
        spotifyUrl: input.reference.spotifyUrl?.trim() || undefined,
        descriptionIfNoLink:
          input.reference.descriptionIfNoLink?.trim() || undefined,
      };
    }
    if (input.musicalMeta !== undefined) {
      updates.musicalMeta = input.musicalMeta;
    }
    if (input.arrangement !== undefined) {
      updates.arrangement = input.arrangement;
    }
    if (input.pinnedOffline !== undefined) {
      updates.pinnedOffline = input.pinnedOffline;
    }

    await db.versions.update(id, updates);
    const updated = { ...existing, ...updates } as SongVersion;

    // Add to outbox for sync
    await outboxRepository.add(
      "songVersion",
      "UPSERT",
      id,
      existing.remoteRev,
      {
        id: updated.id,
        songId: updated.songId,
        label: updated.label,
        reference: updated.reference,
        musicalMeta: updated.musicalMeta,
        arrangement: updated.arrangement,
        pinnedOffline: updated.pinnedOffline,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    );

    return updated;
  },

  /**
   * Toggle pinned status
   */
  async togglePinned(id: string): Promise<boolean> {
    const version = await db.versions.get(id);
    if (!version || version.deleted) {
      throw new Error("Versão não encontrada");
    }

    const newPinned = !version.pinnedOffline;
    await db.versions.update(id, {
      pinnedOffline: newPinned,
      updatedAt: new Date().toISOString(),
    });

    return newPinned;
  },

  /**
   * Soft delete a version
   */
  async delete(id: string): Promise<void> {
    const version = await db.versions.get(id);
    if (!version) return;

    if (version.remoteId) {
      await db.versions.update(id, {
        deleted: true,
        dirty: true,
        updatedAt: new Date().toISOString(),
      });

      // Add DELETE to outbox for synced items
      await outboxRepository.add(
        "songVersion",
        "DELETE",
        id,
        version.remoteRev,
        {
          id: version.id,
        },
      );
    } else {
      await db.versions.delete(id);
    }

    // Update song's defaultVersionId if needed
    const song = await db.songs.get(version.songId);
    if (song && song.defaultVersionId === id) {
      const remainingVersions = await this.getBySongId(version.songId);
      await db.songs.update(version.songId, {
        defaultVersionId: remainingVersions[0]?.id || null,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Import a version (used for backup restore)
   */
  async import(version: SongVersion): Promise<void> {
    const existing = await db.versions.get(version.id);
    if (existing) {
      if (new Date(version.updatedAt) > new Date(existing.updatedAt)) {
        await db.versions.put(version);
      }
    } else {
      await db.versions.add(version);
    }
  },
};
