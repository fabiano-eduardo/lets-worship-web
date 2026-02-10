// Offline manager — download, update, remove version snapshots

import {
  offlineDb,
  type OfflineMetaEntry,
  type OfflineVersion,
  type OfflineNote,
} from "./offlineStore";
import { executeGraphQL } from "@/graphql/fetcher";
import {
  SongVersionDocument,
  SongDocument,
  SectionNotesDocument,
} from "@/graphql/generated/graphql";
import { buildMapItemsFromArrangement } from "@/shared/utils/mapItems";
import type { SongMapItem } from "@/shared/types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Download a version + its song, notes, and map items for offline use.
 * All data is saved atomically in a single Dexie transaction.
 */
export async function downloadVersionOffline(versionId: string): Promise<void> {
  // 1. Fetch version
  const versionData = await executeGraphQL(SongVersionDocument, {
    id: versionId,
  });
  const version = versionData.songVersion;
  if (!version) throw new Error("Versão não encontrada no servidor");

  // 2. Fetch song
  const songData = await executeGraphQL(SongDocument, { id: version.songId });
  const song = songData.song;
  if (!song) throw new Error("Música não encontrada no servidor");

  // 3. Fetch section notes
  const notesData = await executeGraphQL(SectionNotesDocument, { versionId });
  const notes: OfflineNote[] = notesData.sectionNotes ?? [];

  // 4. Generate map items
  const mapItems: SongMapItem[] = version.arrangement
    ? buildMapItemsFromArrangement({
        songVersionId: version.id,
        sections: version.arrangement.sections.map((s) => ({
          id: s.id,
          name: s.name,
          chordProText: s.chordProText,
          notes: (s.notes ?? []).map((n) => ({
            id: n.id,
            sectionId: n.sectionId,
            text: n.text,
            anchor: {
              type: n.anchor.type as "line" | "range" | "word",
              lineIndex: n.anchor.lineIndex ?? undefined,
              wordOffset: n.anchor.wordOffset ?? undefined,
              fromLineIndex: n.anchor.fromLineIndex ?? undefined,
              toLineIndex: n.anchor.toLineIndex ?? undefined,
            },
          })),
        })),
        sequence: version.arrangement.sequence.map((s) => ({
          sectionId: s.sectionId,
          repeat: s.repeat ?? undefined,
          sequenceNotes: s.sequenceNotes ?? undefined,
        })),
      })
    : [];

  // 5. Calculate size
  const sizeBytes = new Blob([
    JSON.stringify({ version, song, notes, mapItems }),
  ]).size;

  // 6. Build meta
  const meta: OfflineMetaEntry = {
    versionId: version.id,
    songId: version.songId,
    downloadedAt: new Date().toISOString(),
    lastServerUpdatedAt: version.updatedAt,
    sizeBytes,
    songTitle: song.title,
    versionLabel: version.label,
  };

  // 7. Atomic write
  await offlineDb.transaction(
    "rw",
    [
      offlineDb.offlineSongs,
      offlineDb.offlineVersions,
      offlineDb.offlineNotes,
      offlineDb.offlineMapItems,
      offlineDb.offlineMeta,
    ],
    async () => {
      await offlineDb.offlineSongs.put(song);
      await offlineDb.offlineVersions.put(version as OfflineVersion);

      // Replace notes for this version
      await offlineDb.offlineNotes
        .where("versionId")
        .equals(versionId)
        .delete();
      if (notes.length > 0) {
        await offlineDb.offlineNotes.bulkPut(notes);
      }

      // Replace map items for this version
      await offlineDb.offlineMapItems
        .where("songVersionId")
        .equals(versionId)
        .delete();
      if (mapItems.length > 0) {
        await offlineDb.offlineMapItems.bulkPut(mapItems);
      }

      await offlineDb.offlineMeta.put(meta);
    },
  );
}

/**
 * Check if a new server version exists and re-download if so.
 */
export async function updateVersionOffline(
  versionId: string,
): Promise<{ updated: boolean }> {
  const meta = await offlineDb.offlineMeta.get(versionId);
  if (!meta) {
    // Not downloaded yet — do a full download
    await downloadVersionOffline(versionId);
    return { updated: true };
  }

  const versionData = await executeGraphQL(SongVersionDocument, {
    id: versionId,
  });
  const version = versionData.songVersion;
  if (!version) throw new Error("Versão não encontrada no servidor");

  if (version.updatedAt > meta.lastServerUpdatedAt) {
    await downloadVersionOffline(versionId);
    return { updated: true };
  }

  return { updated: false };
}

/**
 * Remove a version from the offline store.
 * Song is kept if other versions of the same song are still offline.
 */
export async function removeVersionOffline(versionId: string): Promise<void> {
  const meta = await offlineDb.offlineMeta.get(versionId);
  if (!meta) return;

  await offlineDb.transaction(
    "rw",
    [
      offlineDb.offlineSongs,
      offlineDb.offlineVersions,
      offlineDb.offlineNotes,
      offlineDb.offlineMapItems,
      offlineDb.offlineMeta,
    ],
    async () => {
      await offlineDb.offlineVersions.delete(versionId);
      await offlineDb.offlineNotes
        .where("versionId")
        .equals(versionId)
        .delete();
      await offlineDb.offlineMapItems
        .where("songVersionId")
        .equals(versionId)
        .delete();
      await offlineDb.offlineMeta.delete(versionId);

      // Check if other versions of same song exist offline
      const otherVersions = await offlineDb.offlineMeta
        .where("songId")
        .equals(meta.songId)
        .count();
      if (otherVersions === 0) {
        await offlineDb.offlineSongs.delete(meta.songId);
      }
    },
  );
}

/**
 * Get the full offline snapshot for a version (or null if not available).
 */
export async function getOfflineVersion(versionId: string) {
  const meta = await offlineDb.offlineMeta.get(versionId);
  if (!meta) return null;

  const [version, song, notes, mapItems] = await Promise.all([
    offlineDb.offlineVersions.get(versionId),
    offlineDb.offlineSongs.get(meta.songId),
    offlineDb.offlineNotes.where("versionId").equals(versionId).toArray(),
    offlineDb.offlineMapItems
      .where("songVersionId")
      .equals(versionId)
      .toArray(),
  ]);

  if (!version || !song) return null;

  return { version, song, notes, mapItems, meta };
}

/**
 * Get all offline meta entries (the "Offline Library").
 */
export async function getOfflineLibrary(): Promise<OfflineMetaEntry[]> {
  return offlineDb.offlineMeta.toArray();
}

/**
 * Check if a version is available offline.
 */
export async function isVersionAvailableOffline(
  versionId: string,
): Promise<boolean> {
  const meta = await offlineDb.offlineMeta.get(versionId);
  return !!meta;
}
