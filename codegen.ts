import type { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const schemaUrl =
  process.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql";
const authToken = process.env.CODEGEN_AUTH_TOKEN;

// Schema configuration with optional auth header
const schemaConfig: CodegenConfig["schema"] = authToken
  ? [
      {
        [schemaUrl]: {
          headers: {
            Authorization: `Bearer ---------- ${authToken}`,
          },
        },
      },
    ]
  : schemaUrl;

const config: CodegenConfig = {
  schema: schemaConfig,
  documents: ["src/graphql/operations/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        // Use string for scalars that don't have native TS equivalents
        scalars: {
          DateTime: "string",
          JSON: "Record<string, unknown>",
        },
        // Make fields non-nullable by default (matching GraphQL schema)
        strictScalars: true,
        // Use type imports for better tree-shaking
        useTypeImports: true,
        // Avoid enum naming conflicts
        enumsAsTypes: true,
        // Don't add __typename by default
        skipTypename: true,
        // Generate both query and mutation document nodes
        documentMode: "documentNode",
        // Make operation result types easier to use
        omitOperationSuffix: false,
        // Export fragment types
        exportFragmentSpreadSubTypes: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;
