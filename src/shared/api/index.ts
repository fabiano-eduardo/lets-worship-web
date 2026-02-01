export {
  graphqlFetch,
  query,
  mutate,
  publicQuery,
  isOnline,
  AuthenticationError,
  GraphQLClientError,
} from "./graphqlClient";
export type { GraphQLError, GraphQLResponse } from "./graphqlClient";

export { useNetworkStatus, useSyncManager } from "./networkStatus";
export type { NetworkStatus, SyncStatus, SyncState } from "./networkStatus";
