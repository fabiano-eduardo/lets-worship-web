// Layout component

import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { IconMusic, IconSettings, IconChevronLeft } from "./components/Icons";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { usePWAUpdate } from "@/shared/hooks/usePWAUpdate";
import { UserMenu } from "./UserMenu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isOnline = useOnlineStatus();
  const { needsUpdate, updateApp } = usePWAUpdate();
  const location = useLocation();

  // Don't show navigation on login page
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="layout">
      {/* Top header with user menu (not on login) */}
      {!isLoginPage && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <IconMusic className="w-6 h-6 text-indigo-500" />
              <span className="font-semibold text-white">Let's Worship</span>
            </div>
            <UserMenu />
          </div>
        </header>
      )}

      {!isOnline && !isLoginPage && (
        <div
          className="offline-indicator"
          style={{ top: isLoginPage ? 0 : 48 }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 2l20 20M8.5 16.429a5 5 0 0 1 7 0" />
            <path d="M12 20h.01" />
          </svg>
          Você está offline
        </div>
      )}

      <main className={`main ${!isLoginPage ? "pt-14" : ""}`}>{children}</main>

      {!isLoginPage && (
        <nav className="bottom-nav">
          <Link
            to="/songs"
            className="bottom-nav__item"
            activeProps={{
              className: "bottom-nav__item bottom-nav__item--active",
            }}
          >
            <IconMusic size={24} />
            <span>Músicas</span>
          </Link>
          <Link
            to="/settings"
            className="bottom-nav__item"
            activeProps={{
              className: "bottom-nav__item bottom-nav__item--active",
            }}
          >
            <IconSettings size={24} />
            <span>Config</span>
          </Link>
        </nav>
      )}

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
      <h1 className="header__title">{title}</h1>
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
