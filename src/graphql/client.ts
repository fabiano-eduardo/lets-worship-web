// Central GraphQL client — single entry point for all SDK operations
// All auth, headers and error handling is centralised here.

import { GraphQLClient, ClientError } from "graphql-request";
import { getSdk, type Sdk } from "./generated/sdk";
import { auth } from "@/shared/firebase";

// ============================================================================
// Configuration
// ============================================================================

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";

// ============================================================================
// Error types
// ============================================================================

export type GraphQLErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_AUTH"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "OFFLINE";

export interface NormalizedGraphQLError {
  message: string;
  code?: GraphQLErrorCode;
  path?: ReadonlyArray<string | number>;
  status?: number;
}

export class GraphQLRequestError extends Error {
  public readonly code: GraphQLErrorCode;
  public readonly path?: ReadonlyArray<string | number>;
  public readonly status?: number;

  constructor(info: NormalizedGraphQLError) {
    super(info.message);
    this.name = "GraphQLRequestError";
    this.code = info.code ?? "INTERNAL_ERROR";
    this.path = info.path;
    this.status = info.status;
  }

  isAuthError(): boolean {
    return this.code === "UNAUTHENTICATED" || this.code === "INVALID_AUTH";
  }
}

// ============================================================================
// Error normalisation
// ============================================================================

function resolveCode(raw?: string, httpStatus?: number): GraphQLErrorCode {
  if (raw === "UNAUTHENTICATED" || raw === "INVALID_AUTH") {
    return raw;
  }
  if (httpStatus === 401) return "UNAUTHENTICATED";
  if (raw === "FORBIDDEN" || httpStatus === 403) return "FORBIDDEN";
  if (raw === "NOT_FOUND") return "NOT_FOUND";
  if (raw === "BAD_USER_INPUT" || raw === "VALIDATION_ERROR") {
    return "VALIDATION_ERROR";
  }
  return "INTERNAL_ERROR";
}

function normalizeError(error: unknown): GraphQLRequestError {
  // Offline
  if (!navigator.onLine) {
    return new GraphQLRequestError({
      message: "No network connection",
      code: "OFFLINE",
    });
  }

  // graphql-request ClientError
  if (error instanceof ClientError) {
    const gqlError = error.response.errors?.[0];
    const httpStatus = error.response.status;
    const rawCode = gqlError?.extensions?.["code"] as string | undefined;

    return new GraphQLRequestError({
      message: gqlError?.message ?? error.message,
      code: resolveCode(rawCode, httpStatus),
      path: gqlError?.path as ReadonlyArray<string | number> | undefined,
      status: httpStatus,
    });
  }

  // Generic network / fetch errors
  if (error instanceof Error) {
    if (error.name === "AbortError") throw error; // re-throw abort as-is
    return new GraphQLRequestError({
      message: error.message,
      code: "NETWORK_ERROR",
    });
  }

  return new GraphQLRequestError({
    message: "Unknown GraphQL error",
    code: "INTERNAL_ERROR",
  });
}

// ============================================================================
// Auth helper
// ============================================================================

async function getIdToken(): Promise<string | null> {
  const currentUser = auth?.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

// ============================================================================
// SDK factory
// ============================================================================

export interface SdkOptions {
  /** Skip the Firebase auth header (e.g. health check). @default false */
  requireAuth?: boolean;
}

/**
 * Returns a fully-typed SDK instance backed by `graphql-request`.
 *
 * Every call goes through a wrapper that:
 * 1. Attaches the Firebase ID-token `Authorization` header (unless `requireAuth: false`).
 * 2. Normalises any error into a single `GraphQLRequestError`.
 *
 * @example
 * ```ts
 * const sdk = getGraphqlSdk();
 * const { songs } = await sdk.Songs({ search: "amazing" });
 * ```
 */
export function getGraphqlSdk(options?: SdkOptions): Sdk {
  const requireAuth = options?.requireAuth ?? true;

  const client = new GraphQLClient(GRAPHQL_URL);

  return getSdk(client, async (action) => {
    // Inject auth header per-request
    const headers: Record<string, string> = {};

    if (requireAuth) {
      const token = await getIdToken();
      if (!token) {
        throw new GraphQLRequestError({
          message: "Authentication required",
          code: "UNAUTHENTICATED",
        });
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      return await action(headers);
    } catch (error) {
      throw normalizeError(error);
    }
  });
}
