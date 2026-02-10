// Offline module re-exports

export {
  offlineDb,
  type OfflineMetaEntry,
  type OfflineSong,
  type OfflineVersion,
  type OfflineNote,
} from "./offlineStore";

export {
  downloadVersionOffline,
  updateVersionOffline,
  removeVersionOffline,
  getOfflineVersion,
  getOfflineLibrary,
  isVersionAvailableOffline,
} from "./offlineManager";

export {
  useOfflineLibrary,
  useIsOfflineAvailable,
  useDownloadOffline,
  useUpdateOffline,
  useRemoveOffline,
} from "./hooks";
