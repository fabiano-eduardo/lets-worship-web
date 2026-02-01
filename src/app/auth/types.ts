// Authentication context types

import type { User as FirebaseUser } from "firebase/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export interface AuthError {
  code: string;
  message: string;
}

// Map Firebase error codes to user-friendly messages
export function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Email inválido.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/email-already-in-use": "Este email já está em uso.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/operation-not-allowed": "Operação não permitida.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/cancelled-popup-request": "Login cancelado.",
    "auth/popup-blocked": "Popup bloqueado pelo navegador.",
    "auth/network-request-failed": "Erro de rede. Verifique sua conexão.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/invalid-credential": "Credenciais inválidas.",
  };

  return errorMessages[errorCode] || "Erro ao autenticar. Tente novamente.";
}
