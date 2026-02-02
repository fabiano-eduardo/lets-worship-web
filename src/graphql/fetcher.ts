// Typed GraphQL fetcher for use with generated TypedDocumentNode
// This integrates with the codegen output and TanStack Query

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { auth } from "@/shared/firebase";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";

// ============================================================================
// Types
// ============================================================================

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export type GraphQLErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_AUTH"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "OFFLINE";

// ============================================================================
// Errors
// ============================================================================

export class GraphQLClientError extends Error {
  public readonly errors: GraphQLError[];
  public readonly code: GraphQLErrorCode;

  constructor(errors: GraphQLError[]) {
    const primaryError = errors[0];
    super(primaryError?.message || "GraphQL error");
    this.name = "GraphQLClientError";
    this.errors = errors;
    this.code = this.extractCode(primaryError);
  }

  private extractCode(error?: GraphQLError): GraphQLErrorCode {
    const code = error?.extensions?.code;
    if (code === "UNAUTHENTICATED" || code === "INVALID_AUTH") {
      return code;
    }
    if (code === "FORBIDDEN") return "FORBIDDEN";
    if (code === "NOT_FOUND") return "NOT_FOUND";
    if (code === "BAD_USER_INPUT" || code === "VALIDATION_ERROR") {
      return "VALIDATION_ERROR";
    }
    return "INTERNAL_ERROR";
  }

  isAuthError(): boolean {
    return this.code === "UNAUTHENTICATED" || this.code === "INVALID_AUTH";
  }
}

export class NetworkError extends Error {
  public readonly code: GraphQLErrorCode = "NETWORK_ERROR";
  public readonly isOffline: boolean;

  constructor(message: string, isOffline = false) {
    super(message);
    this.name = "NetworkError";
    this.isOffline = isOffline;
    if (isOffline) {
      (this as { code: GraphQLErrorCode }).code = "OFFLINE";
    }
  }
}

// ============================================================================
// Auth Token
// ============================================================================

async function getIdToken(): Promise<string | null> {
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    return null;
  }
  return currentUser.getIdToken();
}

// ============================================================================
// Fetcher
// ============================================================================

export interface FetcherOptions {
  /**
   * Whether authentication is required for this request.
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Additional headers to include in the request.
   */
  headers?: Record<string, string>;

  /**
   * AbortSignal for cancellation.
   */
  signal?: AbortSignal;
}

/**
 * Execute a typed GraphQL document.
 *
 * @example
 * ```ts
 * import { SongsDocument } from '@/graphql/generated/graphql';
 *
 * const data = await executeGraphQL(SongsDocument);
 * // data is fully typed as SongsQuery
 * ```
 */
export async function executeGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  options?: FetcherOptions,
): Promise<TResult> {
  const { requireAuth = true, headers: extraHeaders, signal } = options ?? {};

  // Check network status
  if (!navigator.onLine) {
    throw new NetworkError("No network connection", true);
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = await getIdToken();
    if (!token) {
      throw new GraphQLClientError([
        {
          message: "Authentication required",
          extensions: { code: "UNAUTHENTICATED" },
        },
      ]);
    }
    headers["Authorization"] = `Bearer ================ ${token}`;
  }

  // Extract query string from document
  // TypedDocumentNode has a `loc` property with the source
  const query = (
    document as unknown as { loc?: { source?: { body?: string } } }
  ).loc?.source?.body;

  if (!query) {
    throw new Error("Invalid document: no query string found");
  }

  // Make request
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: variables ?? undefined,
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network error";
    throw new NetworkError(message);
  }

  // Parse response
  let result: GraphQLResponse<TResult>;
  try {
    result = await response.json();
  } catch {
    throw new NetworkError(
      `Invalid response: ${response.status} ${response.statusText}`,
    );
  }

  // Handle GraphQL errors
  if (result.errors && result.errors.length > 0) {
    throw new GraphQLClientError(result.errors);
  }

  // Ensure data exists
  if (result.data === undefined || result.data === null) {
    throw new Error("No data returned from GraphQL");
  }

  return result.data;
}

/**
 * Creates a fetcher function for use with TanStack Query.
 *
 * @example
 * ```ts
 * const fetcher = createQueryFetcher(SongsDocument);
 *
 * const { data } = useQuery({
 *   queryKey: ['songs'],
 *   queryFn: fetcher,
 * });
 * ```
 */
export function createQueryFetcher<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  options?: FetcherOptions,
): () => Promise<TResult> {
  return () => executeGraphQL(document, variables, options);
}

/**
 * Creates a mutation function for use with TanStack Query.
 *
 * @example
 * ```ts
 * const mutationFn = createMutationFetcher(CreateSongDocument);
 *
 * const mutation = useMutation({
 *   mutationFn,
 * });
 *
 * mutation.mutate({ input: { title: 'New Song' } });
 * ```
 */
export function createMutationFetcher<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  options?: FetcherOptions,
): (variables: TVariables) => Promise<TResult> {
  return (variables: TVariables) =>
    executeGraphQL(document, variables, options);
}
