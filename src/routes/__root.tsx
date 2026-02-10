// Root route - layout wrapper with auth context

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout } from "@/shared/ui/Layout";
import type { RouterAuthContext } from "@/app/auth";
import { useViewStore } from "@/features/versions/pages/view-mode";

interface RouterContext {
  auth: RouterAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { viewMode } = useViewStore();

  if (viewMode === "performance") {
    return <Outlet />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
