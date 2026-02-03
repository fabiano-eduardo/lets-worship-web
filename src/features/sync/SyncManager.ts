// SyncManager - Core sync engine

import { db, getDeviceId, getSyncState, updateSyncState } from "@/db";
import { graphqlFetch, isOnline, AuthenticationError } from "@/shared/api";
import { auth } from "@/shared/firebase";
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

type SyncSource = "manual" | "auto";

export interface SyncContext {
  source: SyncSource;
  correlationId?: string;
}

interface SyncRunContext {
  syncId: string;
  source: SyncSource;
  deviceId: string;
  ownerUid: string | null;
  log: (event: string, payload?: Record<string, unknown>) => void;
}

interface PullApplySummary {
  upserts: number;
  deletes: number;
  conflicts: number;
}

function isSyncDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem("layout-debug") === "1";
}

function buildLog(
  syncId: string,
  source: SyncSource,
  enabled: boolean,
): (event: string, payload?: Record<string, unknown>) => void {
  if (!enabled) {
    return () => undefined;
  }
  return (event, payload = {}) => {
    console.log("[SYNC]", event, { syncId, source, ...payload });
  };
}

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
  async sync(context?: SyncContext): Promise<void> {
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

    const syncStart = Date.now();
    const syncId = context?.correlationId ?? crypto.randomUUID();
    const source: SyncSource = context?.source ?? "manual";
    const debugEnabled = isSyncDebugEnabled();
    const log = buildLog(syncId, source, debugEnabled);

    const deviceId = await getDeviceId();
    const ownerUid = auth?.currentUser?.uid ?? null;
    const syncState = await getSyncState();
    const cursor = syncState?.lastCursor ?? null;
    const pendingByStatus = await outboxRepository.countByStatus();

    log("SYNC_START", {
      ownerUid,
      deviceId,
      cursor,
      pendingByStatus,
    });

    await updateSyncState({
      lastSyncId: syncId,
      lastSyncSource: source,
    });

    try {
      // 1. Push local changes
      const pushResult = await this.pushOutbox({
        syncId,
        source,
        deviceId,
        ownerUid,
        log,
      });

      // 2. Pull remote changes
      const pullResult = await this.pullChanges({
        syncId,
        source,
        deviceId,
        ownerUid,
        log,
      });

      // Success - reset backoff
      this.backoffIndex = 0;
      this.backoffMs = 0;

      // Update sync state
      await updateSyncState({
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      });

      log("APPLY_OK", pullResult?.applySummary as any);
      log("SYNC_END", {
        durationMs: Date.now() - syncStart,
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
      });

      this.setStatus("success", "Sincronização completa");
      this.emit({
        type: "progress",
        progress: { pushed: pushResult.pushed, pulled: pullResult.pulled },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      log("SYNC_FAIL", { error: errorMessage });
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

      await updateSyncState({ lastError: errorMessage });
      this.setStatus("error", errorMessage);
      this.emit({ type: "error", error: error as Error });
    } finally {
      this.isSyncing = false;
    }
  }

  // Push outbox items to server
  private async pushOutbox(context: SyncRunContext): Promise<{
    pushed: number;
    serverTime?: string;
  }> {
    const { deviceId, log } = context;
    let totalPushed = 0;
    let hadPushAttempt = false;
    let lastServerTime: string | undefined;

    while (true) {
      const pending = await outboxRepository.getPending(50);
      if (pending.length === 0) break;
      hadPushAttempt = true;

      // Build mutations
      const mutations: SyncPushMutation[] = pending.map((item) => ({
        mutationId: item.id,
        entityType: toGraphQLEntityType(item.entityType),
        op: item.op,
        entityId: item.entityId,
        baseRev: item.baseRev,
        entity: item.payload,
      }));

      log("PUSH_START", { batchSize: pending.length });

      // Mark as SENT
      await Promise.all(
        pending.map((item) => outboxRepository.updateStatus(item.id, "SENT")),
      );

      let response: SyncPushResponse;
      try {
        // Push to server
        response = await graphqlFetch<SyncPushResponse>(SYNC_PUSH_MUTATION, {
          input: {
            deviceId,
            mutations,
          },
        });

        console.log({ response });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao enviar mudanças";

        // Revert to PENDING on failure
        await Promise.all(
          pending.map((item) =>
            outboxRepository.updateStatus(item.id, "PENDING", errorMessage),
          ),
        );

        log("PUSH_FAIL", { error: errorMessage });
        throw error;
      }

      // Process results
      const appliedIds = new Set<string>();
      for (const result of response.syncPush.applied) {
        const item = pending.find((p) => p.id === result.mutationId);
        if (!item) continue;

        appliedIds.add(result.mutationId);

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
              result.reason ?? undefined,
            );
            console.error(`[SyncManager] Mutation rejected: ${result.reason}`);
            break;
        }
      }

      // Revert missing results to PENDING to avoid stuck SENT
      const missing = pending.filter((item) => !appliedIds.has(item.id));
      if (missing.length > 0) {
        await Promise.all(
          missing.map((item) =>
            outboxRepository.updateStatus(
              item.id,
              "PENDING",
              "Sem resposta do servidor para a mutação",
            ),
          ),
        );
        log("PUSH_WARN", { missingCount: missing.length });
      }

      lastServerTime = response.syncPush.serverTime ?? lastServerTime;
      log("PUSH_OK", {
        batchPushed: response.syncPush.applied.filter(
          (result) => result.status === "APPLIED",
        ).length,
        totalPushed,
        serverTime: lastServerTime,
      });
    }

    if (hadPushAttempt) {
      const updates: { lastPushAt: string; lastServerTime?: string } = {
        lastPushAt: new Date().toISOString(),
      };
      if (lastServerTime) {
        updates.lastServerTime = lastServerTime;
      }
      await updateSyncState(updates);
    }

    return { pushed: totalPushed, serverTime: lastServerTime };
  }

  // Pull changes from server
  private async pullChanges(context: SyncRunContext): Promise<{
    pulled: number;
    serverTime?: string;
    lastCursor?: string | null;
    applySummary: PullApplySummary;
  }> {
    const { log } = context;
    let totalPulled = 0;
    const state = await getSyncState();
    let cursor: string | undefined | null = state?.lastCursor;
    let lastServerTime: string | undefined;
    const applySummary: PullApplySummary = {
      upserts: 0,
      deletes: 0,
      conflicts: 0,
    };

    if (cursor === undefined) {
      cursor = null;
      log("PULL_BOOTSTRAP", { cursor });
    }

    log("PULL_START", { cursor });

    while (true) {
      let response: SyncPullResponse;
      try {
        response = await graphqlFetch<SyncPullResponse>(SYNC_PULL_QUERY, {
          input: {
            sinceCursor: cursor,
            limit: 200,
            includeEntities: true,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao buscar mudanças";
        log("PULL_FAIL", { error: errorMessage });
        throw error;
      }

      const { changes, entities, nextCursor, hasMore, serverTime } =
        response.syncPull;
      lastServerTime = serverTime ?? lastServerTime;

      // Build entity lookup maps from snapshot
      const entityMaps = this.buildEntityMaps(entities);

      // Apply changes
      for (const change of changes) {
        const result = await this.applyRemoteChange(change, entityMaps);
        switch (result) {
          case "upsert":
            applySummary.upserts += 1;
            break;
          case "delete":
            applySummary.deletes += 1;
            break;
          case "conflict":
            applySummary.conflicts += 1;
            break;
          default:
            break;
        }
        totalPulled += 1;
      }

      // Update cursor
      let resolvedCursor = nextCursor ?? null;
      if (!resolvedCursor && changes.length > 0) {
        resolvedCursor = changes[changes.length - 1]?.cursorId ?? null;
      }
      if (resolvedCursor) {
        cursor = resolvedCursor;
        await updateSyncState({ lastCursor: resolvedCursor });
      }

      if (!hasMore) break;
    }

    const pullUpdates: { lastPullAt: string; lastServerTime?: string } = {
      lastPullAt: new Date().toISOString(),
    };
    if (lastServerTime) {
      pullUpdates.lastServerTime = lastServerTime;
    }
    await updateSyncState(pullUpdates);

    log("PULL_OK", {
      pulled: totalPulled,
      nextCursor: cursor ?? null,
      serverTime: lastServerTime,
    });

    return {
      pulled: totalPulled,
      serverTime: lastServerTime,
      lastCursor: cursor ?? null,
      applySummary,
    };
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
  ): Promise<"upsert" | "delete" | "conflict" | "noop"> {
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
      return "conflict";
    }

    if (change.op === "DELETE") {
      await this.deleteLocalEntity(entityType, change.entityId);
      return "delete";
    } else if (change.op === "UPSERT" && entityData) {
      await this.upsertLocalEntity(
        entityType,
        change.entityId,
        entityData,
        change.rev,
      );
      return "upsert";
    }

    return "noop";
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
      setTimeout(() => this.sync({ source: "auto" }), delay);
    } else {
      this.sync({ source: "auto" });
    }
  }

  // Force sync now (resets backoff)
  async forcSync(): Promise<void> {
    this.backoffIndex = 0;
    this.backoffMs = 0;
    await this.sync({ source: "manual" });
  }
}

// Singleton instance
export const syncManager = new SyncManager();
