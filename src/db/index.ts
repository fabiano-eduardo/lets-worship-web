// IndexedDB database setup using Dexie — Stripped for online-first
// Only keeps settings and songMapItems tables.

import Dexie, { type Table } from "dexie";
import type { SongMapItem, UserSettings } from "@/shared/types";

export class LetsWorshipDB extends Dexie {
  songMapItems!: Table<SongMapItem, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super("LetsWorshipDB");

    // Version 4: online-first schema (only local tables)
    this.version(4).stores({
      // Drop legacy tables by setting them to null
      songs: null,
      versions: null,
      sectionNotes: null,
      outbox: null,
      syncState: null,
      conflicts: null,
      // Keep these
      songMapItems: "id, songVersionId, sectionId, order, createdAt, updatedAt",
      settings: "id",
    });
  }
}

export const db = new LetsWorshipDB();

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
