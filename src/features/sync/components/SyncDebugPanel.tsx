import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "@/app/auth";
import { useSyncStatus, useSync } from "@/features/sync";
import { getDeviceId, getSyncState, getStorageStats } from "@/db";
import { outboxRepository } from "@/features/sync/outboxRepository";
import type { OutboxStatus, SyncState } from "@/shared/types";
import {
  formatSyncTrace,
  getSyncTraceEntries,
  subscribeSyncTrace,
  clearSyncTrace,
} from "@/features/sync/syncTrace";
import { useToast } from "@/shared/ui";

type OutboxCounts = Record<OutboxStatus, number>;

const EMPTY_OUTBOX_COUNTS: OutboxCounts = {
  PENDING: 0,
  SENT: 0,
  ACK: 0,
  CONFLICT: 0,
  REJECTED: 0,
};

function formatTimestamp(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function getServiceWorkerState(): string {
  if (typeof navigator === "undefined") return "none";
  return navigator.serviceWorker?.controller?.state ?? "none";
}

export function SyncDebugPanel() {
  const { user, isAuthenticated } = useAuth();
  const {
    status,
    pendingMutationsCount,
    lastSyncAt,
    isOnline,
    syncError,
  } = useSyncStatus();
  const { sync, isSyncing } = useSync();
  const { showToast } = useToast();

  const [deviceId, setDeviceId] = useState<string>("—");
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [outboxCounts, setOutboxCounts] =
    useState<OutboxCounts>(EMPTY_OUTBOX_COUNTS);
  const [storageStats, setStorageStats] = useState<{
    songsCount: number;
    versionsCount: number;
    pinnedCount: number;
    notesCount: number;
    mapItemsCount: number;
    pendingSync: number;
    conflicts: number;
  } | null>(null);
  const [traceEntries, setTraceEntries] = useState(getSyncTraceEntries());
  const [serviceWorkerState, setServiceWorkerState] = useState("none");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      try {
        const [device, state, counts, stats] = await Promise.all([
          getDeviceId(),
          getSyncState(),
          outboxRepository.countByStatus(),
          getStorageStats(),
        ]);
        if (!isMounted) return;
        setDeviceId(device);
        setSyncState(state ?? null);
        setOutboxCounts(counts);
        setStorageStats(stats);
        setServiceWorkerState(getServiceWorkerState());
        setLastUpdatedAt(new Date());
      } catch (error) {
        console.error("[SyncDebugPanel] Failed to refresh state:", error);
      }
    };

    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setTraceEntries(getSyncTraceEntries());
    return subscribeSyncTrace((_entry, entries) => {
      setTraceEntries([...entries]);
    });
  }, []);

  const handleCopyLogs = async () => {
    try {
      const text = formatSyncTrace(traceEntries);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("success", "Logs copiados!");
        return;
      }
      window.prompt("Copie os logs abaixo:", text);
    } catch (error) {
      showToast("error", "Falha ao copiar logs", String(error));
    }
  };

  const handleForceFullResync = async (clearLocalData: boolean) => {
    const confirmed = window.confirm(
      clearLocalData
        ? "Forçar resync completo e limpar dados locais? Isso mantém o outbox."
        : "Forçar resync completo (resetar cursor) agora?",
    );
    if (!confirmed) return;
    await sync("manual", "force_full", clearLocalData);
  };

  const buildLabel = useMemo(() => {
    const mode = import.meta.env.MODE;
    const buildVersion = import.meta.env.VITE_BUILD_VERSION;
    return buildVersion ? `${mode} / ${buildVersion}` : mode;
  }, []);

  const syncStateValues: Partial<SyncState> = syncState ?? {};
  const probeState = syncStateValues.lastProbe;
  const applySummary = syncStateValues.lastApplySummary;

  const applySummaryText = applySummary
    ? `U:${applySummary.upserts} D:${applySummary.deletes} C:${applySummary.conflicts} S:${applySummary.skipped}`
    : "—";

  const applyEntityText = applySummary
    ? `songs:${applySummary.upsertsByEntity.song}/${applySummary.deletesByEntity.song} versions:${applySummary.upsertsByEntity.songVersion}/${applySummary.deletesByEntity.songVersion} notes:${applySummary.upsertsByEntity.sectionNote}/${applySummary.deletesByEntity.sectionNote}`
    : "—";

  const tracePreview = traceEntries.slice(-50).reverse();

  const rowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 12,
    lineHeight: 1.4,
  };

  const labelStyle: CSSProperties = {
    color: "#94a3b8",
    whiteSpace: "nowrap",
  };

  const valueStyle: CSSProperties = {
    color: "#e2e8f0",
    textAlign: "right",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
        width: 340,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "rgba(15, 23, 42, 0.95)",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Sync Debug</span>
        <span style={{ color: "#94a3b8", fontWeight: 400 }}>
          {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString("pt-BR") : "—"}
        </span>
      </div>

      <div style={{ display: "grid", gap: 4, marginBottom: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>ownerUid</span>
          <span style={valueStyle}>{user?.uid ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>syncOwner</span>
          <span style={valueStyle}>{syncStateValues.ownerUid ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>deviceId</span>
          <span style={valueStyle}>{deviceId}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>isAuthenticated</span>
          <span style={valueStyle}>{isAuthenticated ? "true" : "false"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>isOnline</span>
          <span style={valueStyle}>{isOnline ? "true" : "false"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>syncStatus</span>
          <span style={valueStyle}>{status}</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>pendingMutations</span>
          <span style={valueStyle}>{pendingMutationsCount}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>outbox</span>
          <span style={valueStyle}>
            P:{outboxCounts.PENDING} S:{outboxCounts.SENT} A:{outboxCounts.ACK}{" "}
            C:{outboxCounts.CONFLICT} R:{outboxCounts.REJECTED}
          </span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>lastSyncAt</span>
          <span style={valueStyle}>
            {lastSyncAt ? lastSyncAt.toLocaleString("pt-BR") : "—"}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastPushAt</span>
          <span style={valueStyle}>
            {formatTimestamp(syncStateValues.lastPushAt)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastPullAt</span>
          <span style={valueStyle}>
            {formatTimestamp(syncStateValues.lastPullAt)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastCursor</span>
          <span style={valueStyle}>
            {syncStateValues.lastCursor ?? "—"}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastSyncId</span>
          <span style={valueStyle}>
            {syncStateValues.lastSyncId ?? "—"}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastSyncSource</span>
          <span style={valueStyle}>
            {syncStateValues.lastSyncSource ?? "—"}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastServerTime</span>
          <span style={valueStyle}>
            {formatTimestamp(syncStateValues.lastServerTime)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastSyncMode</span>
          <span style={valueStyle}>{syncStateValues.lastSyncMode ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastSyncError</span>
          <span style={valueStyle}>{syncStateValues.lastError ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>applySummary</span>
          <span style={valueStyle}>{applySummaryText}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>applyByEntity</span>
          <span style={valueStyle}>{applyEntityText}</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>probeAt</span>
          <span style={valueStyle}>
            {formatTimestamp(probeState?.ranAt)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>probeServerTime</span>
          <span style={valueStyle}>
            {formatTimestamp(probeState?.serverTime)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>probeCursor</span>
          <span style={valueStyle}>{probeState?.serverCursor ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>probeChanges</span>
          <span style={valueStyle}>{probeState?.changesCount ?? "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>probeHasMore</span>
          <span style={valueStyle}>
            {probeState?.hasMore === undefined
              ? "—"
              : probeState.hasMore
              ? "true"
              : "false"}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>probeLastChange</span>
          <span style={valueStyle}>
            {formatTimestamp(probeState?.lastChangeAt)}
          </span>
        </div>
        {probeState?.error && (
          <div style={{ marginTop: 6, color: "#fca5a5", fontSize: 12 }}>
            Probe error: {probeState.error}
          </div>
        )}
      </div>

      {storageStats && (
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>songsCount</span>
            <span style={valueStyle}>{storageStats.songsCount}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>versionsCount</span>
            <span style={valueStyle}>{storageStats.versionsCount}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>notesCount</span>
            <span style={valueStyle}>{storageStats.notesCount}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>mapItems</span>
            <span style={valueStyle}>{storageStats.mapItemsCount}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>pinnedOffline</span>
            <span style={valueStyle}>{storageStats.pinnedCount}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>conflicts</span>
            <span style={valueStyle}>{storageStats.conflicts}</span>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>build</span>
          <span style={valueStyle}>{buildLabel}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>serviceWorker</span>
          <span style={valueStyle}>{serviceWorkerState}</span>
        </div>
        {syncError && (
          <div style={{ marginTop: 6, color: "#f87171", fontSize: 12 }}>
            {syncError}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="button button--secondary button--sm"
            disabled={isSyncing}
            onClick={() => handleForceFullResync(false)}
          >
            Force Full Resync
          </button>
          <button
            className="button button--danger button--sm"
            disabled={isSyncing}
            onClick={() => handleForceFullResync(true)}
          >
            Resync + Clear Local
          </button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "#e2e8f0" }}>Sync Trace</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="button button--secondary button--sm"
              onClick={handleCopyLogs}
            >
              Copiar logs
            </button>
            <button
              className="button button--secondary button--sm"
              onClick={() => {
                clearSyncTrace();
                setTraceEntries([]);
              }}
            >
              Limpar
            </button>
          </div>
        </div>
        <div
          style={{
            maxHeight: 160,
            overflow: "auto",
            fontSize: 11,
            background: "#0f172a",
            borderRadius: 6,
            padding: 6,
            border: "1px solid #1e293b",
          }}
        >
          {tracePreview.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>Sem logs ainda.</div>
          ) : (
            tracePreview.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 4,
                  color:
                    entry.level === "error"
                      ? "#f87171"
                      : entry.level === "warn"
                        ? "#fbbf24"
                        : "#e2e8f0",
                }}
              >
                <span style={{ color: "#94a3b8" }}>
                  {new Date(entry.timestamp).toLocaleTimeString("pt-BR")}
                </span>
                <span style={{ fontWeight: 600 }}>{entry.event}</span>
                <span style={{ color: "#94a3b8" }}>
                  {entry.correlationId.slice(0, 8)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
