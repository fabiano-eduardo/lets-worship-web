import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  JSON: { input: Record<string, unknown>; output: Record<string, unknown> };
};

export type Anchor = {
  /** Start line for type=range */
  fromLineIndex?: Maybe<Scalars["Int"]["output"]>;
  /** Line index for type=line or type=word */
  lineIndex?: Maybe<Scalars["Int"]["output"]>;
  /** End line for type=range */
  toLineIndex?: Maybe<Scalars["Int"]["output"]>;
  type: AnchorType;
  /** Word offset within line for type=word */
  wordOffset?: Maybe<Scalars["Int"]["output"]>;
};

export type AnchorInput = {
  fromLineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  lineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  toLineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  type: AnchorType;
  wordOffset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Type of note anchor */
export type AnchorType = "LINE" | "RANGE" | "WORD";

export type Arrangement = {
  sections: Array<SectionBlock>;
  sequence: Array<SequenceItem>;
};

export type ArrangementInput = {
  sections: Array<SectionBlockInput>;
  sequence: Array<SequenceItemInput>;
};

export type ChangeLogEntry = {
  changedAt: Scalars["String"]["output"];
  cursorId: Scalars["String"]["output"];
  entityId: Scalars["String"]["output"];
  entityType: EntityType;
  op: ChangeOp;
  rev: Scalars["Int"]["output"];
  sourceDeviceId?: Maybe<Scalars["String"]["output"]>;
};

export type ChangeOp = "DELETE" | "UPSERT";

export type CreateSectionNoteInput = {
  anchor: AnchorInput;
  /** Optional client-provided ID for sync */
  id?: InputMaybe<Scalars["String"]["input"]>;
  occurrenceId?: InputMaybe<Scalars["ID"]["input"]>;
  sectionId: Scalars["String"]["input"];
  text: Scalars["String"]["input"];
  versionId: Scalars["String"]["input"];
};

export type CreateSongInput = {
  artist?: InputMaybe<Scalars["String"]["input"]>;
  defaultVersionId?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["String"]["input"]>;
  syncMeta?: InputMaybe<SyncMetaInput>;
  title: Scalars["String"]["input"];
};

export type CreateSongVersionInput = {
  arrangement?: InputMaybe<ArrangementInput>;
  id?: InputMaybe<Scalars["String"]["input"]>;
  label: Scalars["String"]["input"];
  musicalMeta?: InputMaybe<MusicalMetaInput>;
  reference?: InputMaybe<ReferenceInput>;
  songId: Scalars["String"]["input"];
  syncMeta?: InputMaybe<SyncMetaInput>;
};

export type EmbeddedSectionNote = {
  anchor: LegacyNoteAnchor;
  id: Scalars["String"]["output"];
  sectionId: Scalars["String"]["output"];
  text: Scalars["String"]["output"];
};

export type EmbeddedSectionNoteInput = {
  anchor: LegacyNoteAnchorInput;
  id: Scalars["String"]["input"];
  sectionId: Scalars["String"]["input"];
  text: Scalars["String"]["input"];
};

export type EntityType =
  | "SECTION_NOTE"
  | "SONG"
  | "SONG_MAP_ITEM"
  | "SONG_VERSION";

export type HealthStatus = {
  serverTime: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
  version: Scalars["String"]["output"];
};

export type KeySignature = {
  mode?: Maybe<MusicalMode>;
  root: Scalars["String"]["output"];
  tonalQuality?: Maybe<TonalQuality>;
  type: KeyType;
};

export type KeySignatureInput = {
  mode?: InputMaybe<MusicalMode>;
  root: Scalars["String"]["input"];
  tonalQuality?: InputMaybe<TonalQuality>;
  type: KeyType;
};

/** Type of musical key signature */
export type KeyType = "modal" | "tonal";

/** Type of note anchor (legacy) */
export type LegacyAnchorType = "LINE" | "RANGE" | "WORD";

export type LegacyNoteAnchor = {
  fromLineIndex?: Maybe<Scalars["Int"]["output"]>;
  lineIndex?: Maybe<Scalars["Int"]["output"]>;
  toLineIndex?: Maybe<Scalars["Int"]["output"]>;
  type: LegacyAnchorType;
  wordOffset?: Maybe<Scalars["Int"]["output"]>;
};

export type LegacyNoteAnchorInput = {
  fromLineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  lineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  toLineIndex?: InputMaybe<Scalars["Int"]["input"]>;
  type: LegacyAnchorType;
  wordOffset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type MapViewPreferences = {
  /** Font scale factor (0.5 - 2.0) */
  fontScale?: Maybe<Scalars["Float"]["output"]>;
  showChords: Scalars["Boolean"]["output"];
  showLyrics: Scalars["Boolean"]["output"];
  showNotes: Scalars["Boolean"]["output"];
};

export type MapViewPreferencesInput = {
  fontScale?: InputMaybe<Scalars["Float"]["input"]>;
  showChords?: InputMaybe<Scalars["Boolean"]["input"]>;
  showLyrics?: InputMaybe<Scalars["Boolean"]["input"]>;
  showNotes?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MusicalMeta = {
  bpm?: Maybe<Scalars["Int"]["output"]>;
  originalKey?: Maybe<KeySignature>;
  timeSignature?: Maybe<Scalars["String"]["output"]>;
};

export type MusicalMetaInput = {
  bpm?: InputMaybe<Scalars["Int"]["input"]>;
  originalKey?: InputMaybe<KeySignatureInput>;
  timeSignature?: InputMaybe<Scalars["String"]["input"]>;
};

/** Musical modes */
export type MusicalMode =
  | "AEOLIAN"
  | "DORIAN"
  | "IONIAN"
  | "LOCRIAN"
  | "LYDIAN"
  | "MIXOLYDIAN"
  | "PHRYGIAN";

export type Mutation = {
  /** Create a new section note */
  createSectionNote: SectionNote;
  /** Create a new song */
  createSong: Song;
  /** Create a new song version */
  createSongVersion: SongVersion;
  /** Delete a section note (soft delete) */
  deleteSectionNote: Scalars["Boolean"]["output"];
  /** Delete a song (soft delete) */
  deleteSong: Song;
  /** Delete a song map item (soft delete) */
  deleteSongMapItem: Scalars["Boolean"]["output"];
  /** Delete a song version (soft delete) */
  deleteSongVersion: SongVersion;
  /** Reorder map items for a song version */
  reorderSongMapItems: Array<SongMapItem>;
  /** Push client mutations to the server. Returns status for each mutation. */
  syncPush: SyncPushResult;
  /** Update current user preferences */
  updateMePreferences: UserPreferences;
  /** Update a section note */
  updateSectionNote: SectionNote;
  /** Update an existing song */
  updateSong: Song;
  /** Update an existing song version */
  updateSongVersion: SongVersion;
  /** Upsert a song map item */
  upsertSongMapItem: SongMapItem;
};

export type MutationCreateSectionNoteArgs = {
  input: CreateSectionNoteInput;
};

export type MutationCreateSongArgs = {
  input: CreateSongInput;
};

export type MutationCreateSongVersionArgs = {
  input: CreateSongVersionInput;
};

export type MutationDeleteSectionNoteArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSongArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSongMapItemArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSongVersionArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationReorderSongMapItemsArgs = {
  input: ReorderSongMapItemsInput;
};

export type MutationSyncPushArgs = {
  input: SyncPushInput;
};

export type MutationUpdateMePreferencesArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  patch: UpdateUserPreferencesInput;
};

export type MutationUpdateSectionNoteArgs = {
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
  patch: UpdateSectionNoteInput;
};

export type MutationUpdateSongArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSongInput;
};

export type MutationUpdateSongVersionArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSongVersionInput;
};

