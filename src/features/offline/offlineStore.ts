// Offline store — Dexie database for selective offline cache

import Dexie, { type Table } from "dexie";
import type { SongVersionQuery, SongQuery } from "@/graphql/generated/sdk";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Metadata for each downloaded version */
export interface OfflineMetaEntry {
  versionId: string; // PK
  songId: string;
  downloadedAt: string; // ISO
  lastServerUpdatedAt: string; // ISO — version.updatedAt from server
  sizeBytes: number;
  songTitle: string;
  versionLabel: string;
}

/** Full snapshot of a Song from the server */
export type OfflineSong = NonNullable<SongQuery["song"]>;

/** Full snapshot of a SongVersion from the server */
export type OfflineVersion = NonNullable<SongVersionQuery["songVersion"]>;

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

class LetsWorshipOfflineDB extends Dexie {
  offlineSongs!: Table<OfflineSong, string>;
  offlineVersions!: Table<OfflineVersion, string>;
  offlineMeta!: Table<OfflineMetaEntry, string>;

  constructor() {
    super("LetsWorshipOffline");

    // Version 2: remove offlineMapItems and offlineNotes (legacy)
    this.version(2).stores({
      offlineSongs: "id",
      offlineVersions: "id, songId",
      offlineMapItems: null,
      offlineNotes: null,
      offlineMeta: "versionId, songId",
    });
  }
}

export const offlineDb = new LetsWorshipOfflineDB();
