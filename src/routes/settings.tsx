// Settings page route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: SettingsPage,
});
