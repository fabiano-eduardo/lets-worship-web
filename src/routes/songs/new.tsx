// New song route (protected)

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import { NewSongPage } from "@/features/songs/pages/NewSongPage";
import { requireAuth } from "@/app/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs/new",
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
  component: NewSongPage,
});
