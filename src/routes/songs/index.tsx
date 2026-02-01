// Songs list route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import { SongsListPage } from "@/features/songs/pages/SongsListPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: SongsListPage,
});
