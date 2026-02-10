// User menu component for header

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/app/auth";
import { useNetworkStatus } from "@/shared/api";
import {
  IconLogOut,
  IconWifi,
  IconWifiOff,
  IconChevronDown,
} from "./components/Icons";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

type BadgeStatus = "offline" | "ok";

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
  onLogout,
}: UserMenuPanelProps) {
  const statusLabel = isOnline ? "Online" : "Offline";

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
        <div className="user-menu__section-title">Conectividade</div>
        <div className="user-menu__sync-card">
          <div className="user-menu__sync-row">
            <span
              className="user-menu__sync-dot"
              data-status={isOnline ? "ok" : "offline"}
              aria-hidden
            />
            <span className="user-menu__sync-label">{statusLabel}</span>
          </div>
          {!isOnline && (
            <div className="user-menu__sync-hint">
              Conecte-se para acessar seus dados
            </div>
          )}
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
  const { isOnline } = useNetworkStatus();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const displayName = getUserDisplayName(user?.displayName, user?.email);
  const emailOrUid = user?.email || user?.uid || "";
  const initials = getUserInitials(user?.displayName, user?.email, user?.uid);

  const badgeStatus: BadgeStatus = isOnline ? "ok" : "offline";

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
          onLogout={handleSignOut}
        />
      )}
    </div>
  );
}

// Simple status badge for compact display
export function ConnectionStatus() {
  const { isOnline } = useNetworkStatus();

  const color = isOnline
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400";

  const text = isOnline ? "Online" : "Offline";

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${color}`}
    >
      {isOnline ? (
        <IconWifi className="w-3 h-3" />
      ) : (
        <IconWifiOff className="w-3 h-3" />
      )}
      <span>{text}</span>
    </div>
  );
}
