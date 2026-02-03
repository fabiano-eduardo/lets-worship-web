import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "@/app/auth";
import { useSyncStatus } from "@/features/sync";
import { getDeviceId, getSyncState, getStorageStats } from "@/db";
import { outboxRepository } from "@/features/sync/outboxRepository";
import type { OutboxStatus, SyncState } from "@/shared/types";

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

  const [deviceId, setDeviceId] = useState<string>("—");
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [outboxCounts, setOutboxCounts] =
    useState<OutboxCounts>(EMPTY_OUTBOX_COUNTS);
  const [storageStats, setStorageStats] = useState<{
    songsCount: number;
    versionsCount: number;
    pinnedCount: number;
    notesCount: number;
    pendingSync: number;
    conflicts: number;
  } | null>(null);
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

  const buildLabel = useMemo(() => {
    const mode = import.meta.env.MODE;
    const buildVersion = import.meta.env.VITE_BUILD_VERSION;
    return buildVersion ? `${mode} / ${buildVersion}` : mode;
  }, []);

  const syncStateValues: Partial<SyncState> = syncState ?? {};

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
          <span style={labelStyle}>lastSyncError</span>
          <span style={valueStyle}>{syncStateValues.lastError ?? "—"}</span>
        </div>
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
    </div>
  );
}
