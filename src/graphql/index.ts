// GraphQL module exports

// Central client
export {
  getGraphqlSdk,
  GraphQLRequestError,
  type GraphQLErrorCode,
  type NormalizedGraphQLError,
  type SdkOptions,
} from "./client";

// Domain API facades
export {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  listSongVersions,
  getSongVersion,
  createSongVersion,
  updateSongVersion,
  deleteSongVersion,
  getMePreferences,
  updateMePreferences,
  getHealth,
} from "./api";
