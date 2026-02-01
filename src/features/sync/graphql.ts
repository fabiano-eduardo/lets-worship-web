// GraphQL operations for sync

export const SYNC_PUSH_MUTATION = `
  mutation SyncPush($input: SyncPushInput!) {
    syncPush(input: $input) {
      results {
        mutationId
        status
        entityId
        newRev
        error
      }
    }
  }
`;

export const SYNC_PULL_QUERY = `
  query SyncPull($input: SyncPullInput!) {
    syncPull(input: $input) {
      changes {
        entityType
        entityId
        op
        rev
        entity
      }
      nextCursor
      hasMore
    }
  }
`;

// Types for sync operations
export interface SyncPushMutation {
  mutationId: string;
  deviceId: string;
  entityType: "SONG" | "SONG_VERSION" | "SECTION_NOTE";
  op: "UPSERT" | "DELETE";
  entityId: string;
  baseRev?: number;
  payload?: Record<string, unknown>;
}

export interface SyncPushResult {
  mutationId: string;
  status: "APPLIED" | "CONFLICT" | "REJECTED";
  entityId: string;
  newRev?: number;
  error?: string;
}

export interface SyncPushResponse {
  syncPush: {
    results: SyncPushResult[];
  };
}

export interface SyncPullChange {
  entityType: "SONG" | "SONG_VERSION" | "SECTION_NOTE";
  entityId: string;
  op: "UPSERT" | "DELETE";
  rev: number;
  entity?: Record<string, unknown>;
}

export interface SyncPullResponse {
  syncPull: {
    changes: SyncPullChange[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

// Convert local entity type to GraphQL enum
export function toGraphQLEntityType(
  type: "song" | "songVersion" | "sectionNote",
): "SONG" | "SONG_VERSION" | "SECTION_NOTE" {
  switch (type) {
    case "song":
      return "SONG";
    case "songVersion":
      return "SONG_VERSION";
    case "sectionNote":
      return "SECTION_NOTE";
  }
}

// Convert GraphQL entity type to local type
export function fromGraphQLEntityType(
  type: "SONG" | "SONG_VERSION" | "SECTION_NOTE",
): "song" | "songVersion" | "sectionNote" {
  switch (type) {
    case "SONG":
      return "song";
    case "SONG_VERSION":
      return "songVersion";
    case "SECTION_NOTE":
      return "sectionNote";
  }
}
