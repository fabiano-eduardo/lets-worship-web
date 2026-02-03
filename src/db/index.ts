// IndexedDB database setup using Dexie

import Dexie, { type Table } from "dexie";
import type {
  Song,
  SongVersion,
  SectionNoteEntity,
  SongMapItem,
  OutboxItem,
  SyncState,
  SyncConflict,
  UserSettings,
} from "@/shared/types";
import { buildMapItemsFromArrangement } from "@/shared/utils/mapItems";

export class LetsWorshipDB extends Dexie {
  songs!: Table<Song, string>;
  versions!: Table<SongVersion, string>;
  sectionNotes!: Table<SectionNoteEntity, string>;
  songMapItems!: Table<SongMapItem, string>;
  outbox!: Table<OutboxItem, string>;
  syncState!: Table<SyncState, string>;
  conflicts!: Table<SyncConflict, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super("LetsWorshipDB");

    // Version 1: Original schema
    this.version(1).stores({
      songs:
        "id, title, artist, defaultVersionId, createdAt, updatedAt, remoteId, dirty, deleted",
      versions:
        "id, songId, label, pinnedOffline, createdAt, updatedAt, remoteId, dirty, deleted",
    });

    // Version 2: Add sync-related stores
    this.version(2).stores({
      songs:
        "id, title, artist, defaultVersionId, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
      versions:
        "id, songId, label, pinnedOffline, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
      sectionNotes:
        "id, versionId, sectionId, occurrenceId, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
      outbox: "id, deviceId, entityType, entityId, status, createdAt",
      syncState: "id",
      conflicts: "id, entityType, entityId, resolved, createdAt",
      settings: "id",
    });

    // Version 3: Add song map items (explicit occurrences)
    this.version(3)
      .stores({
        songs:
          "id, title, artist, defaultVersionId, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
        versions:
          "id, songId, label, pinnedOffline, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
        sectionNotes:
          "id, versionId, sectionId, occurrenceId, createdAt, updatedAt, remoteId, remoteRev, dirty, deleted",
        songMapItems:
          "id, songVersionId, sectionId, order, createdAt, updatedAt",
        outbox: "id, deviceId, entityType, entityId, status, createdAt",
        syncState: "id",
        conflicts: "id, entityType, entityId, resolved, createdAt",
        settings: "id",
      })
      .upgrade(async (tx) => {
        const versions = await tx.table("versions").toArray();
        const mapItemsTable = tx.table("songMapItems");
        const notesTable = tx.table("sectionNotes");

        for (const version of versions) {
          const arrangement = version.arrangement;
          if (!arrangement) continue;

          const items = buildMapItemsFromArrangement({
            songVersionId: version.id,
            sections: arrangement.sections || [],
            sequence: arrangement.sequence || [],
          });

          if (items.length > 0) {
            await mapItemsTable.bulkAdd(items);
          }
        }

        // Ensure existing notes default to template scope
        await notesTable.toCollection().modify((note) => {
          if (note.occurrenceId === undefined) {
            note.occurrenceId = null;
          }
        });
      });
  }
}

export const db = new LetsWorshipDB();

// Helper to clear all data (for "Limpar dados locais")
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.songs,
      db.versions,
      db.sectionNotes,
      db.songMapItems,
      db.outbox,
      db.conflicts,
    ],
    async () => {
      await db.songs.clear();
      await db.versions.clear();
      await db.sectionNotes.clear();
      await db.songMapItems.clear();
      await db.outbox.clear();
      await db.conflicts.clear();
    },
  );
}

// Get storage stats
export async function getStorageStats(): Promise<{
  songsCount: number;
  versionsCount: number;
  pinnedCount: number;
  notesCount: number;
  mapItemsCount: number;
  pendingSync: number;
  conflicts: number;
}> {
  // Use filter for boolean fields since Dexie doesn't index booleans well
  const [
    allSongs,
    allVersions,
    allNotes,
    allMapItems,
    allConflicts,
    pendingSync,
  ] = await Promise.all([
    db.songs.toArray(),
    db.versions.toArray(),
    db.sectionNotes.toArray(),
    db.songMapItems.toArray(),
    db.conflicts.toArray(),
    db.outbox.where("status").equals("PENDING").count(),
  ]);

  return {
    songsCount: allSongs.filter((s) => !s.deleted).length,
    versionsCount: allVersions.filter((v) => !v.deleted).length,
    pinnedCount: allVersions.filter((v) => v.pinnedOffline && !v.deleted)
      .length,
    notesCount: allNotes.filter((n) => !n.deleted).length,
    mapItemsCount: allMapItems.length,
    pendingSync,
    conflicts: allConflicts.filter((c) => !c.resolved).length,
  };
}

export async function clearSyncData(options?: {
  preserveOutbox?: boolean;
}): Promise<{
  songsCount: number;
  versionsCount: number;
  notesCount: number;
  mapItemsCount: number;
  conflictsCount: number;
  outboxCount: number;
}> {
  const preserveOutbox = options?.preserveOutbox ?? true;

  const [
    songsCount,
    versionsCount,
    notesCount,
    mapItemsCount,
    conflictsCount,
    outboxCount,
  ] = await Promise.all([
    db.songs.count(),
    db.versions.count(),
    db.sectionNotes.count(),
    db.songMapItems.count(),
    db.conflicts.count(),
    db.outbox.count(),
  ]);

  const tables: Table<any, string>[] = [
    db.songs,
    db.versions,
    db.sectionNotes,
    db.songMapItems,
    db.conflicts,
  ];
  if (!preserveOutbox) {
    tables.push(db.outbox);
  }

  await db.transaction("rw", tables, async () => {
    await db.songs.clear();
    await db.versions.clear();
    await db.sectionNotes.clear();
    await db.songMapItems.clear();
    await db.conflicts.clear();
    if (!preserveOutbox) {
      await db.outbox.clear();
    }
  });

  return {
    songsCount,
    versionsCount,
    notesCount,
    mapItemsCount,
    conflictsCount,
    outboxCount,
  };
}

// Get or create device ID
export async function getDeviceId(): Promise<string> {
  let state = await db.syncState.get("main");
  if (!state) {
    const deviceId = crypto.randomUUID();
    state = {
      id: "main",
      deviceId,
    };
    await db.syncState.put(state);
  }
  return state.deviceId;
}

// Get sync state
export async function getSyncState(): Promise<SyncState | undefined> {
  return db.syncState.get("main");
}

// Update sync state
export async function updateSyncState(
  updates: Partial<Omit<SyncState, "id">>,
): Promise<void> {
  const existing = await db.syncState.get("main");
  if (existing) {
    await db.syncState.update("main", updates);
  } else {
    await db.syncState.put({
      id: "main",
      deviceId: crypto.randomUUID(),
      ...updates,
    });
  }
}

// Get user settings
export async function getUserSettings(): Promise<UserSettings> {
  let settings = await db.settings.get("main");
  if (!settings) {
    settings = {
      id: "main",
      globalViewPreferences: {
        showLyrics: true,
        showChords: true,
        showNotes: true,
      },
    };
    await db.settings.put(settings);
  }
  return settings;
}

// Update user settings
export async function updateUserSettings(
  updates: Partial<Omit<UserSettings, "id">>,
): Promise<void> {
  const existing = await db.settings.get("main");
  if (existing) {
    await db.settings.update("main", updates);
  } else {
    await db.settings.put({
      id: "main",
      globalViewPreferences: {
        showLyrics: true,
        showChords: true,
        showNotes: true,
      },
      ...updates,
    });
  }
}
