// User menu component for header

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/app/auth";
import { useSyncStatus, useSync } from "@/features/sync";
import {
  IconLogOut,
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconLoader,
  IconCheck,
  IconChevronDown,
  IconAlertTriangle,
} from "./components/Icons";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

type BadgeStatus = "offline" | "ok" | "pending" | "error";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQueryList.matches);

    updateMatches();
    mediaQueryList.addEventListener("change", updateMatches);

    return () => mediaQueryList.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

function getUserDisplayName(
  displayName?: string | null,
  email?: string | null,
) {
  if (displayName) return displayName;
  if (email) return email.split("@")[0];
  return "Conta";
}

function getUserInitials(
  displayName?: string | null,
  email?: string | null,
  uid?: string | null,
) {
  const source = displayName || email || uid || "U";
  const parts = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  const initials = parts.map((part) => part[0]?.toUpperCase()).join("");
  return initials || "U";
}

function getBadgeStatus(params: {
  isOnline: boolean;
  pendingMutationsCount: number;
  hasAuthError: boolean;
  syncStatus: string;
}): BadgeStatus {
  const { isOnline, pendingMutationsCount, hasAuthError, syncStatus } = params;

  if (!isOnline) return "offline";
  if (hasAuthError || syncStatus === "error") return "error";
  if (pendingMutationsCount > 0) return "pending";
  return "ok";
}

function formatRelativeTime(date: Date | null) {
  if (!date) return "Nunca";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 10000) return "agora mesmo";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "há menos de 1 min";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "há 1 dia";
  if (days < 7) return `há ${days} dias`;

  return date.toLocaleDateString();
}

interface UserMenuButtonProps {
  avatarUrl?: string | null;
  initials: string;
  displayName: string;
  badgeStatus: BadgeStatus;
  isOpen: boolean;
  showLabel: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function UserMenuButton({
  avatarUrl,
  initials,
  displayName,
  badgeStatus,
  isOpen,
  showLabel,
  onToggle,
  buttonRef,
}: UserMenuButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="user-menu__button"
      onClick={onToggle}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label="Abrir menu do usuário"
    >
      <span className="user-menu__avatar" aria-hidden>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="user-menu__avatar-image" />
        ) : (
          <span className="user-menu__avatar-fallback">{initials}</span>
        )}
        <span
          className="user-menu__status"
          data-status={badgeStatus}
          aria-hidden
        />
      </span>
      {showLabel && (
        <span className="user-menu__label" aria-hidden>
          {displayName}
        </span>
      )}
      {showLabel && (
        <IconChevronDown className="user-menu__chevron" size={16} />
      )}
    </button>
  );
}

interface UserMenuPanelProps {
  isDesktop: boolean;
  panelRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  displayName: string;
  emailOrUid: string;
  avatarUrl?: string | null;
  initials: string;
  badgeStatus: BadgeStatus;
  isOnline: boolean;
  pendingMutationsCount: number;
  lastSyncAt: Date | null;
  hasAuthError: boolean;
  syncError?: string;
  syncStatus: string;
  canSync: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  onLogout: () => void;
}

