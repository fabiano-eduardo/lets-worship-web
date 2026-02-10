import type { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
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
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
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

export const SongFieldsFragmentDoc = gql`
  fragment SongFields on Song {
    id
    title
    artist
    defaultVersionId
    ownerUid
    createdAt
    updatedAt
    rev
  }
`;
export const VersionListFieldsFragmentDoc = gql`
  fragment VersionListFields on SongVersion {
    id
    songId
    label
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
`;
export const VersionFieldsFragmentDoc = gql`
  fragment VersionFields on SongVersion {
    id
    songId
    label
    arrangement {
      blocks {
        id
        label
        content
        order
        repeat
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
    ownerUid
    createdAt
    updatedAt
    rev
  }
`;
export const HealthDocument = gql`
  query Health {
    health {
      status
      version
      serverTime
    }
  }
`;
export const MePreferencesDocument = gql`
  query MePreferences {
    mePreferences {
      id
      defaultMapView {
        showChords
        showLyrics
        showNotes
        fontScale
      }
      rev
      updatedAt
    }
  }
`;
export const UpdateMePreferencesDocument = gql`
  mutation UpdateMePreferences($patch: UpdateUserPreferencesInput!) {
    updateMePreferences(patch: $patch) {
      ok
      errors {
        message
        field
      }
      userPreferences {
        id
        defaultMapView {
          showChords
          showLyrics
          showNotes
          fontScale
        }
        rev
        updatedAt
      }
    }
  }
`;
export const SongsDocument = gql`
  query Songs($cursor: String, $limit: Int, $search: String) {
    songs(cursor: $cursor, limit: $limit, search: $search) {
      songs {
        ...SongFields
      }
      nextCursor
    }
  }
  ${SongFieldsFragmentDoc}
`;
export const SongDocument = gql`
  query Song($id: ID!) {
    song(id: $id) {
      ...SongFields
    }
  }
  ${SongFieldsFragmentDoc}
`;
export const SongVersionsDocument = gql`
  query SongVersions($songId: ID!) {
    songVersions(songId: $songId) {
      ...VersionListFields
    }
  }
  ${VersionListFieldsFragmentDoc}
`;
export const CreateSongDocument = gql`
  mutation CreateSong($input: CreateSongInput!) {
    createSong(input: $input) {
      ok
      errors {
        message
        field
      }
      song {
        ...SongFields
      }
    }
  }
  ${SongFieldsFragmentDoc}
`;
export const UpdateSongDocument = gql`
  mutation UpdateSong($id: ID!, $input: UpdateSongInput!) {
    updateSong(id: $id, input: $input) {
      ok
      errors {
        message
        field
      }
      song {
        ...SongFields
      }
    }
  }
  ${SongFieldsFragmentDoc}
`;
export const DeleteSongDocument = gql`
  mutation DeleteSong($id: ID!) {
    deleteSong(id: $id) {
      ok
      errors {
        message
        field
      }
      song {
        id
      }
    }
  }
`;
export const SongVersionDocument = gql`
  query SongVersion($id: ID!) {
    songVersion(id: $id) {
      id
      songId
      label
      arrangement {
        blocks {
          id
          label
          content
          order
          repeat
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
      ownerUid
      createdAt
      updatedAt
      rev
    }
  }
`;
export const CreateSongVersionDocument = gql`
  mutation CreateSongVersion($input: CreateSongVersionInput!) {
    createSongVersion(input: $input) {
      ok
      errors {
        message
        field
      }
      songVersion {
        id
        songId
        label
        createdAt
        updatedAt
        rev
      }
    }
  }
`;
export const UpdateSongVersionDocument = gql`
  mutation UpdateSongVersion($id: ID!, $input: UpdateSongVersionInput!) {
    updateSongVersion(id: $id, input: $input) {
      ok
      errors {
        message
        field
      }
      songVersion {
        id
        songId
        label
        updatedAt
        rev
      }
    }
  }
`;
export const DeleteSongVersionDocument = gql`
  mutation DeleteSongVersion($id: ID!) {
    deleteSongVersion(id: $id) {
      ok
      errors {
        message
        field
      }
      songVersion {
        id
      }
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    Health(
      variables?: HealthQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<HealthQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HealthQuery>({
            document: HealthDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Health",
        "query",
        variables,
      );
    },
    MePreferences(
      variables?: MePreferencesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<MePreferencesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MePreferencesQuery>({
            document: MePreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "MePreferences",
        "query",
        variables,
      );
    },
    UpdateMePreferences(
      variables: UpdateMePreferencesMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateMePreferencesMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateMePreferencesMutation>({
            document: UpdateMePreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateMePreferences",
        "mutation",
        variables,
      );
    },
    Songs(
      variables?: SongsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SongsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SongsQuery>({
            document: SongsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Songs",
        "query",
        variables,
      );
    },
    Song(
      variables: SongQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SongQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SongQuery>({
            document: SongDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Song",
        "query",
        variables,
      );
    },
    SongVersions(
      variables: SongVersionsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SongVersionsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SongVersionsQuery>({
            document: SongVersionsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "SongVersions",
        "query",
        variables,
      );
    },
    CreateSong(
      variables: CreateSongMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateSongMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateSongMutation>({
            document: CreateSongDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateSong",
        "mutation",
        variables,
      );
    },
    UpdateSong(
      variables: UpdateSongMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateSongMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateSongMutation>({
            document: UpdateSongDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateSong",
        "mutation",
        variables,
      );
    },
    DeleteSong(
      variables: DeleteSongMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteSongMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteSongMutation>({
            document: DeleteSongDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteSong",
        "mutation",
        variables,
      );
    },
    SongVersion(
      variables: SongVersionQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SongVersionQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SongVersionQuery>({
            document: SongVersionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "SongVersion",
        "query",
        variables,
      );
    },
    CreateSongVersion(
      variables: CreateSongVersionMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateSongVersionMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateSongVersionMutation>({
            document: CreateSongVersionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateSongVersion",
        "mutation",
        variables,
      );
    },
    UpdateSongVersion(
      variables: UpdateSongVersionMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateSongVersionMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateSongVersionMutation>({
            document: UpdateSongVersionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateSongVersion",
        "mutation",
        variables,
      );
    },
    DeleteSongVersion(
      variables: DeleteSongVersionMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteSongVersionMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteSongVersionMutation>({
            document: DeleteSongVersionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteSongVersion",
        "mutation",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
