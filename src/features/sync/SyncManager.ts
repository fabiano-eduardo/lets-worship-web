// SyncManager - Core sync engine

import { db, getDeviceId, getSyncState, updateSyncState } from "@/db";
import { graphqlFetch, isOnline, AuthenticationError } from "@/shared/api";
import { outboxRepository } from "./outboxRepository";
import { conflictRepository } from "./conflictRepository";
import {
  SYNC_PUSH_MUTATION,
  SYNC_PULL_QUERY,
  toGraphQLEntityType,
  fromGraphQLEntityType,
  type SyncPushMutation,
  type SyncPushResponse,
  type SyncPullResponse,
  type SyncPullChange,
  type SyncEntitiesSnapshot,
} from "./graphql";
import type { Song, SongVersion, SectionNoteEntity } from "@/shared/types";

// Sync status
export type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

// Sync event types
export interface SyncEvent {
  type: "status" | "progress" | "error" | "conflict";
  status?: SyncStatus;
  message?: string;
  progress?: { pushed: number; pulled: number };
  error?: Error;
}

type SyncListener = (event: SyncEvent) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private status: SyncStatus = "idle";
  private isSyncing = false;
  private backoffMs = 0;
  private readonly maxBackoffMs = 120000; // 2 minutes
  private readonly backoffSteps = [5000, 15000, 30000, 60000, 120000];
  private backoffIndex = 0;

  // Subscribe to sync events
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Immediately notify of current status
    listener({ type: "status", status: this.status });
    return () => this.listeners.delete(listener);
  }

  // Emit event to all listeners
  private emit(event: SyncEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  // Update and emit status
  private setStatus(status: SyncStatus, message?: string): void {
    this.status = status;
    this.emit({ type: "status", status, message });
  }

  // Get current status
  getStatus(): SyncStatus {
    return this.status;
  }

  // Check if can sync
  canSync(): boolean {
    return isOnline() && !this.isSyncing;
  }

  // Main sync function
  async sync(): Promise<void> {
    // Check preconditions
    if (!isOnline()) {
      this.setStatus("offline", "Sem conexão com a internet");
      return;
    }

    if (this.isSyncing) {
      console.log("[SyncManager] Sync already in progress");
      return;
    }

    this.isSyncing = true;
    this.setStatus("syncing", "Sincronizando...");

    try {
      // 1. Push local changes
      const pushResult = await this.pushOutbox();

      // 2. Pull remote changes
      const pullResult = await this.pullChanges();

      // Success - reset backoff
      this.backoffIndex = 0;
      this.backoffMs = 0;

      // Update sync state
      await updateSyncState({
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      });

      this.setStatus("success", "Sincronização completa");
      this.emit({
        type: "progress",
        progress: { pushed: pushResult, pulled: pullResult },
      });
    } catch (error) {
      console.error("[SyncManager] Sync failed:", error);

      // Handle auth errors specially
      if (error instanceof AuthenticationError) {
        this.setStatus("error", "Sessão expirada");
        // Don't backoff for auth errors
        await updateSyncState({
          lastError: "Sessão expirada - faça login novamente",
        });
        this.emit({ type: "error", error: error as Error });
        return;
      }

      // Apply backoff for other errors
      this.backoffMs =
        this.backoffSteps[this.backoffIndex] || this.maxBackoffMs;
      this.backoffIndex = Math.min(
        this.backoffIndex + 1,
        this.backoffSteps.length - 1,
      );

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      await updateSyncState({ lastError: errorMessage });
      this.setStatus("error", errorMessage);
      this.emit({ type: "error", error: error as Error });
    } finally {
      this.isSyncing = false;
    }
  }

  // Push outbox items to server
  private async pushOutbox(): Promise<number> {
    const deviceId = await getDeviceId();
    let totalPushed = 0;

    while (true) {
      const pending = await outboxRepository.getPending(50);
      if (pending.length === 0) break;

      // Build mutations
      const mutations: SyncPushMutation[] = pending.map((item) => ({
        mutationId: item.id,
        deviceId,
        entityType: toGraphQLEntityType(item.entityType),
        op: item.op,
        entityId: item.entityId,
        baseRev: item.baseRev,
        payload: item.payload,
      }));

      // Mark as SENT
      await Promise.all(
        pending.map((item) => outboxRepository.updateStatus(item.id, "SENT")),
      );

      // Push to server
      const response = await graphqlFetch<SyncPushResponse>(
        SYNC_PUSH_MUTATION,
        {
          input: { mutations },
        },
      );

      // Process results
      for (const result of response.syncPush.results) {
        const item = pending.find((p) => p.id === result.mutationId);
        if (!item) continue;

        switch (result.status) {
          case "APPLIED":
            // Update local entity with new rev
            await this.updateEntityRev(
              item.entityType,
              item.entityId,
              result.newRev!,
            );
            await outboxRepository.acknowledge(item.id);
            totalPushed++;
            break;

          case "CONFLICT":
            await outboxRepository.markConflict(item.id);
            // Create conflict record if we have local data
            await this.createConflictRecord(item.entityType, item.entityId);
            this.emit({
              type: "conflict",
              message: `Conflito em ${item.entityType}`,
            });
            break;

          case "REJECTED":
            await outboxRepository.updateStatus(
              item.id,
              "REJECTED",
              result.error,
            );
            console.error(`[SyncManager] Mutation rejected: ${result.error}`);
            break;
        }
      }
    }

    return totalPushed;
  }

  // Pull changes from server
  private async pullChanges(): Promise<number> {
    let totalPulled = 0;
    const state = await getSyncState();
    let cursor = state?.lastCursor;

    while (true) {
      const response = await graphqlFetch<SyncPullResponse>(SYNC_PULL_QUERY, {
        input: {
          sinceCursor: cursor,
          limit: 200,
          includeEntities: true,
        },
      });

      const { changes, entities, nextCursor, hasMore } = response.syncPull;

      // Build entity lookup maps from snapshot
      const entityMaps = this.buildEntityMaps(entities);

      // Apply changes
      for (const change of changes) {
        await this.applyRemoteChange(change, entityMaps);
        totalPulled++;
      }

      // Update cursor
      if (nextCursor) {
        cursor = nextCursor;
        await updateSyncState({ lastCursor: nextCursor });
      }

      if (!hasMore) break;
    }

    return totalPulled;
  }

  // Build lookup maps from entities snapshot
  private buildEntityMaps(entities?: SyncEntitiesSnapshot): {
    songs: Map<string, Record<string, unknown>>;
    versions: Map<string, Record<string, unknown>>;
    notes: Map<string, Record<string, unknown>>;
  } {
    const songs = new Map<string, Record<string, unknown>>();
    const versions = new Map<string, Record<string, unknown>>();
    const notes = new Map<string, Record<string, unknown>>();

    if (entities?.songs) {
      for (const song of entities.songs) {
        songs.set(song.id, song as unknown as Record<string, unknown>);
      }
    }
    if (entities?.versions) {
      for (const version of entities.versions) {
        versions.set(version.id, version as unknown as Record<string, unknown>);
      }
    }
    if (entities?.notes) {
      for (const note of entities.notes) {
        notes.set(note.id, note as unknown as Record<string, unknown>);
      }
    }

    return { songs, versions, notes };
  }

  // Apply a remote change to local DB
  private async applyRemoteChange(
    change: SyncPullChange,
    entityMaps: {
      songs: Map<string, Record<string, unknown>>;
      versions: Map<string, Record<string, unknown>>;
      notes: Map<string, Record<string, unknown>>;
    },
  ): Promise<void> {
    const entityType = fromGraphQLEntityType(change.entityType);

    // Get entity data from the appropriate map
    let entityData: Record<string, unknown> | undefined;
    switch (change.entityType) {
      case "SONG":
        entityData = entityMaps.songs.get(change.entityId);
        break;
      case "SONG_VERSION":
        entityData = entityMaps.versions.get(change.entityId);
        break;
      case "SECTION_NOTE":
        entityData = entityMaps.notes.get(change.entityId);
        break;
    }

    // Check if local entity is dirty (conflict detection)
    const localEntity = await this.getLocalEntity(entityType, change.entityId);
    if (localEntity?.dirty) {
      // Conflict: local has uncommitted changes
      await conflictRepository.create(
        entityType,
        change.entityId,
        JSON.parse(JSON.stringify(localEntity)) as Record<string, unknown>,
        entityData || { deleted: true },
      );
      this.emit({
        type: "conflict",
        message: `Conflito detectado em ${entityType}`,
      });
      return;
    }

    if (change.op === "DELETE") {
      await this.deleteLocalEntity(entityType, change.entityId);
    } else if (change.op === "UPSERT" && entityData) {
      await this.upsertLocalEntity(
        entityType,
        change.entityId,
        entityData,
        change.rev,
      );
    }
  }

  // Get local entity by type
  private async getLocalEntity(
    entityType: "song" | "songVersion" | "sectionNote",
    entityId: string,
  ): Promise<(Song | SongVersion | SectionNoteEntity) | undefined> {
    switch (entityType) {
      case "song":
        return db.songs.get(entityId);
      case "songVersion":
        return db.versions.get(entityId);
      case "sectionNote":
        return db.sectionNotes.get(entityId);
    }
  }

  // Update entity rev after push
  private async updateEntityRev(
    entityType: "song" | "songVersion" | "sectionNote",
    entityId: string,
    newRev: number,
  ): Promise<void> {
    const updates = { remoteRev: newRev, dirty: false };

    switch (entityType) {
      case "song":
        await db.songs.update(entityId, updates);
        break;
      case "songVersion":
        await db.versions.update(entityId, updates);
        break;
      case "sectionNote":
        await db.sectionNotes.update(entityId, updates);
        break;
    }
  }

  // Upsert local entity from remote
  private async upsertLocalEntity(
    entityType: "song" | "songVersion" | "sectionNote",
    entityId: string,
    data: Record<string, unknown>,
    rev: number,
  ): Promise<void> {
    const entity = {
      ...data,
      id: entityId,
      remoteRev: rev,
      dirty: false,
      deleted: false,
    };

    switch (entityType) {
      case "song":
        await db.songs.put(entity as Song);
        break;
      case "songVersion":
        await db.versions.put(entity as SongVersion);
        break;
      case "sectionNote":
        await db.sectionNotes.put(entity as SectionNoteEntity);
        break;
    }
  }

  // Delete local entity
  private async deleteLocalEntity(
    entityType: "song" | "songVersion" | "sectionNote",
    entityId: string,
  ): Promise<void> {
    switch (entityType) {
      case "song":
        await db.songs.delete(entityId);
        break;
      case "songVersion":
        await db.versions.delete(entityId);
        break;
      case "sectionNote":
        await db.sectionNotes.delete(entityId);
        break;
    }
  }

  // Create conflict record for entity
  private async createConflictRecord(
    entityType: "song" | "songVersion" | "sectionNote",
    entityId: string,
  ): Promise<void> {
    const local = await this.getLocalEntity(entityType, entityId);
    if (local) {
      await conflictRepository.create(
        entityType,
        entityId,
        JSON.parse(JSON.stringify(local)) as Record<string, unknown>,
        {}, // Remote version will be fetched on conflict resolution
      );
    }
  }

  // Schedule sync with backoff
  scheduleSync(delayMs?: number): void {
    const delay = delayMs ?? this.backoffMs;
    if (delay > 0) {
      console.log(`[SyncManager] Scheduling sync in ${delay}ms`);
      setTimeout(() => this.sync(), delay);
    } else {
      this.sync();
    }
  }

  // Force sync now (resets backoff)
  async forcSync(): Promise<void> {
    this.backoffIndex = 0;
    this.backoffMs = 0;
    await this.sync();
  }
}

// Singleton instance
export const syncManager = new SyncManager();
