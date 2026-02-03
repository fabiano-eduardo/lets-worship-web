// SyncManager - Core sync engine

import {
  db,
  clearSyncData,
  getDeviceId,
  getStorageStats,
  getSyncState,
  updateSyncState,
} from "@/db";
import {
  graphqlFetch,
  isOnline,
  AuthenticationError,
  type GraphQLTraceInfo,
} from "@/shared/api";
import { auth } from "@/shared/firebase";
import { outboxRepository } from "./outboxRepository";
import { conflictRepository } from "./conflictRepository";
import {
  SYNC_PUSH_MUTATION,
  SYNC_PULL_PROBE_QUERY,
  SYNC_PULL_QUERY,
  toGraphQLEntityType,
  fromGraphQLEntityType,
  type SyncPushMutation,
  type SyncPushResponse,
  type SyncPullProbeResponse,
  type SyncPullResponse,
  type SyncPullChange,
  type SyncEntitiesSnapshot,
} from "./graphql";
import type {
  Song,
  SongVersion,
  SectionNoteEntity,
  SyncApplySummary,
  SyncProbeState,
} from "@/shared/types";
import { createSyncLogger } from "./syncTrace";

type SyncSource = "manual" | "auto";
export type SyncMode = "normal" | "force_full";

export interface SyncRunResult {
  correlationId: string;
  source: SyncSource;
  mode: SyncMode;
  status: "success" | "error" | "offline" | "skipped";
  pushed: number;
  pulled: number;
  applySummary?: SyncApplySummary;
  error?: string;
}

export interface SyncContext {
  source: SyncSource;
  correlationId?: string;
  mode?: SyncMode;
  clearLocalData?: boolean;
}

interface SyncRunContext {
  syncId: string;
  source: SyncSource;
  deviceId: string;
  ownerUid: string | null;
  mode: SyncMode;
  log: (
    event: string,
    payload?: Record<string, unknown>,
    level?: "info" | "warn" | "error",
  ) => void;
}

function isSyncDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem("layout-debug") === "1";
}

function createEntityCountMap(): Record<"song" | "songVersion" | "sectionNote", number> {
  return {
    song: 0,
    songVersion: 0,
    sectionNote: 0,
  };
}

