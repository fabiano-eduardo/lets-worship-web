import { useEffect, useRef } from "react";
import { subscribeSyncTrace } from "@/features/sync/syncTrace";
import { useToast } from "@/shared/ui";

const TOAST_EVENTS = new Set(["SYNC_FAIL", "REQUEST_PROBE_FAIL"]);

export function SyncTraceToast() {
  const { showToast } = useToast();
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return subscribeSyncTrace((entry) => {
      if (!TOAST_EVENTS.has(entry.event)) return;
      if (seenRef.current.has(entry.id)) return;
      seenRef.current.add(entry.id);

      const message =
        typeof entry.payload?.error === "string"
          ? entry.payload.error
          : entry.payload
          ? JSON.stringify(entry.payload)
          : undefined;

      if (entry.event === "REQUEST_PROBE_FAIL") {
        const toastType = entry.level === "warn" ? "warning" : "error";
        showToast(toastType, "Probe de sync falhou", message);
        return;
      }

      const toastType = entry.level === "warn" ? "warning" : "error";
      showToast(toastType, "Erro de sincronização", message);
    });
  }, [showToast]);

  return null;
}
