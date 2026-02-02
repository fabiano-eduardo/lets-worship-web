#!/usr/bin/env node
/**
 * Backend Diagnostic Tool for Let's Worship
 *
 * Runs a comprehensive battery of tests to diagnose backend connectivity issues.
 *
 * Usage:
 *   npx tsx scripts/diagnose-backend.ts
 *
 * Environment variables:
 *   VITE_GRAPHQL_URL - GraphQL endpoint
 *   CODEGEN_AUTH_TOKEN - Firebase ID token (optional, for auth tests)
 */

import * as dotenv from "dotenv";

// Load .env file
dotenv.config();

const GRAPHQL_URL =
  process.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql";
const AUTH_TOKEN = process.env.CODEGEN_AUTH_TOKEN;

// ============================================================================
// Types
// ============================================================================

interface TestResult {
  name: string;
  status: "OK" | "FAIL" | "SKIP" | "WARN";
  duration: number;
  error?: string;
  details?: string;
  fix?: string;
}

interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

// ============================================================================
// Utilities
// ============================================================================

async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<{ response?: Response; json?: GraphQLResponse<T>; error?: Error }> {
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    return { response, json };
  } catch (error) {
    return { error: error as Error };
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function printResult(result: TestResult) {
  const statusIcon = {
    OK: "✅",
    FAIL: "❌",
    SKIP: "⏭️",
    WARN: "⚠️",
  }[result.status];

  console.log(
    `\n${statusIcon} ${result.name} [${formatDuration(result.duration)}]`,
  );

  if (result.details) {
    console.log(`   ${result.details}`);
  }

  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }

  if (result.fix) {
    console.log(`   Fix: ${result.fix}`);
  }
}

// ============================================================================
// Tests
// ============================================================================

