// Offline store — Dexie database for selective offline cache

import Dexie, { type Table } from "dexie";
import type {
  SongVersionQuery,
  SongQuery,
  SectionNotesQuery,
} from "@/graphql/generated/graphql";
import type { SongMapItem } from "@/shared/types";

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

/** A section note from the server */
export type OfflineNote = SectionNotesQuery["sectionNotes"][number];

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

class LetsWorshipOfflineDB extends Dexie {
  offlineSongs!: Table<OfflineSong, string>;
  offlineVersions!: Table<OfflineVersion, string>;
  offlineMapItems!: Table<SongMapItem, string>;
  offlineNotes!: Table<OfflineNote, string>;
  offlineMeta!: Table<OfflineMetaEntry, string>;

  constructor() {
    super("LetsWorshipOffline");

    this.version(1).stores({
      offlineSongs: "id",
      offlineVersions: "id, songId",
      offlineMapItems: "id, songVersionId",
      offlineNotes: "id, versionId",
      offlineMeta: "versionId, songId",
    });
  }
}

export const offlineDb = new LetsWorshipOfflineDB();
