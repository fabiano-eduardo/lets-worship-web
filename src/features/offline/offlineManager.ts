// Offline manager — download, update, remove version snapshots

import {
  offlineDb,
  type OfflineMetaEntry,
  type OfflineVersion,
} from "./offlineStore";
import { getSongVersion, getSong } from "@/graphql/api";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Download a version + its song for offline use.
 * All data is saved atomically in a single Dexie transaction.
 */
export async function downloadVersionOffline(versionId: string): Promise<void> {
  // 1. Fetch version
  const version = await getSongVersion(versionId);
  if (!version) throw new Error("Versão não encontrada no servidor");

  // 2. Fetch song
  const song = await getSong(version.songId);
  if (!song) throw new Error("Música não encontrada no servidor");

  // 3. Calculate size
  const sizeBytes = new Blob([JSON.stringify({ version, song })]).size;

  // 4. Build meta
  const meta: OfflineMetaEntry = {
    versionId: version.id,
    songId: version.songId,
    downloadedAt: new Date().toISOString(),
    lastServerUpdatedAt: version.updatedAt,
    sizeBytes,
    songTitle: song.title,
    versionLabel: version.label,
  };

  // 5. Atomic write
  await offlineDb.transaction(
    "rw",
    [offlineDb.offlineSongs, offlineDb.offlineVersions, offlineDb.offlineMeta],
    async () => {
      await offlineDb.offlineSongs.put(song);
      await offlineDb.offlineVersions.put(version as OfflineVersion);
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

  const version = await getSongVersion(versionId);
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
    [offlineDb.offlineSongs, offlineDb.offlineVersions, offlineDb.offlineMeta],
    async () => {
      await offlineDb.offlineVersions.delete(versionId);
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

  const [version, song] = await Promise.all([
    offlineDb.offlineVersions.get(versionId),
    offlineDb.offlineSongs.get(meta.songId),
  ]);

  if (!version || !song) return null;

  return { version, song, meta };
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
