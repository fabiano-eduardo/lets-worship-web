#!/usr/bin/env node
/**
 * Script to introspect GraphQL schema from the backend.
 *
 * Usage:
 *   npx tsx scripts/introspect-schema.ts
 *
 * Environment variables:
 *   VITE_GRAPHQL_URL - GraphQL endpoint (default: http://localhost:3000/graphql)
 *   CODEGEN_AUTH_TOKEN - Firebase ID token for authenticated introspection
 *
 * How to get CODEGEN_AUTH_TOKEN:
 *   1. Open the app in browser and login
 *   2. Open DevTools console (F12)
 *   3. Run: await firebase.auth().currentUser.getIdToken()
 *   4. Copy the token and set: export CODEGEN_AUTH_TOKEN="your-token"
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// Load .env file
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../src/graphql/generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "schema.graphql");

const GRAPHQL_URL =
  process.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql";
const AUTH_TOKEN = process.env.CODEGEN_AUTH_TOKEN;

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface IntrospectionResult {
  data?: {
    __schema: Record<string, unknown>;
  };
  errors?: GraphQLError[];
}

async function introspect(withAuth: boolean): Promise<IntrospectionResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (withAuth && AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  }

  console.log(`\n🔍 Introspecting ${GRAPHQL_URL}`);
  console.log(
    `   Auth: ${withAuth && AUTH_TOKEN ? "Yes (token provided)" : "No"}`,
  );

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    });

    if (!response.ok) {
      return {
        errors: [
          {
            message: `HTTP ${response.status}: ${response.statusText}`,
            extensions: { code: `HTTP_${response.status}` },
          },
        ],
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      errors: [
        {
          message,
          extensions: { code: "NETWORK_ERROR" },
        },
      ],
    };
  }
}

function printSchemaFromIntrospection(schema: Record<string, unknown>): string {
  // This is a simplified SDL generation - for full SDL use graphql-js
  // The codegen will use the introspection directly, this is just for reference
  return JSON.stringify(schema, null, 2);
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("           GraphQL Schema Introspection Tool");
  console.log("═══════════════════════════════════════════════════════════");

  // Try without auth first
  let result = await introspect(false);

  if (result.errors) {
    const authError = result.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.extensions?.code === "INVALID_AUTH" ||
        e.message.toLowerCase().includes("unauthorized") ||
        e.message.toLowerCase().includes("unauthenticated"),
    );

    if (authError) {
      console.log("\n⚠️  Introspection requires authentication");

      if (!AUTH_TOKEN) {
        console.log("\n❌ No CODEGEN_AUTH_TOKEN provided");
        console.log("\n📋 How to get a token:");
        console.log("   1. Open the app in browser and login");
        console.log("   2. Open DevTools console (F12)");
        console.log(
          "   3. Run: await firebase.auth().currentUser.getIdToken()",
        );
        console.log("   4. Copy the token and run:");
        console.log('      export CODEGEN_AUTH_TOKEN="your-token"');
        console.log("   5. Run this script again");
        process.exit(1);
      }

      // Retry with auth
      console.log("\n🔐 Retrying with authentication...");
      result = await introspect(true);
    }
  }

  if (result.errors) {
    console.log("\n❌ Introspection failed:");
    for (const error of result.errors) {
      console.log(`   - ${error.message}`);
      if (error.extensions?.code) {
        console.log(`     Code: ${error.extensions.code}`);
      }
    }

    // Provide hints
    const errorCode = result.errors[0]?.extensions?.code;
    const errorMsg = result.errors[0]?.message;

    console.log("\n📋 Possible causes and fixes:");
    if (errorCode === "NETWORK_ERROR" || errorMsg?.includes("fetch")) {
      console.log("   - Backend not running at " + GRAPHQL_URL);
      console.log("   - CORS blocking the request");
      console.log("   - Network connectivity issue");
      console.log("   Fix: Start the backend or check VITE_GRAPHQL_URL");
    } else if (errorCode?.startsWith("HTTP_404")) {
      console.log("   - GraphQL endpoint not found");
      console.log(
        "   Fix: Check VITE_GRAPHQL_URL path (should end with /graphql)",
      );
    } else if (errorCode?.startsWith("HTTP_5")) {
      console.log("   - Backend server error");
      console.log("   Fix: Check backend logs");
    } else if (
      errorCode === "INVALID_AUTH" ||
      errorCode === "UNAUTHENTICATED"
    ) {
      console.log("   - Token expired or invalid");
      console.log("   Fix: Get a fresh token from the browser");
    }

    process.exit(1);
  }

  if (!result.data?.__schema) {
    console.log("\n❌ No schema returned");
    process.exit(1);
  }

  console.log("\n✅ Schema introspection successful!");

  // Save introspection result
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const schemaJson = {
    __schema: result.data.__schema,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "schema.json"),
    JSON.stringify(schemaJson, null, 2),
  );

  console.log(`\n📁 Schema saved to:`);
  console.log(`   ${path.join(OUTPUT_DIR, "schema.json")}`);

  // Print available operations
  const schema = result.data.__schema as {
    queryType?: { name: string };
    mutationType?: { name: string };
    types: Array<{
      name: string;
      kind: string;
      fields?: Array<{ name: string }>;
    }>;
  };

  const queryType = schema.types.find((t) => t.name === schema.queryType?.name);
  const mutationType = schema.types.find(
    (t) => t.name === schema.mutationType?.name,
  );

  console.log("\n📊 Available operations:");

  if (queryType?.fields) {
    console.log("\n   Queries:");
    for (const field of queryType.fields) {
      console.log(`     - ${field.name}`);
    }
  }

  if (mutationType?.fields) {
    console.log("\n   Mutations:");
    for (const field of mutationType.fields) {
      console.log(`     - ${field.name}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
