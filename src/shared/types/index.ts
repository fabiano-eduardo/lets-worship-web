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

// Section note as returned from the server / used in components
export interface SectionNoteEntity {
  id: string;
  versionId: string;
  sectionId: string;
  occurrenceId?: string | null;
  anchor: SectionNoteAnchor;
  text: string;
  createdAt: string;
  updatedAt: string;
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
// Main Entity Types (online-first — no sync fields)
// ============================================================================

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  defaultVersionId: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface SongVersion {
  id: string;
  songId: string;
  label: string;
  reference: VersionReference;
  musicalMeta: MusicalMeta;
  arrangement: VersionArrangement;
  createdAt: string;
  updatedAt: string;
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
