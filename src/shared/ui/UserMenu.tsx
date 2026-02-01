// User menu component for header

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/auth";
import { useNetworkStatus } from "@/shared/api";
import { useSyncStatus, useSync } from "@/features/sync";
import {
  IconUser,
  IconLogOut,
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconLoader,
  IconCheck,
} from "./components/Icons";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { status: syncStatus, lastMessage } = useSyncStatus();
  const { sync, canSync } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Use window.location to avoid router type issues
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return "bg-red-500";
    switch (syncStatus) {
      case "syncing":
        return "bg-indigo-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        {/* Sync status indicator */}
        <span
          className={`w-2 h-2 rounded-full ${getSyncStatusColor()} ${
            syncStatus === "syncing" ? "animate-pulse" : ""
          }`}
          title={
            !isOnline
              ? "Offline"
              : syncStatus === "syncing"
                ? "Sincronizando..."
                : syncStatus === "success"
                  ? "Sincronizado"
                  : syncStatus === "error"
                    ? lastMessage || "Erro de sincronização"
                    : "Aguardando"
          }
        />

        {/* User avatar or icon */}
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
        ) : (
          <IconUser className="w-5 h-5 text-slate-300" />
        )}

        {/* Email (truncated) */}
        <span className="text-sm text-slate-300 max-w-[120px] truncate hidden sm:block">
          {user.displayName || user.email?.split("@")[0]}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
          {/* User info */}
          <div className="p-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white truncate">
              {user.displayName || "Usuário"}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Sync status */}
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {!isOnline ? (
                  <>
                    <IconWifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-slate-300">Offline</span>
                  </>
                ) : syncStatus === "syncing" ? (
                  <>
                    <IconLoader className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-slate-300">Sincronizando...</span>
                  </>
                ) : syncStatus === "success" ? (
                  <>
                    <IconCheck className="w-4 h-4 text-green-500" />
                    <span className="text-slate-300">Sincronizado</span>
                  </>
                ) : syncStatus === "error" ? (
                  <>
                    <IconWifi className="w-4 h-4 text-red-500" />
                    <span className="text-slate-300">Erro</span>
                  </>
                ) : (
                  <>
                    <IconWifi className="w-4 h-4 text-green-500" />
                    <span className="text-slate-300">Online</span>
                  </>
                )}
              </div>
              {canSync && syncStatus !== "syncing" && (
                <button
                  onClick={() => sync()}
                  className="p-1.5 rounded hover:bg-slate-600 transition-colors"
                  title="Sincronizar agora"
                >
                  <IconRefresh className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            {!isOnline && (
              <p className="text-xs text-slate-500 mt-1">Usando dados locais</p>
            )}
            {syncStatus === "error" && lastMessage && (
              <p className="text-xs text-red-400 mt-1">{lastMessage}</p>
            )}
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded transition-colors"
            >
              <IconLogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple status badge for compact display
export function ConnectionStatus() {
  const { isOnline } = useNetworkStatus();
  const { status: syncStatus } = useSyncStatus();

  const getColor = () => {
    if (!isOnline) return "bg-red-500/20 text-red-400";
    switch (syncStatus) {
      case "syncing":
        return "bg-indigo-500/20 text-indigo-400";
      case "success":
        return "bg-green-500/20 text-green-400";
      case "error":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const getText = () => {
    if (!isOnline) return "Offline";
    switch (syncStatus) {
      case "syncing":
        return "Sincronizando";
      case "success":
        return "Sincronizado";
      case "error":
        return "Erro";
      default:
        return "Online";
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getColor()}`}
    >
      {!isOnline ? (
        <IconWifiOff className="w-3 h-3" />
      ) : syncStatus === "syncing" ? (
        <IconLoader className="w-3 h-3 animate-spin" />
      ) : (
        <IconWifi className="w-3 h-3" />
      )}
      <span>{getText()}</span>
    </div>
  );
}
