// Version detail route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../../../__root";
import { VersionDetailPage } from "@/features/versions/pages/VersionDetailPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs/$songId/versions/$versionId",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: VersionDetailPage,
});
