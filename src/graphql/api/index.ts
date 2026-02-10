// API facade barrel — re-exports all domain APIs

export {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  type SongFromList,
  type SongDetail,
} from "./songsApi";

export {
  listSongVersions,
  getSongVersion,
  createSongVersion,
  updateSongVersion,
  deleteSongVersion,
  type VersionListItem,
  type VersionDetail,
} from "./versionsApi";

export { getMePreferences, updateMePreferences } from "./preferencesApi";

export { getHealth } from "./healthApi";