export function UserMenuPanel({
  isDesktop,
  panelRef,
  onClose,
  displayName,
  emailOrUid,
  avatarUrl,
  initials,
  badgeStatus,
  isOnline,
  pendingMutationsCount,
  lastSyncAt,
  hasAuthError,
  syncError,
  syncStatus,
  canSync,
  isSyncing,
  onSyncNow,
  onLogout,
}: UserMenuPanelProps) {
  const syncLabel = useMemo(() => {
    if (hasAuthError) return "Autenticação necessária";
    if (syncStatus === "error") return "Erro de sincronização";
    if (pendingMutationsCount > 0)
      return `Pendente: ${pendingMutationsCount} mudanças`;
    return "Sincronizado";
  }, [hasAuthError, pendingMutationsCount, syncStatus]);

  const statusLabel = isOnline ? "Online" : "Offline";
  const lastSyncLabel = formatRelativeTime(lastSyncAt);

  const panelContent = (
    <div
      className={`user-menu__panel ${isDesktop ? "user-menu__panel--popover" : "user-menu__panel--sheet"}`}
      ref={panelRef}
      role="dialog"
      aria-label="Menu do usuário"
      tabIndex={-1}
    >
      <div className="user-menu__section user-menu__section--account">
        <div className="user-menu__account-row">
          <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="user-menu__avatar-image" />
            ) : (
              <span className="user-menu__avatar-fallback">{initials}</span>
            )}
            <span
              className="user-menu__status"
              data-status={badgeStatus}
              aria-hidden
            />
          </span>
          <div className="user-menu__account-text">
            <span className="user-menu__account-name user-menu__truncate">
              {displayName}
            </span>
            <span className="user-menu__account-subtext user-menu__truncate">
              {emailOrUid}
            </span>
          </div>
        </div>
      </div>

      <div className="user-menu__divider" />

      <div className="user-menu__section">
        <div className="user-menu__section-title">Conectividade e Sync</div>
        <div className="user-menu__sync-card">
          <div className="user-menu__sync-row">
            <span
              className="user-menu__sync-dot"
              data-status={isOnline ? "ok" : "offline"}
              aria-hidden
            />
            <span className="user-menu__sync-label">{statusLabel}</span>
          </div>
          <div className="user-menu__sync-row">
            {hasAuthError || syncStatus === "error" ? (
              <IconAlertTriangle className="user-menu__sync-icon user-menu__sync-icon--error" size={16} />
            ) : syncStatus === "syncing" || isSyncing ? (
              <IconLoader
                className="user-menu__sync-icon user-menu__sync-icon--info user-menu__sync-icon--spin"
                size={16}
              />
            ) : pendingMutationsCount > 0 ? (
              <IconRefresh className="user-menu__sync-icon user-menu__sync-icon--warning" size={16} />
            ) : (
              <IconCheck className="user-menu__sync-icon user-menu__sync-icon--success" size={16} />
            )}
            <span className="user-menu__sync-label">{syncLabel}</span>
          </div>
          <div className="user-menu__sync-meta">
            Última sincronização: {lastSyncLabel}
          </div>
          {syncError && (
            <div className="user-menu__sync-error user-menu__truncate">
              {syncError}
            </div>
          )}
          {!isOnline && (
            <div className="user-menu__sync-hint">Usando dados locais</div>
          )}
          <div className="user-menu__sync-actions">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={onSyncNow}
              disabled={!canSync}
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
            </button>
          </div>
        </div>
      </div>

      <div className="user-menu__divider" />

      <div className="user-menu__section user-menu__section--actions">
        <button
          type="button"
          className="user-menu__action user-menu__action--destructive"
          onClick={onLogout}
        >
          <IconLogOut className="user-menu__action-icon" size={16} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return panelContent;
  }

  return (
    <div className="user-menu__overlay" onClick={onClose} role="presentation">
      <div
        className="user-menu__sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="user-menu__sheet-handle" aria-hidden />
        {panelContent}
      </div>
    </div>
  );
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const {
    status: syncStatus,
    isOnline,
    pendingMutationsCount,
    lastSyncAt,
    hasAuthError,
    syncError,
  } = useSyncStatus();
  const { sync, canSync, isSyncing } = useSync();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const displayName = getUserDisplayName(user?.displayName, user?.email);
  const emailOrUid = user?.email || user?.uid || "";
  const initials = getUserInitials(user?.displayName, user?.email, user?.uid);

  const badgeStatus = getBadgeStatus({
    isOnline,
    pendingMutationsCount,
    hasAuthError,
    syncStatus,
  });

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    } else {
      buttonRef.current?.focus();
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSignOut = useCallback(async () => {
    const confirmed = window.confirm("Deseja sair da sua conta?");
    if (!confirmed) return;

    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (!isDesktop) return;
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isDesktop, closeMenu]);

  if (!user) {
    return null;
  }

  return (
    <div className="user-menu">
      <UserMenuButton
        avatarUrl={user.photoURL}
        initials={initials}
        displayName={displayName}
        badgeStatus={badgeStatus}
        isOpen={isOpen}
        showLabel={isDesktop}
        onToggle={toggleMenu}
        buttonRef={buttonRef}
      />

      {isOpen && (
        <UserMenuPanel
          isDesktop={isDesktop}
          panelRef={panelRef}
          onClose={closeMenu}
          displayName={displayName}
          emailOrUid={emailOrUid}
          avatarUrl={user.photoURL}
          initials={initials}
          badgeStatus={badgeStatus}
          isOnline={isOnline}
          pendingMutationsCount={pendingMutationsCount}
          lastSyncAt={lastSyncAt}
          hasAuthError={hasAuthError}
          syncError={syncError}
          syncStatus={syncStatus}
          canSync={canSync}
          isSyncing={isSyncing}
          onSyncNow={sync}
          onLogout={handleSignOut}
        />
      )}
    </div>
  );
}

// Simple status badge for compact display
export function ConnectionStatus() {
  const { status: syncStatus, isOnline } = useSyncStatus();

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
