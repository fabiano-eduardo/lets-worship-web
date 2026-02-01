// Sync status indicator component

import { useSyncStatus, useSync } from "@/features/sync";
import { useNetworkStatus } from "@/shared/api";
import {
  IconRefresh,
  IconCheck,
  IconWifi,
  IconWifiOff,
  IconLoader,
} from "@/shared/ui/components/Icons";

interface SyncIndicatorProps {
  compact?: boolean;
}

export function SyncIndicator({ compact = false }: SyncIndicatorProps) {
  const { status, lastMessage } = useSyncStatus();
  const { sync, canSync } = useSync();
  const { isOnline, isAuthenticated } = useNetworkStatus();

  const getStatusColor = () => {
    if (!isOnline) return "text-red-400";
    if (!isAuthenticated) return "text-yellow-400";
    switch (status) {
      case "syncing":
        return "text-indigo-400";
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return <IconWifiOff className="w-4 h-4" />;
    }
    if (status === "syncing") {
      return <IconLoader className="w-4 h-4 animate-spin" />;
    }
    if (status === "success") {
      return <IconCheck className="w-4 h-4" />;
    }
    if (status === "error") {
      return <IconRefresh className="w-4 h-4" />;
    }
    return <IconWifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (!isAuthenticated) return "Login necessário";
    switch (status) {
      case "syncing":
        return "Sincronizando...";
      case "success":
        return "Em dia";
      case "error":
        return lastMessage || "Erro";
      default:
        return "Online";
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => canSync && sync()}
        disabled={!canSync}
        className={`p-2 rounded-lg transition-colors ${getStatusColor()} ${
          canSync ? "hover:bg-slate-700" : "cursor-not-allowed opacity-50"
        }`}
        title={getStatusText()}
      >
        {getStatusIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={() => canSync && sync()}
      disabled={!canSync}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${getStatusColor()} ${
        canSync ? "hover:bg-slate-700" : "cursor-not-allowed"
      }`}
      title={canSync ? "Clique para sincronizar" : getStatusText()}
    >
      {getStatusIcon()}
      <span className="text-xs font-medium">{getStatusText()}</span>
    </button>
  );
}

// Badge showing pending items
export function SyncBadge() {
  const { status } = useSyncStatus();

  if (status !== "error") return null;

  return (
    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
  );
}
