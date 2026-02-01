// Song detail route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../../__root";
import { SongDetailPage } from "@/features/songs/pages/SongDetailPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs/$songId",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: SongDetailPage,
});
