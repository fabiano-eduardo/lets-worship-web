export type SyncTraceLevel = "info" | "warn" | "error";

export interface SyncTraceEntry {
  id: string;
  correlationId: string;
  source: "manual" | "auto";
  event: string;
  level: SyncTraceLevel;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type SyncTraceListener = (
  entry: SyncTraceEntry,
  entries: SyncTraceEntry[],
) => void;

const MAX_ENTRIES = 500;

let entries: SyncTraceEntry[] = [];
const listeners = new Set<SyncTraceListener>();

export function logSyncEvent(input: {
  correlationId: string;
  source: "manual" | "auto";
  event: string;
  level?: SyncTraceLevel;
  payload?: Record<string, unknown>;
}): SyncTraceEntry {
  const entry: SyncTraceEntry = {
    id: crypto.randomUUID(),
    correlationId: input.correlationId,
    source: input.source,
    event: input.event,
    level: input.level ?? "info",
    timestamp: new Date().toISOString(),
    payload: input.payload ?? {},
  };

  entries = [...entries, entry];
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(entries.length - MAX_ENTRIES);
  }

  listeners.forEach((listener) => listener(entry, entries));
  return entry;
}

export function getSyncTraceEntries(): SyncTraceEntry[] {
  return entries;
}

export function subscribeSyncTrace(listener: SyncTraceListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearSyncTrace(): void {
  entries = [];
}

export function formatSyncTrace(
  traceEntries: SyncTraceEntry[] = entries,
): string {
  return traceEntries
    .map((entry) => {
      const payload =
        Object.keys(entry.payload).length > 0
          ? ` ${JSON.stringify(entry.payload)}`
          : "";
      return `[${entry.timestamp}] ${entry.event} (${entry.level}) ${entry.correlationId}${payload}`;
    })
    .join("\n");
}

export function createSyncLogger(options: {
  correlationId: string;
  source: "manual" | "auto";
  enabled: boolean;
}): (event: string, payload?: Record<string, unknown>, level?: SyncTraceLevel) => void {
  const { correlationId, source, enabled } = options;

  return (event, payload = {}, level = "info") => {
    logSyncEvent({
      correlationId,
      source,
      event,
      level,
      payload,
    });

    if (enabled) {
      console.log("[SYNC]", event, {
        correlationId,
        source,
        ...payload,
      });
    }
  };
}
