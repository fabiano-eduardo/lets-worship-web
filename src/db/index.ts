// IndexedDB database setup using Dexie — Stripped for online-first
// Only keeps settings table.

import Dexie, { type Table } from "dexie";
import type { UserSettings } from "@/shared/types";

export class LetsWorshipDB extends Dexie {
  settings!: Table<UserSettings, string>;

  constructor() {
    super("LetsWorshipDB");

    // Version 5: remove songMapItems (arrangementBlocks are source of truth)
    this.version(5).stores({
      // Drop legacy tables by setting them to null
      songs: null,
      versions: null,
      sectionNotes: null,
      outbox: null,
      syncState: null,
      conflicts: null,
      songMapItems: null,
      // Keep these
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