export type MutationUpsertSongMapItemArgs = {
  input: UpsertSongMapItemInput;
};

export type MutationResult = {
  entityId: Scalars["String"]["output"];
  mutationId: Scalars["String"]["output"];
  /** New revision if applied */
  newRev?: Maybe<Scalars["Int"]["output"]>;
  /** Reason for rejection or conflict */
  reason?: Maybe<Scalars["String"]["output"]>;
  /** Server entity state if conflict or needed */
  serverEntity?: Maybe<Scalars["JSON"]["output"]>;
  status: MutationStatus;
};

export type MutationStatus = "APPLIED" | "CONFLICT" | "REJECTED";

export type Query = {
  /** Get current server state of an entity (for conflict resolution) */
  getEntityState?: Maybe<Scalars["JSON"]["output"]>;
  /** Health check endpoint */
  health: HealthStatus;
  /** Get current user preferences */
  mePreferences: UserPreferences;
  /** Get a section note by ID */
  sectionNote?: Maybe<SectionNote>;
  /** Get all notes for a version */
  sectionNotes: Array<SectionNote>;
  /** Get all notes for a specific section within a version */
  sectionNotesBySection: Array<SectionNote>;
  /** Get a song by ID */
  song?: Maybe<Song>;
  /** Get a song map item by ID */
  songMapItem?: Maybe<SongMapItem>;
  /** Get a song version by ID */
  songVersion?: Maybe<SongVersion>;
  /** Get all versions of a song */
  songVersions: Array<SongVersion>;
  /** Get all songs with optional search and pagination */
  songs: SongsResult;
  /** Pull incremental changes since a cursor. Use for sync. */
  syncPull: SyncPullResult;
};

