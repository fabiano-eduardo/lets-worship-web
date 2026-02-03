// Core type definitions for Let's worship application

// ============================================================================
// Note and Key Types
// ============================================================================

export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type TonalQuality = "major" | "minor";

export type ModalMode =
  | "ionian"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian";

export type KeySignature =
  | { type: "tonal"; root: NoteName; tonalQuality: TonalQuality }
  | { type: "modal"; root: NoteName; mode: ModalMode };

export type TimeSignature = "2/4" | "3/4" | "4/4" | "6/8" | "12/8";

// ============================================================================
// Sync Fields (for future GraphQL sync)
// ============================================================================

export interface SyncFields {
  remoteId?: string;
  remoteRev?: number;
  dirty?: boolean;
  deleted?: boolean;
  lastSyncedAt?: string; // ISO string
}

// ============================================================================
// Section and Arrangement Types
// ============================================================================

export interface SectionNoteAnchor {
  type: "line" | "range" | "word";
  lineIndex?: number;
  fromLineIndex?: number;
  toLineIndex?: number;
  wordOffset?: number;
}

export interface SectionNote {
  id: string;
  sectionId: string;
  anchor: SectionNoteAnchor;
  text: string;
}

// Standalone SectionNote entity for IndexedDB (separate from inline notes)
export interface SectionNoteEntity {
  id: string;
  versionId: string;
  sectionId: string;
  occurrenceId?: string | null;
  anchor: SectionNoteAnchor;
  text: string;
  createdAt: string;
  updatedAt: string;
  // Sync fields
  remoteId?: string;
  remoteRev?: number;
  dirty?: boolean;
  deleted?: boolean;
}

export interface SectionBlock {
  id: string;
  name: string; // e.g., "V1", "Pré", "R", "Ponte", "Tag"
  chordProText: string; // ChordPro-like format with [Chord] inline
  notes: SectionNote[];
}

export interface SequenceItem {
  sectionId: string;
  repeat?: number; // default 1
  sequenceNotes?: string[];
}

export interface SongMapItem {
  id: string;
  songVersionId: string;
  sectionId: string;
  order: number;
  labelOverride?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VersionArrangement {
  sections: SectionBlock[];
  sequence: SequenceItem[];
}

// ============================================================================
// Reference Types
// ============================================================================

export interface VersionReference {
  youtubeUrl?: string;
  spotifyUrl?: string;
  descriptionIfNoLink?: string; // Required if no link provided
}

export interface MusicalMeta {
  bpm: number | null;
  timeSignature: TimeSignature | null;
  originalKey: KeySignature | null;
}

// ============================================================================
// Main Entity Types
// ============================================================================

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  defaultVersionId: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Sync fields
  remoteId?: string;
  remoteRev?: number;
  dirty?: boolean;
  deleted?: boolean;
  lastSyncedAt?: string;
}

export interface SongVersion {
  id: string;
  songId: string;
  label: string;
  reference: VersionReference;
  musicalMeta: MusicalMeta;
  arrangement: VersionArrangement;
  pinnedOffline: boolean;
  createdAt: string;
  updatedAt: string;
  // Sync fields
  remoteId?: string;
  remoteRev?: number;
  dirty?: boolean;
  deleted?: boolean;
  lastSyncedAt?: string;
}

// ============================================================================
// Form/Input Types (for creating/editing)
// ============================================================================

export interface CreateSongInput {
  title: string;
  artist?: string | null;
}

export interface UpdateSongInput {
  title?: string;
  artist?: string | null;
  defaultVersionId?: string | null;
}

export interface CreateVersionInput {
  songId: string;
  label: string;
  reference: VersionReference;
  musicalMeta: MusicalMeta;
  arrangement?: VersionArrangement;
}

export interface UpdateVersionInput {
  label?: string;
  reference?: VersionReference;
  musicalMeta?: MusicalMeta;
  arrangement?: VersionArrangement;
  pinnedOffline?: boolean;
}

// ============================================================================
// Parsed Chord Types (for transposition)
// ============================================================================

export interface ParsedChord {
  root: string; // e.g., "C", "D#", "Bb"
  quality: string; // e.g., "m", "dim", "aug", "7", "maj7", etc.
  bass?: string; // For slash chords, e.g., "B" in "G/B"
  original: string; // Original string as written
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  songs: Song[];
  versions: SongVersion[];
}

// ============================================================================
// Sync Types (Outbox, SyncState, Conflicts)
// ============================================================================

export type EntityType = "song" | "songVersion" | "sectionNote";
export type OutboxOperation = "UPSERT" | "DELETE";
export type OutboxStatus = "PENDING" | "SENT" | "ACK" | "CONFLICT" | "REJECTED";

export interface OutboxItem {
  id: string; // mutationId (UUID)
  deviceId: string;
  entityType: EntityType;
  op: OutboxOperation;
  entityId: string;
  baseRev?: number;
  payload?: Record<string, unknown>;
  createdAt: string;
  status: OutboxStatus;
  errorMessage?: string;
}

export interface SyncApplySummary {
  upserts: number;
  deletes: number;
  conflicts: number;
  skipped: number;
  upsertsByEntity: Record<EntityType, number>;
  deletesByEntity: Record<EntityType, number>;
  conflictsByEntity: Record<EntityType, number>;
}

export interface SyncProbeState {
  ranAt?: string;
  serverTime?: string;
  serverCursor?: string | null;
  hasMore?: boolean;
  changesCount?: number;
  lastChangeAt?: string;
  error?: string;
}

export interface SyncState {
  id: string; // "main"
  lastCursor?: string | null;
  lastSyncAt?: string;
  lastError?: string;
  lastPushAt?: string;
  lastPullAt?: string;
  lastSyncId?: string;
  lastSyncSource?: "manual" | "auto";
  lastSyncMode?: "normal" | "force_full";
  lastServerTime?: string;
  ownerUid?: string;
  lastProbe?: SyncProbeState;
  lastApplySummary?: SyncApplySummary;
  lastVerifyCounts?: {
    songsCount: number;
    versionsCount: number;
    notesCount: number;
    mapItemsCount: number;
  };
  deviceId: string;
}

export interface SyncConflict {
  id: string;
  entityType: EntityType;
  entityId: string;
  localVersion: Record<string, unknown>;
  remoteVersion: Record<string, unknown>;
  createdAt: string;
  resolved: boolean;
}

// ============================================================================
// User Preferences Types
// ============================================================================

export interface ViewPreferences {
  showLyrics: boolean;
  showChords: boolean;
  showNotes: boolean;
}

export interface UserSettings {
  id: string; // "main"
  globalViewPreferences: ViewPreferences;
  versionViewPreferences?: Record<string, ViewPreferences>; // keyed by versionId
}
