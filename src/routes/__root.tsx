// Root route - layout wrapper with auth context

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout } from "@/shared/ui/Layout";
import type { RouterAuthContext } from "@/app/auth";

interface RouterContext {
  auth: RouterAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
