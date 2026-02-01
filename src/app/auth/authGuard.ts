// Auth guard utilities for route protection

import { redirect } from "@tanstack/react-router";
import type { AuthUser } from "./types";

export interface RouterAuthContext {
  user: AuthUser | null;
  isAuthReady: boolean;
}

// Check if route requires authentication and redirect if not authenticated
export function requireAuth(
  context: RouterAuthContext,
  currentPath: string,
): void {
  // Wait for auth to be ready
  if (!context.isAuthReady) {
    return; // Will be handled by loading state
  }

  // If not authenticated, redirect to login
  if (!context.user) {
    throw redirect({
      to: "/login",
      search: {
        redirect: currentPath,
      },
    });
  }
}

// Redirect authenticated users away from public-only routes (like login)
export function redirectIfAuthenticated(
  context: RouterAuthContext,
  fallbackPath: string = "/songs",
): void {
  // Wait for auth to be ready
  if (!context.isAuthReady) {
    return;
  }

  // If authenticated, redirect away from login
  if (context.user) {
    throw redirect({
      to: fallbackPath,
    });
  }
}
