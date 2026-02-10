export {
  graphqlFetch,
  query,
  mutate,
  publicQuery,
  isOnline,
  AuthenticationError,
  GraphQLClientError,
} from "./graphqlClient";
export type {
  GraphQLError,
  GraphQLResponse,
  GraphQLTraceInfo,
} from "./graphqlClient";

export { useNetworkStatus } from "./networkStatus";
export type { NetworkStatus } from "./networkStatus";
