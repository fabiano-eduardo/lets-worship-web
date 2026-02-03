// GraphQL client with authentication

import { auth } from "@/shared/firebase";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLTraceInfo {
  status: number;
  durationMs: number;
  ok: boolean;
  error?: string;
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class GraphQLClientError extends Error {
  public errors: GraphQLError[];

  constructor(errors: GraphQLError[]) {
    super(errors[0]?.message || "GraphQL error");
    this.name = "GraphQLClientError";
    this.errors = errors;
  }

  hasAuthError(): boolean {
    return this.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.extensions?.code === "INVALID_AUTH" ||
        e.message.toLowerCase().includes("unauthorized") ||
        e.message.toLowerCase().includes("unauthenticated"),
    );
  }
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Get fresh ID token from Firebase Auth
async function getIdToken(): Promise<string> {
  const currentUser = auth?.currentUser;

  if (!currentUser) {
    throw new AuthenticationError("User not authenticated");
  }

  try {
    // Force refresh to ensure we have a valid token
    const token = await currentUser.getIdToken(true);

    // Validate token format (Firebase tokens are JWTs with 3 parts)
    if (!token || token.split(".").length !== 3) {
      console.error("[GraphQL] Invalid token format received from Firebase");
      throw new AuthenticationError("Invalid token format");
    }

    return token;
  } catch (error) {
    console.error("[GraphQL] Error getting ID token:", error);
    throw new AuthenticationError("Failed to get authentication token");
  }
}

// Execute GraphQL query/mutation
export async function graphqlFetch<T = unknown, V = Record<string, unknown>>(
  query: string,
  variables?: V,
  options: {
    requireAuth?: boolean;
    headers?: HeadersInit;
    trace?: (info: GraphQLTraceInfo) => void;
  } = {},
): Promise<T> {
  const { requireAuth = true, headers: extraHeaders, trace } = options;
  const requestStart = performance.now();

  // Check network status
  if (!isOnline()) {
    throw new Error("Network unavailable - working offline");
  }

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if required
  if (requireAuth) {
    const token = await getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  // Make request
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - requestStart);
    trace?.({
      status: 0,
      durationMs,
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    });
    throw error;
  }

  const durationMs = Math.round(performance.now() - requestStart);
  trace?.({
    status: response.status,
    durationMs,
    ok: response.ok,
  });

  // Parse response
  const result: GraphQLResponse<T> = await response.json();

  // Handle errors
  if (result.errors && result.errors.length > 0) {
    throw new GraphQLClientError(result.errors);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL");
  }

  return result.data;
}

// Query helper with simpler API
export async function query<T = unknown>(
  gql: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return graphqlFetch<T>(gql, variables);
}

// Mutation helper with simpler API
export async function mutate<T = unknown>(
  gql: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return graphqlFetch<T>(gql, variables);
}

// Public query (no auth required)
export async function publicQuery<T = unknown>(
  gql: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return graphqlFetch<T>(gql, variables, { requireAuth: false });
}
