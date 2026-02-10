// Health API facade — wraps SDK operations for health checks

import { getGraphqlSdk } from "../client";
import type { HealthQuery } from "../generated/sdk";

// ============================================================================
// Queries
// ============================================================================

export async function getHealth(): Promise<HealthQuery["health"]> {
  const sdk = getGraphqlSdk({ requireAuth: false });
  const result = await sdk.Health();
  return result.health;
}
