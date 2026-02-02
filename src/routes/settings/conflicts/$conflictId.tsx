// Conflict resolution route (protected)

import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Route as rootRoute } from "../../__root";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/conflicts/$conflictId",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: lazyRouteComponent(
    () => import("@/features/sync/pages/ConflictResolutionPage"),
    "ConflictResolutionPage",
  ),
});
