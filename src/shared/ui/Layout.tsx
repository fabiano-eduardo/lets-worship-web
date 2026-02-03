// Layout component - App Shell with CSS Grid (no fixed positioning)

import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { type ReactNode, useState, useEffect } from "react";
import {
  IconMusic,
  IconSettings,
  IconChevronLeft,
  IconWifiOff,
} from "./components/Icons";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { usePWAUpdate } from "@/shared/hooks/usePWAUpdate";
import { UserMenu } from "./UserMenu";
import { SyncDebugPanel } from "@/features/sync/components/SyncDebugPanel";
import { SyncTraceToast } from "@/features/sync/components/SyncTraceToast";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isOnline = useOnlineStatus();
  const { needsUpdate, updateApp } = usePWAUpdate();
  const location = useLocation();

  // Debug mode: enable via ?debug=1 in URL or localStorage
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get("debug") === "1";
    const debugStorage = localStorage.getItem("layout-debug") === "1";
    setDebugMode(debugParam || debugStorage);

    // Persist debug mode if set via URL
    if (debugParam) {
      localStorage.setItem("layout-debug", "1");
    }
  }, []);

  // Don't show navigation on login page
  const isLoginPage = location.pathname === "/login";

  // Login page has its own full-screen layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  const shellClassName = debugMode ? "app-shell app-shell--debug" : "app-shell";

  return (
    <div className={shellClassName}>
      {/* Debug badge */}
      {debugMode && (
        <div className="debug-badge">
          DEBUG | H:56px | N:64px |
          <button
            onClick={() => {
              localStorage.removeItem("layout-debug");
              setDebugMode(false);
            }}
            style={{
              marginLeft: 8,
              color: "#f00",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
            }}
          >
            [X]
          </button>
        </div>
      )}

      {/* Header - grid row 1 */}
      <header className="app-header">
        <div className="app-header__brand">
          <IconMusic className="app-header__logo" />
          <span className="app-header__title">Let's Worship</span>
        </div>
        <UserMenu />
      </header>

      {/* Main scrollable content - grid row 2 */}
      <main className="app-main">
        {/* Offline indicator (inside main, at top) */}
        {!isOnline && (
          <div className="offline-banner">
            <IconWifiOff size={16} />
            <span>Você está offline</span>
          </div>
        )}
        {children}
      </main>

      {/* Bottom navigation - grid row 3 */}
      <nav className="app-nav">
        <Link
          to="/songs"
          className="app-nav__item"
          activeProps={{
            className: "app-nav__item app-nav__item--active",
          }}
        >
          <IconMusic size={24} />
          <span>Músicas</span>
        </Link>
        <Link
          to="/settings"
          className="app-nav__item"
          activeProps={{
            className: "app-nav__item app-nav__item--active",
          }}
        >
          <IconSettings size={24} />
          <span>Config</span>
        </Link>
      </nav>

      {/* PWA update banner */}
      {needsUpdate && (
        <div className="pwa-update-banner">
          <div className="pwa-update-banner__content">
            <div className="pwa-update-banner__title">
              Atualização disponível
            </div>
            <div className="pwa-update-banner__message">
              Uma nova versão está pronta para ser instalada.
            </div>
          </div>
          <button
            className="button button--primary button--sm"
            onClick={updateApp}
          >
            Atualizar
          </button>
        </div>
      )}

      {debugMode && <SyncDebugPanel />}
      <SyncTraceToast />
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  showBack = false,
  backTo,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backTo) {
      router.navigate({ to: backTo });
    } else {
      router.history.back();
    }
  };

  return (
    <header className="header">
      {showBack && (
        <button
          className="header__back"
          onClick={handleBack}
          aria-label="Voltar"
        >
          <IconChevronLeft size={24} />
        </button>
      )}
      <h1
        className="header__title"
        style={{
          marginLeft: showBack ? undefined : "16px",
        }}
      >
        {title}
      </h1>
      {actions && <div className="header__actions">{actions}</div>}
    </header>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-6">
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-accent-primary)",
          borderRadius: "50%",
          animation: "button-spin 0.6s linear infinite",
        }}
      />
    </div>
  );
}
