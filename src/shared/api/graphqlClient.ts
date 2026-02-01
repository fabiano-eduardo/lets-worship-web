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

  // Always get fresh token from SDK (handles refresh automatically)
  return currentUser.getIdToken();
}

// Execute GraphQL query/mutation
export async function graphqlFetch<T = unknown, V = Record<string, unknown>>(
  query: string,
  variables?: V,
  options: {
    requireAuth?: boolean;
  } = {},
): Promise<T> {
  const { requireAuth = true } = options;

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

  // Make request
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
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
