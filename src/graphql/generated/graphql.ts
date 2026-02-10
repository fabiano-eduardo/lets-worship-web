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
};

export type Arrangement = {
  blocks: Array<ArrangementBlock>;
};

export type ArrangementBlock = {
  content: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  label?: Maybe<Scalars["String"]["output"]>;
  order: Scalars["Int"]["output"];
  repeat?: Maybe<Scalars["Int"]["output"]>;
};

export type ArrangementBlockInput = {
  content: Scalars["String"]["input"];
  id: Scalars["String"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  order: Scalars["Int"]["input"];
  repeat?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ArrangementInput = {
  blocks: Array<ArrangementBlockInput>;
};

export type CreateSongInput = {
  artist?: InputMaybe<Scalars["String"]["input"]>;
  defaultVersionId?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreateSongVersionInput = {
  arrangement?: InputMaybe<ArrangementInput>;
  label: Scalars["String"]["input"];
  musicalMeta?: InputMaybe<MusicalMetaInput>;
  reference?: InputMaybe<ReferenceInput>;
  songId: Scalars["String"]["input"];
};

export type DeletePayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
};

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
  /** Create a new song */
  createSong: SongPayload;
  /** Create a new song version */
  createSongVersion: SongVersionPayload;
  /** Delete a song (soft delete) */
  deleteSong: SongPayload;
  /** Delete a song map item (soft delete) */
  deleteSongMapItem: DeletePayload;
  /** Delete a song version (soft delete) */
  deleteSongVersion: SongVersionPayload;
  /** Reorder map items for a song version */
  reorderSongMapItems: SongMapItemListPayload;
  /** Update current user preferences */
  updateMePreferences: UserPreferencesPayload;
  /** Update an existing song */
  updateSong: SongPayload;
  /** Update an existing song version */
  updateSongVersion: SongVersionPayload;
  /** Upsert a song map item */
  upsertSongMapItem: SongMapItemPayload;
};

export type MutationCreateSongArgs = {
  input: CreateSongInput;
};

export type MutationCreateSongVersionArgs = {
  input: CreateSongVersionInput;
};

export type MutationDeleteSongArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSongMapItemArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSongVersionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationReorderSongMapItemsArgs = {
  input: ReorderSongMapItemsInput;
};

export type MutationUpdateMePreferencesArgs = {
  patch: UpdateUserPreferencesInput;
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

export type MutationError = {
  field?: Maybe<Scalars["String"]["output"]>;
  message: Scalars["String"]["output"];
};

export type Query = {
  /** Health check endpoint */
  health: HealthStatus;
  /** Get current user preferences */
  mePreferences: UserPreferences;
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
  title: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type SongMapItem = {
  arrangementBlockId: Scalars["String"]["output"];
  createdAt: Scalars["String"]["output"];
  deletedAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  labelOverride?: Maybe<Scalars["String"]["output"]>;
  order: Scalars["Int"]["output"];
  ownerUid: Scalars["String"]["output"];
  rev: Scalars["Int"]["output"];
  schemaVersion: Scalars["Int"]["output"];
  songVersionId: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type SongMapItemListPayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
  songMapItems?: Maybe<Array<SongMapItem>>;
};

export type SongMapItemPayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
  songMapItem?: Maybe<SongMapItem>;
};

export type SongPayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
  song?: Maybe<Song>;
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
  updatedAt: Scalars["String"]["output"];
};

export type SongVersionPayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
  songVersion?: Maybe<SongVersion>;
};

export type SongsResult = {
  nextCursor?: Maybe<Scalars["String"]["output"]>;
  songs: Array<Song>;
};

/** Major or minor quality */
export type TonalQuality = "major" | "minor";

export type UpdateSongInput = {
  artist?: InputMaybe<Scalars["String"]["input"]>;
  defaultVersionId?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSongVersionInput = {
  arrangement?: InputMaybe<ArrangementInput>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  musicalMeta?: InputMaybe<MusicalMetaInput>;
  reference?: InputMaybe<ReferenceInput>;
};

export type UpdateUserPreferencesInput = {
  defaultMapView?: InputMaybe<MapViewPreferencesInput>;
};

export type UpsertSongMapItemInput = {
  arrangementBlockId: Scalars["String"]["input"];
  labelOverride?: InputMaybe<Scalars["String"]["input"]>;
  order: Scalars["Int"]["input"];
  songVersionId: Scalars["String"]["input"];
};

export type UserPreferences = {
  defaultMapView: MapViewPreferences;
  id: Scalars["ID"]["output"];
  rev: Scalars["Int"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type UserPreferencesPayload = {
  errors?: Maybe<Array<MutationError>>;
  ok: Scalars["Boolean"]["output"];
  userPreferences?: Maybe<UserPreferences>;
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
  patch: UpdateUserPreferencesInput;
}>;

export type UpdateMePreferencesMutation = {
  updateMePreferences: {
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
    userPreferences?: {
      id: string;
      rev: number;
      updatedAt: string;
      defaultMapView: {
        showChords: boolean;
        showLyrics: boolean;
        showNotes: boolean;
        fontScale?: number | null;
      };
    } | null;
  };
};

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
    blocks: Array<{
      id: string;
      label?: string | null;
      content: string;
      order: number;
      repeat?: number | null;
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
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
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
};

export type UpdateSongMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSongInput;
}>;

export type UpdateSongMutation = {
  updateSong: {
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
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
};

export type DeleteSongMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteSongMutation = {
  deleteSong: {
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
    song?: { id: string } | null;
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
      blocks: Array<{
        id: string;
        label?: string | null;
        content: string;
        order: number;
        repeat?: number | null;
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
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
    songVersion?: {
      id: string;
      songId: string;
      label: string;
      createdAt: string;
      updatedAt: string;
      rev: number;
    } | null;
  };
};

export type UpdateSongVersionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSongVersionInput;
}>;

export type UpdateSongVersionMutation = {
  updateSongVersion: {
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
    songVersion?: {
      id: string;
      songId: string;
      label: string;
      updatedAt: string;
      rev: number;
    } | null;
  };
};

export type DeleteSongVersionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteSongVersionMutation = {
  deleteSongVersion: {
    ok: boolean;
    errors?: Array<{ message: string; field?: string | null }> | null;
    songVersion?: { id: string } | null;
  };
};

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
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "order" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "repeat" },
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
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "userPreferences" },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
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
  ],
} as unknown as DocumentNode<
  UpdateMePreferencesMutation,
  UpdateMePreferencesMutationVariables
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
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "song" },
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
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "song" },
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
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "song" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteSongMutation, DeleteSongMutationVariables>;
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
                        name: { kind: "Name", value: "blocks" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "label" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "order" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "repeat" },
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
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "songVersion" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "songId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "rev" } },
                    ],
                  },
                },
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
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "songVersion" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "songId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "rev" } },
                    ],
                  },
                },
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
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "ok" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "songVersion" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                    ],
                  },
                },
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
