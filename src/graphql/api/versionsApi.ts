// Versions API facade — wraps SDK operations for the versions domain

import { getGraphqlSdk } from "../client";
import type {
  SongVersionsQuery,
  SongVersionQuery,
  CreateSongVersionMutation,
  UpdateSongVersionMutation,
  DeleteSongVersionMutation,
  CreateSongVersionInput,
  UpdateSongVersionInput,
} from "../generated/sdk";

// ============================================================================
// Types re-exported for consumers
// ============================================================================

export type VersionListItem = SongVersionsQuery["songVersions"][number];
export type VersionDetail = NonNullable<SongVersionQuery["songVersion"]>;

// ============================================================================
// Queries
// ============================================================================

export async function listSongVersions(
  songId: string,
): Promise<SongVersionsQuery["songVersions"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.SongVersions({ songId });
  return result.songVersions;
}

export async function getSongVersion(
  id: string,
): Promise<SongVersionQuery["songVersion"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.SongVersion({ id });
  return result.songVersion;
}

// ============================================================================
// Mutations
// ============================================================================

export async function createSongVersion(
  input: CreateSongVersionInput,
): Promise<CreateSongVersionMutation["createSongVersion"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.CreateSongVersion({ input });
  return result.createSongVersion;
}

export async function updateSongVersion(
  id: string,
  input: UpdateSongVersionInput,
): Promise<UpdateSongVersionMutation["updateSongVersion"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.UpdateSongVersion({ id, input });
  return result.updateSongVersion;
}

export async function deleteSongVersion(
  id: string,
): Promise<DeleteSongVersionMutation["deleteSongVersion"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.DeleteSongVersion({ id });
  return result.deleteSongVersion;
}
