// Chord parser and transposer utilities

import type { ParsedChord, NoteName } from "@/shared/types";

// Note names in chromatic order (sharps)
const CHROMATIC_SHARPS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
// Note names in chromatic order (flats)
const CHROMATIC_FLATS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// Mapping for enharmonic equivalents
const ENHARMONIC_MAP: Record<string, number> = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

// Regex to parse a chord from text
// Matches: Root (A-G) + optional accidental (#|b) + quality/extensions + optional bass note
const CHORD_REGEX = /^([A-G])([#b]?)([^/]*)?(?:\/([A-G])([#b]?))?$/;

/**
 * Parse a chord string into its components
 */
export function parseChord(chord: string): ParsedChord | null {
  const trimmed = chord.trim();
  const match = trimmed.match(CHORD_REGEX);

  if (!match) {
    return null;
  }

  const [
    ,
    rootLetter,
    rootAccidental,
    quality = "",
    bassLetter,
    bassAccidental,
  ] = match;

  const root = rootLetter + rootAccidental;
  const bass = bassLetter ? bassLetter + (bassAccidental || "") : undefined;

  return {
    root,
    quality: quality.trim(),
    bass,
    original: trimmed,
  };
}

/**
 * Get the chromatic index of a note (0-11)
 */
export function getNoteIndex(note: string): number | null {
  const index = ENHARMONIC_MAP[note];
  return index !== undefined ? index : null;
}

/**
 * Get note name from chromatic index using preferred accidental style
 */
export function getNoteName(index: number, preferFlats: boolean): string {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return preferFlats
    ? CHROMATIC_FLATS[normalizedIndex]
    : CHROMATIC_SHARPS[normalizedIndex];
}

/**
 * Determine if we should use flats based on target key
 * Simple rule: if target contains 'b', use flats; if '#', use sharps; else sharps
 */
export function shouldUseFlats(targetKey: NoteName): boolean {
  if (targetKey.includes("b")) return true;
  if (targetKey.includes("#")) return false;

  // For natural notes, use common key signature preferences
  const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];
  return flatKeys.includes(targetKey);
}

/**
 * Transpose a single note by a number of semitones
 */
export function transposeNote(
  note: string,
  semitones: number,
  preferFlats: boolean,
): string {
  const index = getNoteIndex(note);
  if (index === null) return note; // Unknown note, return as-is

  const newIndex = index + semitones;
  return getNoteName(newIndex, preferFlats);
}

/**
 * Transpose a parsed chord by semitones
 */
export function transposeParsedChord(
  chord: ParsedChord,
  semitones: number,
  preferFlats: boolean,
): string {
  const newRoot = transposeNote(chord.root, semitones, preferFlats);
  const newBass = chord.bass
    ? transposeNote(chord.bass, semitones, preferFlats)
    : undefined;

  let result = newRoot + chord.quality;
  if (newBass) {
    result += "/" + newBass;
  }

  return result;
}

/**
 * Calculate semitones between two notes
 */
export function getSemitonesBetween(from: NoteName, to: NoteName): number {
  const fromIndex = getNoteIndex(from);
  const toIndex = getNoteIndex(to);

  if (fromIndex === null || toIndex === null) return 0;

  let diff = toIndex - fromIndex;
  // Keep in range -6 to 6 (prefer smaller interval)
  while (diff > 6) diff -= 12;
  while (diff < -6) diff += 12;

  return diff;
}

/**
 * Extract all chord tokens from a ChordPro-like text
 * Returns array of { chord, start, end } for each [chord] found
 */
export function extractChordTokens(text: string): Array<{
  chord: string;
  start: number;
  end: number;
}> {
  const tokens: Array<{ chord: string; start: number; end: number }> = [];
  const regex = /\[([^\]]+)\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      chord: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}

/**
 * Transpose all chords in a ChordPro-like text
 */
export function transposeChordProText(
  text: string,
  fromKey: NoteName,
  toKey: NoteName,
): string {
  const semitones = getSemitonesBetween(fromKey, toKey);
  if (semitones === 0) return text;

  const preferFlats = shouldUseFlats(toKey);

  return text.replace(/\[([^\]]+)\]/g, (_, chordStr) => {
    const parsed = parseChord(chordStr);
    if (!parsed) {
      // Unknown chord format, keep as-is
      return `[${chordStr}]`;
    }

    const transposed = transposeParsedChord(parsed, semitones, preferFlats);
    return `[${transposed}]`;
  });
}

/**
 * Parse ChordPro text into lines with chord positions
 * Returns an array of { lyrics: string, chords: Array<{ chord: string, position: number }> }
 */
export interface ChordLine {
  lyrics: string;
  chords: Array<{ chord: string; position: number }>;
}

export function parseChordProLine(line: string): ChordLine {
  const chords: Array<{ chord: string; position: number }> = [];
  let lyrics = "";
  let lyricPosition = 0;
  let i = 0;

  while (i < line.length) {
    if (line[i] === "[") {
      const endBracket = line.indexOf("]", i);
      if (endBracket !== -1) {
        const chord = line.substring(i + 1, endBracket);
        chords.push({ chord, position: lyricPosition });
        i = endBracket + 1;
        continue;
      }
    }
    lyrics += line[i];
    lyricPosition++;
    i++;
  }

  return { lyrics, chords };
}

/**
 * Parse entire ChordPro text into array of ChordLines
 */
export function parseChordProText(text: string): ChordLine[] {
  return text.split("\n").map(parseChordProLine);
}

/**
 * Convert ChordLine to display format (chord line + lyric line)
 * Uses monospace-friendly spacing
 */
export function formatChordLineForDisplay(chordLine: ChordLine): {
  chordRow: string;
  lyricRow: string;
} {
  const { lyrics, chords } = chordLine;

  if (chords.length === 0) {
    return { chordRow: "", lyricRow: lyrics };
  }

  // Build chord row with proper spacing
  let chordRow = "";

  for (const { chord, position } of chords) {
    // Add spaces to reach the position
    while (chordRow.length < position) {
      chordRow += " ";
    }
    chordRow += chord;
  }

  // Ensure lyric row is at least as long as lyrics
  const lyricRow = lyrics;

  return { chordRow, lyricRow };
}

/**
 * Insert a chord at a specific position in ChordPro text
 */
export function insertChordAtPosition(
  text: string,
  chord: string,
  lineIndex: number,
  charPosition: number,
): string {
  const lines = text.split("\n");

  if (lineIndex < 0 || lineIndex >= lines.length) {
    return text;
  }

  const line = lines[lineIndex];
  const chordStr = `[${chord}]`;

  // Adjust position accounting for existing chord brackets
  let actualPosition = 0;
  let textPosition = 0;

  for (let i = 0; i < line.length && textPosition < charPosition; i++) {
    if (line[i] === "[") {
      const end = line.indexOf("]", i);
      if (end !== -1) {
        actualPosition = end + 1;
        i = end;
        continue;
      }
    }
    actualPosition++;
    textPosition++;
  }

  // Insert at the calculated position
  const newLine =
    line.slice(0, actualPosition) + chordStr + line.slice(actualPosition);
  lines[lineIndex] = newLine;

  return lines.join("\n");
}