async function testNetworkConnectivity(): Promise<TestResult> {
  const start = Date.now();
  const name = "Network Connectivity";

  try {
    // Try a simple OPTIONS request first
    const response = await fetch(GRAPHQL_URL, {
      method: "OPTIONS",
    });

    return {
      name,
      status: response.ok || response.status === 204 ? "OK" : "WARN",
      duration: Date.now() - start,
      details: `Server responded with HTTP ${response.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    let fix = "";
    if (message.includes("ECONNREFUSED")) {
      fix = `Start the backend server. The server should be running at ${GRAPHQL_URL}`;
    } else if (message.includes("ENOTFOUND")) {
      fix = `Check VITE_GRAPHQL_URL - hostname not found: ${GRAPHQL_URL}`;
    } else if (message.includes("fetch")) {
      fix = "Network error - check if backend is running and accessible";
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: message,
      fix,
    };
  }
}

async function testHealthEndpoint(): Promise<TestResult> {
  const start = Date.now();
  const name = "Health Check (without auth)";

  const query = `query { health { status timestamp } }`;
  const { response, json, error } = await fetchGraphQL(query);

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
      fix: "Check if backend is running and GraphQL endpoint is correct",
    };
  }

  if (!response?.ok) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: `HTTP ${response?.status}: ${response?.statusText}`,
      fix:
        response?.status === 404
          ? "Check VITE_GRAPHQL_URL path"
          : "Check backend server logs",
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];
    const isAuthError =
      gqlError.extensions?.code === "UNAUTHENTICATED" ||
      gqlError.extensions?.code === "INVALID_AUTH";

    if (isAuthError) {
      return {
        name,
        status: "WARN",
        duration: Date.now() - start,
        details: "Health endpoint requires authentication",
        fix: "Backend should allow health check without auth for monitoring",
      };
    }

    // Check if health query doesn't exist
    if (gqlError.message.includes("Cannot query field")) {
      return {
        name,
        status: "WARN",
        duration: Date.now() - start,
        details: "Health query not implemented in backend",
        fix: "Add 'health' query to backend schema for monitoring",
      };
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: gqlError.message,
    };
  }

  if (json?.data) {
    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details: `Health: ${JSON.stringify(json.data)}`,
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "No data returned",
  };
}

async function testIntrospection(withAuth: boolean): Promise<TestResult> {
  const start = Date.now();
  const name = withAuth
    ? "Schema Introspection (with auth)"
    : "Schema Introspection (without auth)";

  if (withAuth && !AUTH_TOKEN) {
    return {
      name,
      status: "SKIP",
      duration: 0,
      details: "No CODEGEN_AUTH_TOKEN provided",
    };
  }

  const query = `query { __schema { queryType { name } mutationType { name } } }`;
  const headers = withAuth
    ? { Authorization: `Bearer ${AUTH_TOKEN}` }
    : undefined;

  const { response, json, error } = await fetchGraphQL(
    query,
    undefined,
    headers,
  );

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
    };
  }

  if (!response?.ok) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: `HTTP ${response?.status}`,
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];
    const isAuthError =
      gqlError.extensions?.code === "UNAUTHENTICATED" ||
      gqlError.extensions?.code === "INVALID_AUTH";

    if (isAuthError && !withAuth) {
      return {
        name,
        status: "WARN",
        duration: Date.now() - start,
        details: "Introspection requires authentication",
        fix: "Either allow introspection without auth in dev, or provide CODEGEN_AUTH_TOKEN",
      };
    }

    if (isAuthError && withAuth) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "Token rejected",
        fix: "Token may be expired. Get a fresh token from the browser console",
      };
    }

    // Check if introspection is disabled
    if (gqlError.message.includes("introspection")) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "Introspection disabled",
        fix: "Enable introspection in backend for dev environment, or download schema manually",
      };
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: gqlError.message,
    };
  }

  interface SchemaData {
    __schema?: {
      queryType?: { name: string };
      mutationType?: { name: string };
    };
  }

  const data = json?.data as SchemaData | undefined;
  if (data?.__schema) {
    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details: `Query: ${data.__schema.queryType?.name || "none"}, Mutation: ${data.__schema.mutationType?.name || "none"}`,
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "No schema returned",
  };
}

async function testMeQuery(): Promise<TestResult> {
  const start = Date.now();
  const name = "Me Query (authenticated user)";

  if (!AUTH_TOKEN) {
    return {
      name,
      status: "SKIP",
      duration: 0,
      details: "No CODEGEN_AUTH_TOKEN provided",
    };
  }

  const query = `query { me { id email displayName } }`;
  const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

  const { response, json, error } = await fetchGraphQL(
    query,
    undefined,
    headers,
  );

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];

    if (gqlError.message.includes("Cannot query field")) {
      return {
        name,
        status: "WARN",
        duration: Date.now() - start,
        details: "'me' query not implemented",
        fix: "Add 'me' query to backend for user info",
      };
    }

    const isAuthError =
      gqlError.extensions?.code === "UNAUTHENTICATED" ||
      gqlError.extensions?.code === "INVALID_AUTH";

    if (isAuthError) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "Authentication failed",
        fix: "Token may be expired or invalid. Get a fresh token",
      };
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: gqlError.message,
    };
  }

  interface MeData {
    me?: {
      id?: string;
      email?: string;
      displayName?: string;
    };
  }

  const data = json?.data as MeData | undefined;
  if (data?.me) {
    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details: `User: ${data.me.email || data.me.id}`,
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "No user data returned",
  };
}

async function testSongsQuery(): Promise<TestResult> {
  const start = Date.now();
  const name = "Songs Query (authenticated)";

  if (!AUTH_TOKEN) {
    return {
      name,
      status: "SKIP",
      duration: 0,
      details: "No CODEGEN_AUTH_TOKEN provided",
    };
  }

  const query = `query { songs { id title artist } }`;
  const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

  const { response, json, error } = await fetchGraphQL(
    query,
    undefined,
    headers,
  );

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];

    if (gqlError.message.includes("Cannot query field")) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "'songs' query not found in schema",
        fix: "Check if backend implements 'songs' query",
      };
    }

    const isAuthError =
      gqlError.extensions?.code === "UNAUTHENTICATED" ||
      gqlError.extensions?.code === "INVALID_AUTH";

    if (isAuthError) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "Authentication failed",
        fix: "Token may be expired. Get a fresh token from browser",
      };
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: gqlError.message,
    };
  }

  interface SongsData {
    songs?: Array<{ id: string; title: string }>;
  }

  const data = json?.data as SongsData | undefined;
  if (data?.songs) {
    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details: `Found ${data.songs.length} songs`,
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "No songs data returned",
  };
}

async function testSyncPull(): Promise<TestResult> {
  const start = Date.now();
  const name = "SyncPull Query (sync operations)";

  if (!AUTH_TOKEN) {
    return {
      name,
      status: "SKIP",
      duration: 0,
      details: "No CODEGEN_AUTH_TOKEN provided",
    };
  }

  const query = `
    query SyncPull($input: SyncPullInput!) {
      syncPull(input: $input) {
        changes { entityType entityId op }
        nextCursor
        hasMore
        serverTime
      }
    }
  `;
  const variables = {
    input: {
      cursor: null,
      limit: 10,
      includeEntities: false,
    },
  };
  const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

  const { response, json, error } = await fetchGraphQL(
    query,
    variables,
    headers,
  );

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];

    if (gqlError.message.includes("Cannot query field")) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: "'syncPull' query not found",
        fix: "Backend must implement sync operations for offline support",
      };
    }

    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: gqlError.message,
    };
  }

  interface SyncPullData {
    syncPull?: {
      changes: unknown[];
      hasMore: boolean;
      serverTime: string;
    };
  }

  const data = json?.data as SyncPullData | undefined;
  if (data?.syncPull) {
    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details: `Changes: ${data.syncPull.changes.length}, Server time: ${data.syncPull.serverTime}`,
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "No sync data returned",
  };
}

async function testUnauthenticatedRejection(): Promise<TestResult> {
  const start = Date.now();
  const name = "Auth Rejection (songs without token)";

  const query = `query { songs { id title } }`;
  const { json, error } = await fetchGraphQL(query);

  if (error) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: error.message,
    };
  }

  if (json?.errors) {
    const gqlError = json.errors[0];
    const isAuthError =
      gqlError.extensions?.code === "UNAUTHENTICATED" ||
      gqlError.extensions?.code === "INVALID_AUTH" ||
      gqlError.message.toLowerCase().includes("unauthorized") ||
      gqlError.message.toLowerCase().includes("unauthenticated");

    if (isAuthError) {
      return {
        name,
        status: "OK",
        duration: Date.now() - start,
        details: "Correctly rejected with auth error",
      };
    }

    // Check if query doesn't exist
    if (gqlError.message.includes("Cannot query field")) {
      return {
        name,
        status: "SKIP",
        duration: Date.now() - start,
        details: "'songs' query not implemented",
      };
    }

    return {
      name,
      status: "WARN",
      duration: Date.now() - start,
      details: `Got error but not auth-related: ${gqlError.message}`,
    };
  }

  if (json?.data) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: "Query succeeded without authentication!",
      fix: "Backend should require authentication for 'songs' query",
    };
  }

  return {
    name,
    status: "FAIL",
    duration: Date.now() - start,
    error: "Unexpected response",
  };
}

async function testCORS(): Promise<TestResult> {
  const start = Date.now();
  const name = "CORS Headers Check";

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
    const allowMethods = response.headers.get("Access-Control-Allow-Methods");
    const allowHeaders = response.headers.get("Access-Control-Allow-Headers");

    if (!allowOrigin) {
      return {
        name,
        status: "WARN",
        duration: Date.now() - start,
        details: "No Access-Control-Allow-Origin header",
        fix: "Backend should set CORS headers. Add localhost:5173 to allowed origins",
      };
    }

    const details = [
      `Allow-Origin: ${allowOrigin}`,
      allowMethods ? `Allow-Methods: ${allowMethods}` : null,
      allowHeaders ? `Allow-Headers: ${allowHeaders}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      name,
      status: "OK",
      duration: Date.now() - start,
      details,
    };
  } catch (error) {
    return {
      name,
      status: "WARN",
      duration: Date.now() - start,
      error: "Could not check CORS (network error)",
      details: "CORS check requires browser or may fail in Node",
    };
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║       Let's Worship - Backend Diagnostic Report               ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );
  console.log();
  console.log(`📍 GraphQL URL: ${GRAPHQL_URL}`);
  console.log(`🔐 Auth Token:  ${AUTH_TOKEN ? "Provided" : "Not provided"}`);
  console.log(`⏰ Timestamp:   ${new Date().toISOString()}`);

  const results: TestResult[] = [];

  // Run all tests
  console.log("\n" + "─".repeat(65));
  console.log("Running diagnostic tests...");
  console.log("─".repeat(65));

  results.push(await testNetworkConnectivity());
  printResult(results[results.length - 1]);

  results.push(await testCORS());
  printResult(results[results.length - 1]);

  results.push(await testHealthEndpoint());
  printResult(results[results.length - 1]);

  results.push(await testIntrospection(false));
  printResult(results[results.length - 1]);

  results.push(await testIntrospection(true));
  printResult(results[results.length - 1]);

  results.push(await testUnauthenticatedRejection());
  printResult(results[results.length - 1]);

  results.push(await testMeQuery());
  printResult(results[results.length - 1]);

  results.push(await testSongsQuery());
  printResult(results[results.length - 1]);

  results.push(await testSyncPull());
  printResult(results[results.length - 1]);

  // Summary
  console.log("\n" + "═".repeat(65));
  console.log("SUMMARY");
  console.log("═".repeat(65));

  const passed = results.filter((r) => r.status === "OK").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warned = results.filter((r) => r.status === "WARN").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;

  console.log(`\n✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`⏭️  Skipped: ${skipped}`);

  // Action items
  const failures = results.filter((r) => r.status === "FAIL" && r.fix);
  const warnings = results.filter((r) => r.status === "WARN" && r.fix);

  if (failures.length > 0 || warnings.length > 0) {
    console.log("\n" + "─".repeat(65));
    console.log("ACTION ITEMS");
    console.log("─".repeat(65));

    if (failures.length > 0) {
      console.log("\n🔴 Must Fix:");
      for (const result of failures) {
        console.log(`   • ${result.name}: ${result.fix}`);
      }
    }

    if (warnings.length > 0) {
      console.log("\n🟡 Should Fix:");
      for (const result of warnings) {
        console.log(`   • ${result.name}: ${result.fix}`);
      }
    }
  }

  // Get token instructions
  if (!AUTH_TOKEN) {
    console.log("\n" + "─".repeat(65));
    console.log("HOW TO GET AUTH TOKEN");
    console.log("─".repeat(65));
    console.log(`
1. Open the app in browser: http://localhost:5173
2. Login with your account
3. Open DevTools console (F12)
4. Run this command:
   await (await import('firebase/auth')).getAuth().currentUser.getIdToken()
5. Copy the token and run:
   export CODEGEN_AUTH_TOKEN="<paste-token-here>"
6. Run this diagnostic again
`);
  }

  console.log("\n" + "═".repeat(65));

  // Exit with error if any failures
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
