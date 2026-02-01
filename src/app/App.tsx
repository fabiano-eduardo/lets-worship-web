// App providers wrapper

import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./queryClient";
import { router } from "./router";
import { ToastProvider } from "@/shared/ui";
import { AuthProvider, useAuth } from "./auth";
import type { RouterAuthContext } from "./auth";
import { IconLoader } from "@/shared/ui/components/Icons";

// Inner component that uses auth context
function InnerApp() {
  const { user, isAuthReady } = useAuth();

  // Build router context
  const authContext: RouterAuthContext = {
    user,
    isAuthReady,
  };

  // Show loading while auth is initializing
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <RouterProvider router={router} context={{ auth: authContext }} />
    </ToastProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
