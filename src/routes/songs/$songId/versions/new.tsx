// New version route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../../../__root";
import { NewVersionPage } from "@/features/versions/pages/NewVersionPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs/$songId/versions/new",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: NewVersionPage,
});
