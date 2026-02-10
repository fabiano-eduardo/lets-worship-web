// Validation utilities for entities

import type {
  Song,
  SongVersion,
  VersionReference,
  KeySignature,
  ArrangementBlock,
  VersionArrangement,
  NoteName,
  TimeSignature,
} from "./index";

// Valid note names for validation
export const VALID_NOTE_NAMES: NoteName[] = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];

export const VALID_TIME_SIGNATURES: TimeSignature[] = [
  "2/4",
  "3/4",
  "4/4",
  "6/8",
  "12/8",
];

export const MODAL_MODES = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
] as const;

// ============================================================================
// Validation Errors
// ============================================================================

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ============================================================================
// Song Validation
// ============================================================================

export function validateSongTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError("title", "O título da música é obrigatório");
  }
  if (title.trim().length > 200) {
    throw new ValidationError(
      "title",
      "O título deve ter no máximo 200 caracteres",
    );
  }
}

export function validateSong(song: Partial<Song>): void {
  if (song.title !== undefined) {
    validateSongTitle(song.title);
  }
}

// ============================================================================
// Version Reference Validation
// ============================================================================

export function validateVersionReference(reference: VersionReference): void {
  const hasYoutube =
    reference.youtubeUrl && reference.youtubeUrl.trim().length > 0;
  const hasSpotify =
    reference.spotifyUrl && reference.spotifyUrl.trim().length > 0;
  const hasDescription =
    reference.descriptionIfNoLink &&
    reference.descriptionIfNoLink.trim().length > 0;

  if (!hasYoutube && !hasSpotify && !hasDescription) {
    throw new ValidationError(
      "reference",
      "É necessário informar um link do YouTube, Spotify, ou uma descrição",
    );
  }

  if (hasYoutube && !isValidUrl(reference.youtubeUrl!)) {
    throw new ValidationError(
      "reference.youtubeUrl",
      "URL do YouTube inválida",
    );
  }

  if (hasSpotify && !isValidUrl(reference.spotifyUrl!)) {
    throw new ValidationError(
      "reference.spotifyUrl",
      "URL do Spotify inválida",
    );
  }
}

// ============================================================================
// Key Signature Validation
// ============================================================================

export function validateKeySignature(key: KeySignature | null): void {
  if (!key) return;

  if (!VALID_NOTE_NAMES.includes(key.root)) {
    throw new ValidationError(
      "musicalMeta.originalKey.root",
      "Nota raiz inválida",
    );
  }

  if (key.type === "tonal") {
    if (!["major", "minor"].includes(key.tonalQuality)) {
      throw new ValidationError(
        "musicalMeta.originalKey.tonalQuality",
        "Qualidade tonal inválida",
      );
    }
  } else if (key.type === "modal") {
    if (!MODAL_MODES.includes(key.mode)) {
      throw new ValidationError(
        "musicalMeta.originalKey.mode",
        "Modo inválido",
      );
    }
  }
}

// ============================================================================
// Block Validation
// ============================================================================

export function validateBlock(block: ArrangementBlock): void {
  if (!block.content || block.content.trim().length === 0) {
    throw new ValidationError(
      "block.content",
      "O conteúdo do bloco é obrigatório",
    );
  }
}

export function validateArrangement(arrangement: VersionArrangement): void {
  if (!arrangement.blocks || !Array.isArray(arrangement.blocks)) {
    throw new ValidationError("arrangement.blocks", "Blocos são obrigatórios");
  }

  for (const block of arrangement.blocks) {
    validateBlock(block);
  }
}

// ============================================================================
// Version Validation
// ============================================================================

export function validateVersionLabel(label: string): void {
  if (!label || label.trim().length === 0) {
    throw new ValidationError("label", "O nome da versão é obrigatório");
  }
  if (label.trim().length > 100) {
    throw new ValidationError(
      "label",
      "O nome da versão deve ter no máximo 100 caracteres",
    );
  }
}

export function validateVersion(version: Partial<SongVersion>): void {
  if (version.label !== undefined) {
    validateVersionLabel(version.label);
  }

  if (version.reference) {
    validateVersionReference(version.reference);
  }

  if (version.musicalMeta?.originalKey) {
    validateKeySignature(version.musicalMeta.originalKey);
  }

  if (version.arrangement) {
    validateArrangement(version.arrangement);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidBpm(bpm: number | null): boolean {
  if (bpm === null) return true;
  return bpm >= 20 && bpm <= 300;
}

export function isValidTimeSignature(
  ts: string | null,
): ts is TimeSignature | null {
  if (ts === null) return true;
  return VALID_TIME_SIGNATURES.includes(ts as TimeSignature);
}
