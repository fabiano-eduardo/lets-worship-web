import { syncManager, type SyncMode, type SyncRunResult } from "./SyncManager";

export interface SyncNowOptions {
  source?: "manual" | "auto";
  mode?: SyncMode;
  clearLocalData?: boolean;
  correlationId?: string;
}

export async function syncNow(
  options: SyncNowOptions = {},
): Promise<SyncRunResult> {
  const correlationId = options.correlationId ?? crypto.randomUUID();
  return syncManager.sync({
    source: options.source ?? "manual",
    correlationId,
    mode: options.mode ?? "normal",
    clearLocalData: options.clearLocalData ?? false,
  });
}

export type { SyncMode, SyncRunResult };
