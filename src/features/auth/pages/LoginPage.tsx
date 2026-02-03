// Login page component - Modern, minimal, mobile-first design

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth, getAuthErrorMessage } from "@/app/auth";
import { FirebaseError } from "firebase/app";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import {
  IconMusic,
  IconMail,
  IconLock,
  IconLoader,
  IconWifiOff,
} from "@/shared/ui/components/Icons";
import { useToast } from "@/shared/ui/components/Toast";

type LoginMode = "signin" | "signup";

interface LoginSearchParams {
  redirect?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as LoginSearchParams;
  const { signInWithEmailPassword, signInWithGoogle, signUpWithEmailPassword } =
    useAuth();
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();

  const [mode, setMode] = useState<LoginMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = (search.redirect as string) || "/songs";

  // Redirect if already authenticated (safety check if beforeLoad didn't catch it)
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirectTo, replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Clear error when switching modes
  useEffect(() => {
    setError(null);
    setConfirmPassword("");
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOnline) {
      setError("Você precisa estar online para fazer login.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmailPassword(email, password);
      } else {
        await signUpWithEmailPassword(email, password);
      }
      // Success - context will update via AuthProvider
      // The useEffect above will handle redirection once isAuthenticated is true
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getAuthErrorMessage(err.code));
      } else {
        setError("Erro ao autenticar. Tente novamente.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);

    if (!isOnline) {
      setError("Você precisa estar online para fazer login.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithGoogle();
      // On desktop (popup), context will update and useEffect will redirect.
      // On mobile (redirect), the whole page will reload later.
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getAuthErrorMessage(err.code));
      } else {
        setError("Erro ao autenticar com Google.");
      }
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast(
      "info",
      "Recurso em breve! Por enquanto, entre em contato com o suporte.",
    );
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  const isFormValid =
    email.trim() !== "" &&
    password.length >= 6 &&
    (mode === "signin" || confirmPassword.length >= 6);

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo section */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <IconMusic />
          </div>
          <h1 className="login-title">Let's Worship</h1>
          <p className="login-subtitle">
            {mode === "signin"
              ? "Para sincronizar seus mapas na nuvem."
              : "Crie sua conta para começar."}
          </p>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Offline notice */}
          {!isOnline && (
            <div className="login-offline-notice">
              <IconWifiOff />
              <span>
                Você está offline. Pode usar seus dados locais, mas não é
                possível fazer login agora.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <div className="login-input-wrapper">
                <IconMail className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="login-label">
                Senha
              </label>
              <div className="login-input-wrapper">
                <IconLock className="login-input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === "signup" && (
              <div>
                <label htmlFor="confirmPassword" className="login-label">
                  Confirmar Senha
                </label>
                <div className="login-input-wrapper">
                  <IconLock className="login-input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Forgot password link (signin only) */}
            {mode === "signin" && (
              <div className="login-forgot">
                <button type="button" onClick={handleForgotPassword}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div id="login-error" className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid || !isOnline}
              className="login-button-primary"
            >
              {isLoading ? (
                <>
                  <IconLoader className="login-spinner" />
                  <span>Aguarde...</span>
                </>
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-text">ou</span>
          </div>

          {/* Google sign in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isOnline}
            className="login-button-google"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </button>

          {/* Mode toggle */}
          <p className="login-mode-toggle">
            {mode === "signin" ? (
              <>
                Não tem uma conta?{" "}
                <button type="button" onClick={toggleMode}>
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button type="button" onClick={toggleMode}>
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="login-footer">Funciona offline após o primeiro acesso</p>
      </div>
    </div>
  );
}

// Google icon component
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
