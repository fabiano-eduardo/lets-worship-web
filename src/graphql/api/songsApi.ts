// Songs API facade — wraps SDK operations for the songs domain

import { getGraphqlSdk } from "../client";
import type {
  SongsQuery,
  SongQuery,
  CreateSongMutation,
  UpdateSongMutation,
  DeleteSongMutation,
} from "../generated/sdk";

// ============================================================================
// Types re-exported for consumers
// ============================================================================

export type SongFromList = NonNullable<SongsQuery["songs"]["songs"]>[number];
export type SongDetail = NonNullable<SongQuery["song"]>;

// ============================================================================
// Queries
// ============================================================================

export async function listSongs(params?: {
  search?: string;
  cursor?: string;
  limit?: number;
}): Promise<SongsQuery["songs"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.Songs({
    search: params?.search,
    cursor: params?.cursor,
    limit: params?.limit,
  });

  console.log({ result });
  return result.songs;
}

export async function getSong(id: string): Promise<SongQuery["song"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.Song({ id });
  return result.song;
}

// ============================================================================
// Mutations
// ============================================================================

export async function createSong(input: {
  title: string;
  artist?: string | null;
}): Promise<CreateSongMutation["createSong"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.CreateSong({ input });
  return result.createSong;
}

export async function updateSong(
  id: string,
  input: {
    title?: string;
    artist?: string | null;
    defaultVersionId?: string | null;
  },
): Promise<UpdateSongMutation["updateSong"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.UpdateSong({ id, input });
  return result.updateSong;
}

export async function deleteSong(
  id: string,
): Promise<DeleteSongMutation["deleteSong"]> {
  const sdk = getGraphqlSdk();
  const result = await sdk.DeleteSong({ id });
  return result.deleteSong;
}
