// Login route (public only - redirects if authenticated)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { redirectIfAuthenticated } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  beforeLoad: ({ context, search }) => {
    // Redirect authenticated users to the redirect param or songs
    redirectIfAuthenticated(context.auth, search.redirect || "/songs");
  },
  component: LoginPage,
});