export type QueryGetEntityStateArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
};

export type QuerySectionNoteArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySectionNotesArgs = {
  occurrenceId?: InputMaybe<Scalars["ID"]["input"]>;
  versionId: Scalars["ID"]["input"];
};

export type QuerySectionNotesBySectionArgs = {
  sectionId: Scalars["ID"]["input"];
  versionId: Scalars["ID"]["input"];
};

export type QuerySongArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySongMapItemArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySongVersionArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySongVersionsArgs = {
  songId: Scalars["ID"]["input"];
};

export type QuerySongsArgs = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySyncPullArgs = {
  input: SyncPullInput;
};

export type Reference = {
  descriptionIfNoLink?: Maybe<Scalars["String"]["output"]>;
  spotifyUrl?: Maybe<Scalars["String"]["output"]>;
  youtubeUrl?: Maybe<Scalars["String"]["output"]>;
};

export type ReferenceInput = {
  descriptionIfNoLink?: InputMaybe<Scalars["String"]["input"]>;
  spotifyUrl?: InputMaybe<Scalars["String"]["input"]>;
  youtubeUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type ReorderSongMapItemsInput = {
  orderedIds: Array<Scalars["ID"]["input"]>;
  songVersionId: Scalars["ID"]["input"];
};

export type SectionBlock = {
  chordProText: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  notes?: Maybe<Array<EmbeddedSectionNote>>;
};

export type SectionBlockInput = {
  chordProText: Scalars["String"]["input"];
  id: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Array<EmbeddedSectionNoteInput>>;
};

export type SectionNote = {
  anchor: Anchor;
  createdAt: Scalars["String"]["output"];
  deletedAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  occurrenceId?: Maybe<Scalars["ID"]["output"]>;
  ownerUid: Scalars["String"]["output"];
  rev: Scalars["Int"]["output"];
  schemaVersion: Scalars["Int"]["output"];
  sectionId: Scalars["String"]["output"];
  /** Note text (e.g., "Banda cresce", "Diminui") */
  text: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
  versionId: Scalars["String"]["output"];
};

export type SequenceItem = {
  repeat?: Maybe<Scalars["Int"]["output"]>;
  sectionId: Scalars["String"]["output"];
  sequenceNotes?: Maybe<Array<Scalars["String"]["output"]>>;
};

export type SequenceItemInput = {
  repeat?: InputMaybe<Scalars["Int"]["input"]>;
  sectionId: Scalars["String"]["input"];
  sequenceNotes?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type Song = {
  artist?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["String"]["output"];
  defaultVersionId?: Maybe<Scalars["String"]["output"]>;
  deletedAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  /** Owner user ID (Firebase Auth UID) */
  ownerUid: Scalars["String"]["output"];
  rev: Scalars["Int"]["output"];
  schemaVersion: Scalars["Int"]["output"];
  syncMeta?: Maybe<SyncMeta>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type SongMapItem = {
  createdAt: Scalars["String"]["output"];
  deletedAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  labelOverride?: Maybe<Scalars["String"]["output"]>;
  order: Scalars["Int"]["output"];
  ownerUid: Scalars["String"]["output"];
  rev: Scalars["Int"]["output"];
  schemaVersion: Scalars["Int"]["output"];
  sectionId: Scalars["String"]["output"];
  songVersionId: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type SongVersion = {
  arrangement?: Maybe<Arrangement>;
  createdAt: Scalars["String"]["output"];
  deletedAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  label: Scalars["String"]["output"];
  mapItems: Array<SongMapItem>;
  musicalMeta?: Maybe<MusicalMeta>;
  ownerUid: Scalars["String"]["output"];
  reference?: Maybe<Reference>;
  rev: Scalars["Int"]["output"];
  schemaVersion: Scalars["Int"]["output"];
  songId: Scalars["String"]["output"];
  syncMeta?: Maybe<SyncMeta>;
  updatedAt: Scalars["String"]["output"];
};

export type SongsResult = {
  nextCursor?: Maybe<Scalars["String"]["output"]>;
  songs: Array<Song>;
};

export type SyncEntitiesSnapshot = {
  mapItems?: Maybe<Array<SongMapItem>>;
  notes?: Maybe<Array<SectionNote>>;
  songs?: Maybe<Array<Song>>;
  versions?: Maybe<Array<SongVersion>>;
};

export type SyncMeta = {
  lastMutationId?: Maybe<Scalars["String"]["output"]>;
  updatedByDeviceId?: Maybe<Scalars["String"]["output"]>;
};

export type SyncMetaInput = {
  lastMutationId?: InputMaybe<Scalars["String"]["input"]>;
  updatedByDeviceId?: InputMaybe<Scalars["String"]["input"]>;
};

export type SyncMutationInput = {
  /** Base revision for conflict detection. If omitted, LWW applies. */
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  /** Client timestamp for informational purposes */
  clientUpdatedAt?: InputMaybe<Scalars["String"]["input"]>;
  /** Entity data for UPSERT operations */
  entity?: InputMaybe<Scalars["JSON"]["input"]>;
  /** Entity ID (always required) */
  entityId: Scalars["String"]["input"];
  entityType: EntityType;
  /** Client-generated mutation ID for idempotency */
  mutationId: Scalars["String"]["input"];
  op: ChangeOp;
};

export type SyncPullInput = {
  /** Include entity snapshots in response to reduce round-trips */
  includeEntities?: InputMaybe<Scalars["Boolean"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Cursor from previous pull (ULID) */
  sinceCursor?: InputMaybe<Scalars["String"]["input"]>;
};

export type SyncPullResult = {
  changes: Array<ChangeLogEntry>;
  /** Entity snapshots if includeEntities was true */
  entities?: Maybe<SyncEntitiesSnapshot>;
  /** Whether there are more changes available */
  hasMore: Scalars["Boolean"]["output"];
  /** Cursor for next pull */
  nextCursor?: Maybe<Scalars["String"]["output"]>;
  /** Current server time as ISO string */
  serverTime: Scalars["String"]["output"];
};

export type SyncPushInput = {
  /** Device ID for tracking mutations */
  deviceId: Scalars["String"]["input"];
  mutations: Array<SyncMutationInput>;
};

export type SyncPushResult = {
  applied: Array<MutationResult>;
  /** Current server time as ISO string */
  serverTime: Scalars["String"]["output"];
};

/** Major or minor quality */
export type TonalQuality = "MAJOR" | "MINOR";

export type UpdateSectionNoteInput = {
  anchor?: InputMaybe<AnchorInput>;
  occurrenceId?: InputMaybe<Scalars["ID"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSongInput = {
  artist?: InputMaybe<Scalars["String"]["input"]>;
  /** Base revision for conflict detection */
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  defaultVersionId?: InputMaybe<Scalars["String"]["input"]>;
  syncMeta?: InputMaybe<SyncMetaInput>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSongVersionInput = {
  arrangement?: InputMaybe<ArrangementInput>;
  /** Base revision for conflict detection */
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  musicalMeta?: InputMaybe<MusicalMetaInput>;
  reference?: InputMaybe<ReferenceInput>;
  syncMeta?: InputMaybe<SyncMetaInput>;
};

export type UpdateUserPreferencesInput = {
  defaultMapView?: InputMaybe<MapViewPreferencesInput>;
};

export type UpsertSongMapItemInput = {
  /** Base revision for conflict detection */
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  /** Optional client-provided ID for sync */
  id?: InputMaybe<Scalars["String"]["input"]>;
  labelOverride?: InputMaybe<Scalars["String"]["input"]>;
  order: Scalars["Int"]["input"];
  sectionId: Scalars["String"]["input"];
  songVersionId: Scalars["String"]["input"];
};

export type UserPreferences = {
  defaultMapView: MapViewPreferences;
  id: Scalars["ID"]["output"];
  rev: Scalars["Int"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type HealthQueryVariables = Exact<{ [key: string]: never }>;

export type HealthQuery = {
  health: { status: string; version: string; serverTime: string };
};

export type MePreferencesQueryVariables = Exact<{ [key: string]: never }>;

export type MePreferencesQuery = {
  mePreferences: {
    id: string;
    rev: number;
    updatedAt: string;
    defaultMapView: {
      showChords: boolean;
      showLyrics: boolean;
      showNotes: boolean;
      fontScale?: number | null;
    };
  };
};

export type UpdateMePreferencesMutationVariables = Exact<{
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  patch: UpdateUserPreferencesInput;
}>;

export type UpdateMePreferencesMutation = {
  updateMePreferences: {
    id: string;
    rev: number;
    updatedAt: string;
    defaultMapView: {
      showChords: boolean;
      showLyrics: boolean;
      showNotes: boolean;
      fontScale?: number | null;
    };
  };
};

export type SectionNoteFieldsFragment = {
  id: string;
  versionId: string;
  sectionId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
  anchor: {
    type: AnchorType;
    lineIndex?: number | null;
    wordOffset?: number | null;
    fromLineIndex?: number | null;
    toLineIndex?: number | null;
  };
};

export type SectionNotesQueryVariables = Exact<{
  versionId: Scalars["ID"]["input"];
}>;

export type SectionNotesQuery = {
  sectionNotes: Array<{
    id: string;
    versionId: string;
    sectionId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    anchor: {
      type: AnchorType;
      lineIndex?: number | null;
      wordOffset?: number | null;
      fromLineIndex?: number | null;
      toLineIndex?: number | null;
    };
  }>;
};

export type SectionNotesBySectionQueryVariables = Exact<{
  versionId: Scalars["ID"]["input"];
  sectionId: Scalars["ID"]["input"];
}>;

export type SectionNotesBySectionQuery = {
  sectionNotesBySection: Array<{
    id: string;
    versionId: string;
    sectionId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    anchor: {
      type: AnchorType;
      lineIndex?: number | null;
      wordOffset?: number | null;
      fromLineIndex?: number | null;
      toLineIndex?: number | null;
    };
  }>;
};

export type CreateSectionNoteMutationVariables = Exact<{
  input: CreateSectionNoteInput;
}>;

export type CreateSectionNoteMutation = {
  createSectionNote: {
    id: string;
    versionId: string;
    sectionId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    anchor: {
      type: AnchorType;
      lineIndex?: number | null;
      wordOffset?: number | null;
      fromLineIndex?: number | null;
      toLineIndex?: number | null;
    };
  };
};

export type UpdateSectionNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
  patch: UpdateSectionNoteInput;
}>;

export type UpdateSectionNoteMutation = {
  updateSectionNote: {
    id: string;
    text: string;
    updatedAt: string;
    rev: number;
    anchor: {
      type: AnchorType;
      lineIndex?: number | null;
      wordOffset?: number | null;
      fromLineIndex?: number | null;
      toLineIndex?: number | null;
    };
  };
};

export type DeleteSectionNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type DeleteSectionNoteMutation = { deleteSectionNote: boolean };

export type SongFieldsFragment = {
  id: string;
  title: string;
  artist?: string | null;
  defaultVersionId?: string | null;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
};

export type VersionListFieldsFragment = {
  id: string;
  songId: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
  musicalMeta?: {
    bpm?: number | null;
    timeSignature?: string | null;
    originalKey?: {
      root: string;
      mode?: MusicalMode | null;
      type: KeyType;
      tonalQuality?: TonalQuality | null;
    } | null;
  } | null;
};

export type VersionFieldsFragment = {
  id: string;
  songId: string;
  label: string;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
  arrangement?: {
    sections: Array<{
      id: string;
      name: string;
      chordProText: string;
      notes?: Array<{
        id: string;
        sectionId: string;
        text: string;
        anchor: {
          type: LegacyAnchorType;
          lineIndex?: number | null;
          wordOffset?: number | null;
          fromLineIndex?: number | null;
          toLineIndex?: number | null;
        };
      }> | null;
    }>;
    sequence: Array<{
      sectionId: string;
      repeat?: number | null;
      sequenceNotes?: Array<string> | null;
    }>;
  } | null;
  reference?: {
    youtubeUrl?: string | null;
    spotifyUrl?: string | null;
    descriptionIfNoLink?: string | null;
  } | null;
  musicalMeta?: {
    bpm?: number | null;
    timeSignature?: string | null;
    originalKey?: {
      root: string;
      mode?: MusicalMode | null;
      type: KeyType;
      tonalQuality?: TonalQuality | null;
    } | null;
  } | null;
};

export type SongsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SongsQuery = {
  songs: {
    nextCursor?: string | null;
    songs: Array<{
      id: string;
      title: string;
      artist?: string | null;
      defaultVersionId?: string | null;
      ownerUid: string;
      createdAt: string;
      updatedAt: string;
      rev: number;
    }>;
  };
};

export type SongQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type SongQuery = {
  song?: {
    id: string;
    title: string;
    artist?: string | null;
    defaultVersionId?: string | null;
    ownerUid: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
  } | null;
};

export type SongVersionsQueryVariables = Exact<{
  songId: Scalars["ID"]["input"];
}>;

export type SongVersionsQuery = {
  songVersions: Array<{
    id: string;
    songId: string;
    label: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    musicalMeta?: {
      bpm?: number | null;
      timeSignature?: string | null;
      originalKey?: {
        root: string;
        mode?: MusicalMode | null;
        type: KeyType;
        tonalQuality?: TonalQuality | null;
      } | null;
    } | null;
  }>;
};

export type CreateSongMutationVariables = Exact<{
  input: CreateSongInput;
}>;

export type CreateSongMutation = {
  createSong: {
    id: string;
    title: string;
    artist?: string | null;
    defaultVersionId?: string | null;
    ownerUid: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
  };
};

export type UpdateSongMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSongInput;
}>;

export type UpdateSongMutation = {
  updateSong: {
    id: string;
    title: string;
    artist?: string | null;
    defaultVersionId?: string | null;
    updatedAt: string;
    rev: number;
  };
};

export type DeleteSongMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type DeleteSongMutation = {
  deleteSong: { id: string; deletedAt?: string | null };
};

export type SyncPullQueryVariables = Exact<{
  input: SyncPullInput;
}>;

export type SyncPullQuery = {
  syncPull: {
    nextCursor?: string | null;
    hasMore: boolean;
    serverTime: string;
    changes: Array<{
      entityType: EntityType;
      entityId: string;
      op: ChangeOp;
      rev: number;
      cursorId: string;
      changedAt: string;
    }>;
    entities?: {
      songs?: Array<{
        id: string;
        title: string;
        artist?: string | null;
        defaultVersionId?: string | null;
        createdAt: string;
        updatedAt: string;
        rev: number;
      }> | null;
      versions?: Array<{
        id: string;
        songId: string;
        label: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        arrangement?: {
          sections: Array<{
            id: string;
            name: string;
            chordProText: string;
            notes?: Array<{
              id: string;
              sectionId: string;
              text: string;
              anchor: {
                type: LegacyAnchorType;
                lineIndex?: number | null;
                wordOffset?: number | null;
                fromLineIndex?: number | null;
                toLineIndex?: number | null;
              };
            }> | null;
          }>;
          sequence: Array<{
            sectionId: string;
            repeat?: number | null;
            sequenceNotes?: Array<string> | null;
          }>;
        } | null;
        reference?: {
          youtubeUrl?: string | null;
          spotifyUrl?: string | null;
          descriptionIfNoLink?: string | null;
        } | null;
        musicalMeta?: {
          bpm?: number | null;
          timeSignature?: string | null;
          originalKey?: {
            root: string;
            mode?: MusicalMode | null;
            type: KeyType;
            tonalQuality?: TonalQuality | null;
          } | null;
        } | null;
      }> | null;
      notes?: Array<{
        id: string;
        versionId: string;
        sectionId: string;
        text: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        anchor: {
          type: AnchorType;
          lineIndex?: number | null;
          wordOffset?: number | null;
          fromLineIndex?: number | null;
          toLineIndex?: number | null;
        };
      }> | null;
    } | null;
  };
};

export type SyncPushMutationVariables = Exact<{
  input: SyncPushInput;
}>;

export type SyncPushMutation = {
  syncPush: {
    serverTime: string;
    applied: Array<{
      mutationId: string;
      status: MutationStatus;
      entityId: string;
      newRev?: number | null;
      reason?: string | null;
    }>;
  };
};

export type SongVersionQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type SongVersionQuery = {
  songVersion?: {
    id: string;
    songId: string;
    label: string;
    ownerUid: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    arrangement?: {
      sections: Array<{
        id: string;
        name: string;
        chordProText: string;
        notes?: Array<{
          id: string;
          sectionId: string;
          text: string;
          anchor: {
            type: LegacyAnchorType;
            lineIndex?: number | null;
            wordOffset?: number | null;
            fromLineIndex?: number | null;
            toLineIndex?: number | null;
          };
        }> | null;
      }>;
      sequence: Array<{
        sectionId: string;
        repeat?: number | null;
        sequenceNotes?: Array<string> | null;
      }>;
    } | null;
    reference?: {
      youtubeUrl?: string | null;
      spotifyUrl?: string | null;
      descriptionIfNoLink?: string | null;
    } | null;
    musicalMeta?: {
      bpm?: number | null;
      timeSignature?: string | null;
      originalKey?: {
        root: string;
        mode?: MusicalMode | null;
        type: KeyType;
        tonalQuality?: TonalQuality | null;
      } | null;
    } | null;
  } | null;
};

export type CreateSongVersionMutationVariables = Exact<{
  input: CreateSongVersionInput;
}>;

export type CreateSongVersionMutation = {
  createSongVersion: {
    id: string;
    songId: string;
    label: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
  };
};

export type UpdateSongVersionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSongVersionInput;
}>;

export type UpdateSongVersionMutation = {
  updateSongVersion: {
    id: string;
    label: string;
    updatedAt: string;
    rev: number;
  };
};

export type DeleteSongVersionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  baseRev?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type DeleteSongVersionMutation = {
  deleteSongVersion: { id: string; deletedAt?: string | null };
};

export const SectionNoteFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SectionNoteFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SectionNote" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionId" } },
          { kind: "Field", name: { kind: "Name", value: "sectionId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "anchor" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "lineIndex" } },
                { kind: "Field", name: { kind: "Name", value: "wordOffset" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fromLineIndex" },
                },
                { kind: "Field", name: { kind: "Name", value: "toLineIndex" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "text" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SectionNoteFieldsFragment, unknown>;
export const SongFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SongFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Song" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "artist" } },
          { kind: "Field", name: { kind: "Name", value: "defaultVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SongFieldsFragment, unknown>;
export const VersionListFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionListFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SongVersion" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "songId" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "musicalMeta" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "originalKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "root" } },
                      { kind: "Field", name: { kind: "Name", value: "mode" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tonalQuality" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "bpm" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "timeSignature" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VersionListFieldsFragment, unknown>;
export const VersionFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SongVersion" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "songId" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "arrangement" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sections" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "chordProText" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "notes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "text" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "anchor" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "type" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "lineIndex" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "wordOffset" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "fromLineIndex",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "toLineIndex",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sequence" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "repeat" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sequenceNotes" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "reference" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "youtubeUrl" } },
                { kind: "Field", name: { kind: "Name", value: "spotifyUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "descriptionIfNoLink" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "musicalMeta" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "originalKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "root" } },
                      { kind: "Field", name: { kind: "Name", value: "mode" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tonalQuality" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "bpm" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "timeSignature" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VersionFieldsFragment, unknown>;
export const HealthDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Health" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "health" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "serverTime" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const MePreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MePreferences" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "mePreferences" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "defaultMapView" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showChords" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showLyrics" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showNotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fontScale" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MePreferencesQuery, MePreferencesQueryVariables>;
export const UpdateMePreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMePreferences" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "baseRev" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "patch" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateUserPreferencesInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateMePreferences" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "baseRev" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "baseRev" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "patch" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "patch" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "defaultMapView" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showChords" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showLyrics" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "showNotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fontScale" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateMePreferencesMutation,
  UpdateMePreferencesMutationVariables
>;
export const SectionNotesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SectionNotes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "versionId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sectionNotes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "versionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "versionId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SectionNoteFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SectionNoteFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SectionNote" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionId" } },
          { kind: "Field", name: { kind: "Name", value: "sectionId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "anchor" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "lineIndex" } },
                { kind: "Field", name: { kind: "Name", value: "wordOffset" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fromLineIndex" },
                },
                { kind: "Field", name: { kind: "Name", value: "toLineIndex" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "text" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SectionNotesQuery, SectionNotesQueryVariables>;
export const SectionNotesBySectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SectionNotesBySection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "versionId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sectionId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sectionNotesBySection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "versionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "versionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sectionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sectionId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SectionNoteFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SectionNoteFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SectionNote" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionId" } },
          { kind: "Field", name: { kind: "Name", value: "sectionId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "anchor" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "lineIndex" } },
                { kind: "Field", name: { kind: "Name", value: "wordOffset" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fromLineIndex" },
                },
                { kind: "Field", name: { kind: "Name", value: "toLineIndex" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "text" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SectionNotesBySectionQuery,
  SectionNotesBySectionQueryVariables
>;
export const CreateSectionNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateSectionNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateSectionNoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createSectionNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SectionNoteFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SectionNoteFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SectionNote" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionId" } },
          { kind: "Field", name: { kind: "Name", value: "sectionId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "anchor" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "lineIndex" } },
                { kind: "Field", name: { kind: "Name", value: "wordOffset" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fromLineIndex" },
                },
                { kind: "Field", name: { kind: "Name", value: "toLineIndex" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "text" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSectionNoteMutation,
  CreateSectionNoteMutationVariables
>;
export const UpdateSectionNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSectionNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "baseRev" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "patch" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateSectionNoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSectionNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "baseRev" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "baseRev" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "patch" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "patch" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "anchor" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lineIndex" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "wordOffset" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fromLineIndex" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "toLineIndex" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSectionNoteMutation,
  UpdateSectionNoteMutationVariables
>;
export const DeleteSectionNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteSectionNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "baseRev" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteSectionNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "baseRev" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "baseRev" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSectionNoteMutation,
  DeleteSectionNoteMutationVariables
>;
export const SongsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Songs" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "cursor" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "songs" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "cursor" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "cursor" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "search" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "songs" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "SongFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "nextCursor" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SongFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Song" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "artist" } },
          { kind: "Field", name: { kind: "Name", value: "defaultVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SongsQuery, SongsQueryVariables>;
export const SongDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Song" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "song" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SongFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SongFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Song" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "artist" } },
          { kind: "Field", name: { kind: "Name", value: "defaultVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SongQuery, SongQueryVariables>;
export const SongVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SongVersions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "songId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "songVersions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "songId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "songId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "VersionListFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionListFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SongVersion" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "songId" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "musicalMeta" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "originalKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "root" } },
                      { kind: "Field", name: { kind: "Name", value: "mode" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tonalQuality" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "bpm" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "timeSignature" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SongVersionsQuery, SongVersionsQueryVariables>;
export const CreateSongDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateSong" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateSongInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createSong" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SongFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SongFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Song" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "artist" } },
          { kind: "Field", name: { kind: "Name", value: "defaultVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "rev" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateSongMutation, CreateSongMutationVariables>;
export const UpdateSongDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSong" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateSongInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSong" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "artist" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "defaultVersionId" },
                },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSongMutation, UpdateSongMutationVariables>;
export const DeleteSongDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteSong" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "baseRev" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteSong" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "baseRev" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "baseRev" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteSongMutation, DeleteSongMutationVariables>;
export const SyncPullDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SyncPull" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SyncPullInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "syncPull" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "changes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "entityType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "entityId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "op" } },
                      { kind: "Field", name: { kind: "Name", value: "rev" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cursorId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "changedAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "entities" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "songs" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "artist" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "defaultVersionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "rev" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "versions" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "songId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "label" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "arrangement" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sections" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "name" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "chordProText",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "notes",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "id",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "sectionId",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "text",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "anchor",
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "type",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "lineIndex",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "wordOffset",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "fromLineIndex",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "toLineIndex",
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sequence" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "sectionId",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "repeat",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "sequenceNotes",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reference" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "youtubeUrl" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "spotifyUrl" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "descriptionIfNoLink",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "musicalMeta" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "originalKey",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "root" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "mode" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "tonalQuality",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "bpm" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "timeSignature",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "rev" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "notes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "versionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "anchor" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "type" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "lineIndex" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "wordOffset" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "fromLineIndex",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "toLineIndex",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "text" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "rev" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "nextCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasMore" } },
                { kind: "Field", name: { kind: "Name", value: "serverTime" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SyncPullQuery, SyncPullQueryVariables>;
export const SyncPushDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SyncPush" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SyncPushInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "syncPush" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applied" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mutationId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "entityId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "newRev" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reason" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "serverTime" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SyncPushMutation, SyncPushMutationVariables>;
export const SongVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SongVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "songVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "songId" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "arrangement" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "chordProText" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "notes" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "text" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "anchor" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "lineIndex",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "wordOffset",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "fromLineIndex",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "toLineIndex",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sequence" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "repeat" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sequenceNotes" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reference" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "youtubeUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "spotifyUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "descriptionIfNoLink" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "musicalMeta" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "originalKey" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "root" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "mode" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "tonalQuality" },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "bpm" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timeSignature" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "ownerUid" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SongVersionQuery, SongVersionQueryVariables>;
export const CreateSongVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateSongVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateSongVersionInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createSongVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "songId" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSongVersionMutation,
  CreateSongVersionMutationVariables
>;
export const UpdateSongVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSongVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateSongVersionInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSongVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "rev" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSongVersionMutation,
  UpdateSongVersionMutationVariables
>;
export const DeleteSongVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteSongVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "baseRev" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteSongVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "baseRev" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "baseRev" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSongVersionMutation,
  DeleteSongVersionMutationVariables
>;
