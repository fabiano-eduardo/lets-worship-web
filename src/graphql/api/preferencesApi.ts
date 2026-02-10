// Preferences API facade — wraps SDK operations for user preferences

import { getGraphqlSdk } from "../client";
import type {
  MePreferencesQuery,
  UpdateMePreferencesMutation,
  UpdateUserPreferencesInput,
} from "../generated/sdk";

// ============================================================================
// Queries
// ============================================================================

export async function getMePreferences(): Promise<
  MePreferencesQuery["mePreferences"]
> {
  const sdk = getGraphqlSdk();
  const result = await sdk.MePreferences();
  return result.mePreferences;
}

// ============================================================================
// Mutations
// ============================================================================

export async function updateMePreferences(
  patch: UpdateUserPreferencesInput,
): Promise<UpdateMePreferencesMutation["updateMePreferences"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.UpdateMePreferences({ patch });
  return result.updateMePreferences;
}
