// Authentication Provider using Firebase Auth

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/shared/firebase";
import type { AuthContextValue, AuthUser } from "./types";

// Create context with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Google provider for OAuth
const googleProvider = new GoogleAuthProvider();

// Detect if running on mobile
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

// Convert Firebase user to our AuthUser type
function toAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Handle auth state changes
  useEffect(() => {
    // If Firebase is not configured, mark as ready with no user
    if (!isFirebaseConfigured() || !auth) {
      console.warn("Firebase not configured. Auth disabled.");
      setIsAuthReady(true);
      return;
    }

    // Check for redirect result (Google sign-in on mobile)
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect result error:", error);
    });

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setUser(fbUser ? toAuthUser(fbUser) : null);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error("Firebase not configured");
      await signInWithEmailAndPassword(auth, email, password);
    },
    [],
  );

  // Sign up with email and password
  const signUpWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error("Firebase not configured");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    [],
  );

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase not configured");

    // Use redirect on mobile, popup on desktop
    if (isMobileDevice()) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!auth) throw new Error("Firebase not configured");
    await firebaseSignOut(auth);
  }, []);

  // Get current ID token (always fresh from SDK)
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  }, [firebaseUser]);

  const value: AuthContextValue = {
    user,
    firebaseUser,
    isAuthReady,
    isAuthenticated: !!user,
    signInWithEmailPassword,
    signInWithGoogle,
    signUpWithEmailPassword,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to get current user (throws if not authenticated)
export function useRequireAuth(): AuthContextValue & { user: AuthUser } {
  const auth = useAuth();
  if (!auth.user) {
    throw new Error("User must be authenticated");
  }
  return auth as AuthContextValue & { user: AuthUser };
}
