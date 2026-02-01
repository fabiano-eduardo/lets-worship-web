// TanStack Router configuration with auth context

import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { RouterAuthContext } from "./auth";

// Router context type
export interface RouterContext {
  auth: RouterAuthContext;
}

// Create router with auth context
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  context: {
    auth: undefined!,
  } as RouterContext,
});

// Type safety for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
