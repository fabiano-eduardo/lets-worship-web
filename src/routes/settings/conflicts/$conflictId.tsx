// Conflict resolution route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../../__root";
import { ConflictResolutionPage } from "@/features/sync/pages/ConflictResolutionPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/conflicts/$conflictId",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: ConflictResolutionPage,
});