function createEmptyApplySummary(): SyncApplySummary {
  return {
    upserts: 0,
    deletes: 0,
    conflicts: 0,
    skipped: 0,
    upsertsByEntity: createEntityCountMap(),
    deletesByEntity: createEntityCountMap(),
    conflictsByEntity: createEntityCountMap(),
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
  async sync(context?: SyncContext): Promise<SyncRunResult> {
    const syncStart = Date.now();
    const syncId = context?.correlationId ?? crypto.randomUUID();
    const source: SyncSource = context?.source ?? "manual";
    const mode: SyncMode = context?.mode ?? "normal";
    const debugEnabled = isSyncDebugEnabled();
    const log = createSyncLogger({
      correlationId: syncId,
      source,
      enabled: debugEnabled,
    });

    const deviceId = await getDeviceId();
    const ownerUid = auth?.currentUser?.uid ?? null;
    const syncState = await getSyncState();
    const cursorBefore = syncState?.lastCursor ?? null;
    const pendingByStatus = await outboxRepository.countByStatus();
    const onlineNow = isOnline();

    log("SYNC_START", {
      ownerUid,
      deviceId,
      isOnline: onlineNow,
      cursorLocalAntes: cursorBefore,
      mode,
      pendingByStatus,
    });

    await updateSyncState({
      lastSyncId: syncId,
      lastSyncSource: source,
      lastSyncMode: mode,
      ownerUid: ownerUid ?? syncState?.ownerUid,
    });

    if (!onlineNow) {
      this.setStatus("offline", "Sem conexão com a internet");
      await updateSyncState({
        lastError: "Sem conexão com a internet",
      });
      log(
        "SYNC_FAIL",
        { error: "Sem conexão com a internet" },
        "warn",
      );
      log("SYNC_END", {
        durationMs: Date.now() - syncStart,
        error: "offline",
      }, "warn");
      return {
        correlationId: syncId,
        source,
        mode,
        status: "offline",
        pushed: 0,
        pulled: 0,
        error: "Sem conexão com a internet",
      };
    }

    if (this.isSyncing) {
      log("SYNC_END", { skipped: true }, "warn");
      return {
        correlationId: syncId,
        source,
        mode,
        status: "skipped",
        pushed: 0,
        pulled: 0,
      };
    }

    this.isSyncing = true;
    this.setStatus("syncing", "Sincronizando...");

    let cursor = cursorBefore;
    const preStats = await getStorageStats();

    if (syncState?.ownerUid && ownerUid && syncState.ownerUid !== ownerUid) {
      log("CURSOR_UPDATE", {
        cursorAntes: cursor,
        cursorDepois: null,
        reason: "owner_changed",
      });
      await updateSyncState({ lastCursor: null, ownerUid });
      cursor = null;
    }

    if (mode === "force_full") {
      log("FORCE_FULL_START", {
        clearLocalData: context?.clearLocalData ?? false,
      });
      if (context?.clearLocalData) {
        const cleared = await clearSyncData({ preserveOutbox: true });
        log("FORCE_FULL_CLEAR_OK", cleared);
      }
      if (cursor) {
        log("CURSOR_UPDATE", {
          cursorAntes: cursor,
          cursorDepois: null,
          reason: "force_full",
        });
      }
      await updateSyncState({ lastCursor: null });
      cursor = null;
    }

    if (
      cursor &&
      preStats.songsCount +
        preStats.versionsCount +
        preStats.notesCount ===
        0
    ) {
      log("CURSOR_UPDATE", {
        cursorAntes: cursor,
        cursorDepois: null,
        reason: "empty_local_data",
      });
      await updateSyncState({ lastCursor: null });
      cursor = null;
    }

    let pushed = 0;
    let pulled = 0;
    let applySummary: SyncApplySummary | undefined;

    try {
      // 1. Push local changes
      const pushResult = await this.pushOutbox({
        syncId,
        source,
        deviceId,
        ownerUid,
        mode,
        log,
      });
      pushed = pushResult.pushed;

      // 2. Probe server state before pull
      const probe = await this.probeSyncStatus(
        {
          syncId,
          source,
          deviceId,
          ownerUid,
          mode,
          log,
        },
        cursor,
      );

      if (
        probe?.serverCursor &&
        cursor &&
        cursor > probe.serverCursor
      ) {
        log("CURSOR_UPDATE", {
          cursorAntes: cursor,
          cursorDepois: null,
          reason: "server_cursor_behind",
        }, "warn");
        await updateSyncState({ lastCursor: null });
        cursor = null;
      }

      // 3. Pull remote changes
      const pullResult = await this.pullChanges(
        {
          syncId,
          source,
          deviceId,
          ownerUid,
          mode,
          log,
        },
        cursor,
      );
      pulled = pullResult.pulled;
      applySummary = pullResult.applySummary;

      // Verify persistence and log counts
      const postStats = await getStorageStats();
      await updateSyncState({
        lastApplySummary: applySummary,
        lastVerifyCounts: {
          songsCount: postStats.songsCount,
          versionsCount: postStats.versionsCount,
          notesCount: postStats.notesCount,
          mapItemsCount: postStats.mapItemsCount,
        },
      });
      log("APPLY_VERIFY", {
        before: preStats,
        after: postStats,
      });

      if (
        applySummary.upserts > 0 &&
        postStats.songsCount +
          postStats.versionsCount +
          postStats.notesCount ===
          0
      ) {
        throw new Error(
          "Pull retornou dados, mas nada foi persistido no IndexedDB",
        );
      }

      if (probe?.changesCount && pulled === 0) {
        throw new Error(
          "Probe indicou mudanças no servidor, mas o pull retornou vazio",
        );
      }

      // Success - reset backoff
      this.backoffIndex = 0;
      this.backoffMs = 0;

      // Update sync state
      await updateSyncState({
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      });

      log("SYNC_END", {
        durationMs: Date.now() - syncStart,
        pushed,
        pulled,
        applySummary,
        error: null,
      });

      this.setStatus("success", "Sincronização completa");
      this.emit({
        type: "progress",
        progress: { pushed, pulled },
      });

      return {
        correlationId: syncId,
        source,
        mode,
        status: "success",
        pushed,
        pulled,
        applySummary,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      log("SYNC_FAIL", { error: errorMessage }, "error");
      log("SYNC_END", {
        durationMs: Date.now() - syncStart,
        pushed,
        pulled,
        applySummary,
        error: errorMessage,
      }, "error");
      console.error("[SyncManager] Sync failed:", error);

      // Handle auth errors specially
      if (error instanceof AuthenticationError) {
        this.setStatus("error", "Sessão expirada");
        // Don't backoff for auth errors
        await updateSyncState({
          lastError: "Sessão expirada - faça login novamente",
        });
        this.emit({ type: "error", error: error as Error });
        return {
          correlationId: syncId,
          source,
          mode,
          status: "error",
          pushed,
          pulled,
          applySummary,
          error: "Sessão expirada - faça login novamente",
        };
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
      return {
        correlationId: syncId,
        source,
        mode,
        status: "error",
        pushed,
        pulled,
        applySummary,
        error: errorMessage,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Push outbox items to server
  private async pushOutbox(context: SyncRunContext): Promise<{
    pushed: number;
    serverTime?: string;
  }> {
    const { deviceId, log, syncId } = context;
    let totalPushed = 0;
    let hadPushAttempt = false;
    let lastServerTime: string | undefined;

    while (true) {
      const pending = await outboxRepository.getPending(50);
      if (pending.length === 0) {
        if (!hadPushAttempt) {
          log("REQUEST_PUSH_OK", {
            durationMs: 0,
            status: 0,
            batchPushed: 0,
            totalPushed: 0,
            skipped: true,
          });
        }
        break;
      }
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

      log("REQUEST_PUSH_START", { batchSize: pending.length });

      // Mark as SENT
      await Promise.all(
        pending.map((item) => outboxRepository.updateStatus(item.id, "SENT")),
      );

      let response: SyncPushResponse;
      let requestMeta: GraphQLTraceInfo | undefined;
      const requestStart = performance.now();
      try {
        // Push to server
        response = await graphqlFetch<SyncPushResponse>(SYNC_PUSH_MUTATION, {
          input: {
            deviceId,
            mutations,
          },
        }, {
          headers: {
            "X-Correlation-Id": syncId,
          },
          trace: (info) => {
            requestMeta = info;
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao enviar mudanças";
        const durationMs =
          requestMeta?.durationMs ?? Math.round(performance.now() - requestStart);
        const status = requestMeta?.status ?? 0;

        // Revert to PENDING on failure
        await Promise.all(
          pending.map((item) =>
            outboxRepository.updateStatus(item.id, "PENDING", errorMessage),
          ),
        );

        log(
          "REQUEST_PUSH_FAIL",
          { error: errorMessage, durationMs, status },
          "error",
        );
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
        log("PUSH_WARN", { missingCount: missing.length }, "warn");
      }

      lastServerTime = response.syncPush.serverTime ?? lastServerTime;
      log("REQUEST_PUSH_OK", {
        durationMs: requestMeta?.durationMs ?? Math.round(performance.now() - requestStart),
        status: requestMeta?.status ?? 0,
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

  private async probeSyncStatus(
    context: SyncRunContext,
    cursor: string | null,
  ): Promise<SyncProbeState | undefined> {
    const { log, syncId } = context;
    const probeState: SyncProbeState = {
      ranAt: new Date().toISOString(),
    };

    log("REQUEST_PROBE_START", { cursor, limit: 1, includeEntities: false });

    let response: SyncPullProbeResponse;
    let requestMeta: GraphQLTraceInfo | undefined;
    const requestStart = performance.now();

    try {
      response = await graphqlFetch<SyncPullProbeResponse>(
        SYNC_PULL_PROBE_QUERY,
        {
          input: {
            sinceCursor: cursor,
            limit: 1,
            includeEntities: false,
          },
        },
        {
          headers: {
            "X-Correlation-Id": syncId,
          },
          trace: (info) => {
            requestMeta = info;
          },
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao fazer probe de sync";
      const durationMs =
        requestMeta?.durationMs ?? Math.round(performance.now() - requestStart);
      const status = requestMeta?.status ?? 0;
      probeState.error = errorMessage;
      await updateSyncState({ lastProbe: probeState });
      log(
        "REQUEST_PROBE_FAIL",
        { error: errorMessage, durationMs, status },
        "error",
      );
      return probeState;
    }

    const { changes, nextCursor, hasMore, serverTime } = response.syncPull;
    const lastChangeAt = changes[changes.length - 1]?.changedAt;
    const serverCursor = nextCursor ?? changes[changes.length - 1]?.cursorId ?? null;

    const durationMs =
      requestMeta?.durationMs ?? Math.round(performance.now() - requestStart);
    const status = requestMeta?.status ?? 0;

    const nextProbeState: SyncProbeState = {
      ranAt: new Date().toISOString(),
      serverTime,
      serverCursor,
      hasMore,
      changesCount: changes.length,
      lastChangeAt,
    };

    await updateSyncState({ lastProbe: nextProbeState });
    log("REQUEST_PROBE_OK", {
      durationMs,
      status,
      ...nextProbeState,
    });

    return nextProbeState;
  }

  // Pull changes from server
  private async pullChanges(
    context: SyncRunContext,
    initialCursor: string | null,
  ): Promise<{
    pulled: number;
    serverTime?: string;
    lastCursor?: string | null;
    applySummary: SyncApplySummary;
  }> {
    const { log, syncId } = context;
    let totalPulled = 0;
    const state = await getSyncState();
    let cursor: string | undefined | null =
      initialCursor !== undefined ? initialCursor : state?.lastCursor ?? null;
    let lastServerTime: string | undefined;
    const applySummary = createEmptyApplySummary();

    if (cursor === undefined || cursor === null) {
      cursor = null;
      log("PULL_BOOTSTRAP", { cursor });
    }

    while (true) {
      log("REQUEST_PULL_START", { cursor, limit: 200, includeEntities: true });

      let response: SyncPullResponse;
      let requestMeta: GraphQLTraceInfo | undefined;
      const requestStart = performance.now();
      try {
        response = await graphqlFetch<SyncPullResponse>(
          SYNC_PULL_QUERY,
          {
            input: {
              sinceCursor: cursor,
              limit: 200,
              includeEntities: true,
            },
          },
          {
            headers: {
              "X-Correlation-Id": syncId,
            },
            trace: (info) => {
              requestMeta = info;
            },
          },
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao buscar mudanças";
        const durationMs =
          requestMeta?.durationMs ?? Math.round(performance.now() - requestStart);
        const status = requestMeta?.status ?? 0;
        log(
          "REQUEST_PULL_FAIL",
          { error: errorMessage, durationMs, status },
          "error",
        );
        throw error;
      }

      const { changes, entities, nextCursor, hasMore, serverTime } =
        response.syncPull;
      lastServerTime = serverTime ?? lastServerTime;

      log("REQUEST_PULL_OK", {
        durationMs:
          requestMeta?.durationMs ?? Math.round(performance.now() - requestStart),
        status: requestMeta?.status ?? 0,
        changesCount: changes.length,
        hasMore,
        serverTime,
        nextCursor,
      });

      const entityMaps = this.buildEntityMaps(entities);
      const batchSummary = createEmptyApplySummary();

      log("APPLY_START", { changesCount: changes.length });

      try {
        await db.transaction(
          "rw",
          [db.songs, db.versions, db.sectionNotes, db.conflicts],
          async () => {
            for (const change of changes) {
              const result = await this.applyRemoteChange(change, entityMaps);
              switch (result.action) {
                case "upsert":
                  applySummary.upserts += 1;
                  applySummary.upsertsByEntity[result.entityType] += 1;
                  batchSummary.upserts += 1;
                  batchSummary.upsertsByEntity[result.entityType] += 1;
                  break;
                case "delete":
                  applySummary.deletes += 1;
                  applySummary.deletesByEntity[result.entityType] += 1;
                  batchSummary.deletes += 1;
                  batchSummary.deletesByEntity[result.entityType] += 1;
                  break;
                case "conflict":
                  applySummary.conflicts += 1;
                  applySummary.conflictsByEntity[result.entityType] += 1;
                  batchSummary.conflicts += 1;
                  batchSummary.conflictsByEntity[result.entityType] += 1;
                  break;
                case "noop":
                  applySummary.skipped += 1;
                  batchSummary.skipped += 1;
                  if (result.reason) {
                    log(
                      "APPLY_SKIP",
                      {
                        entityType: result.entityType,
                        entityId: result.entityId,
                        reason: result.reason,
                      },
                      "warn",
                    );
                  }
                  break;
                default:
                  break;
              }
            }
          },
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao aplicar mudanças";
        log("APPLY_FAIL", { error: errorMessage }, "error");
        throw error;
      }

      log("APPLY_OK", {
        changesCount: changes.length,
        batchSummary,
        totalSummary: applySummary,
      });

      totalPulled += changes.length;

      // Update cursor
      let resolvedCursor = nextCursor ?? null;
      if (!resolvedCursor && changes.length > 0) {
        resolvedCursor = changes[changes.length - 1]?.cursorId ?? null;
      }
      if (resolvedCursor && resolvedCursor !== cursor) {
        log("CURSOR_UPDATE", {
          cursorAntes: cursor,
          cursorDepois: resolvedCursor,
        });
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
  ): Promise<{
    action: "upsert" | "delete" | "conflict" | "noop";
    entityType: "song" | "songVersion" | "sectionNote";
    entityId: string;
    reason?: string;
  }> {
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
      return { action: "conflict", entityType, entityId: change.entityId };
    }

    if (change.op === "DELETE") {
      await this.deleteLocalEntity(entityType, change.entityId);
      return { action: "delete", entityType, entityId: change.entityId };
    } else if (change.op === "UPSERT" && entityData) {
      await this.upsertLocalEntity(
        entityType,
        change.entityId,
        entityData,
        change.rev,
      );
      return { action: "upsert", entityType, entityId: change.entityId };
    } else if (change.op === "UPSERT" && !entityData) {
      return {
        action: "noop",
        entityType,
        entityId: change.entityId,
        reason: "missing_entity_snapshot",
      };
    }

    return {
      action: "noop",
      entityType,
      entityId: change.entityId,
      reason: "unsupported_change",
    };
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
