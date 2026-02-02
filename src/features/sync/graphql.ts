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
        cursorId
        changedAt
      }
      entities {
        songs {
          id
          title
          artist
          defaultVersionId
          createdAt
          updatedAt
          rev
        }
        versions {
          id
          songId
          label
          arrangement {
            sections {
              id
              name
              chordProText
              notes {
                id
                sectionId
                text
                anchor {
                  type
                  lineIndex
                  wordOffset
                  fromLineIndex
                  toLineIndex
                }
              }
            }
            sequence {
              sectionId
              repeat
              sequenceNotes
            }
          }
          reference {
            youtubeUrl
            spotifyUrl
            descriptionIfNoLink
          }
          musicalMeta {
            originalKey {
              root
              mode
              type
              tonalQuality
            }
            bpm
            timeSignature
          }
          createdAt
          updatedAt
          rev
        }
        notes {
          id
          versionId
          sectionId
          anchor {
            type
            lineIndex
            wordOffset
            fromLineIndex
            toLineIndex
          }
          text
          createdAt
          updatedAt
          rev
        }
      }
      nextCursor
      hasMore
      serverTime
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
  cursorId: string;
  changedAt: string;
}

// Entity snapshots returned when includeEntities=true
export interface SyncEntitiesSnapshot {
  songs?: Array<{
    id: string;
    title: string;
    artist?: string;
    defaultVersionId?: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
  }>;
  versions?: Array<{
    id: string;
    songId: string;
    label: string;
    arrangement?: {
      sections: Array<{
        id: string;
        name: string;
        chordProText: string;
        notes: Array<{
          id: string;
          sectionId: string;
          text: string;
          anchor: {
            type: "LINE" | "WORD" | "RANGE";
            lineIndex?: number;
            wordOffset?: number;
            fromLineIndex?: number;
            toLineIndex?: number;
          };
        }>;
      }>;
      sequence: Array<{
        sectionId: string;
        repeat: number;
        sequenceNotes?: string;
      }>;
    };
    reference?: {
      youtubeUrl?: string;
      spotifyUrl?: string;
      descriptionIfNoLink?: string;
    };
    musicalMeta?: {
      originalKey?: {
        root: string;
        mode?: string;
        type?: string;
        tonalQuality?: string;
      };
      bpm?: number;
      timeSignature?: string;
    };
    createdAt: string;
    updatedAt: string;
    rev: number;
  }>;
  notes?: Array<{
    id: string;
    versionId: string;
    sectionId: string;
    anchor: {
      type: "LINE" | "WORD" | "RANGE";
      lineIndex?: number;
      wordOffset?: number;
      fromLineIndex?: number;
      toLineIndex?: number;
    };
    text: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
  }>;
}

export interface SyncPullResponse {
  syncPull: {
    changes: SyncPullChange[];
    entities?: SyncEntitiesSnapshot;
    nextCursor: string | null;
    hasMore: boolean;
    serverTime: string;
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
