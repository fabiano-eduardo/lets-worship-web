// Renderer for block content in view / presentation mode.
//
// - Lines wrapped in {…} are rendered as discrete note callouts.
// - Chords in […] are highlighted and transposable.
// - Transposition only affects chord tokens, never notes.

import { useMemo } from "react";
import {
  parseContentToLines,
  tokenizeChords,
  type ParsedLine,
  type ContentToken,
} from "../utils/contentParser";
import {
  parseChord,
  transposeParsedChord,
  getSemitonesBetween,
  shouldUseFlats,
} from "../utils/chordParser";
import type { NoteName } from "@/shared/types";

// ─── Public props ───────────────────────────────────────────────────────────

interface SongContentRendererProps {
  content: string;
  originalKey?: NoteName;
  targetKey?: NoteName;
  showLyrics?: boolean;
  showChords?: boolean;
  showNotes?: boolean;
}

export function SongContentRenderer({
  content,
  originalKey,
  targetKey,
  showLyrics = true,
  showChords = true,
  showNotes = true,
}: SongContentRendererProps) {
  const lines = useMemo(() => parseContentToLines(content), [content]);

  const semitones = useMemo(() => {
    if (!originalKey || !targetKey || originalKey === targetKey) return 0;
    return getSemitonesBetween(originalKey, targetKey);
  }, [originalKey, targetKey]);

  const preferFlats = useMemo(
    () => (targetKey ? shouldUseFlats(targetKey) : false),
    [targetKey],
  );

  if (!content) return null;

  return (
    <div className="chord-display">
      {lines.map((line, index) => (
        <LineRenderer
          key={index}
          line={line}
          semitones={semitones}
          preferFlats={preferFlats}
          showLyrics={showLyrics}
          showChords={showChords}
          showNotes={showNotes}
        />
      ))}
    </div>
  );
}

// ─── Internal line renderer ─────────────────────────────────────────────────

interface LineRendererProps {
  line: ParsedLine;
  semitones: number;
  preferFlats: boolean;
  showLyrics: boolean;
  showChords: boolean;
  showNotes: boolean;
}

function LineRenderer({
  line,
  semitones,
  preferFlats,
  showLyrics,
  showChords,
  showNotes,
}: LineRendererProps) {
  // Note line
  if (line.type === "note") {
    if (!showNotes) return null;
    return (
      <div className="section-note px-3 py-2 rounded-lg bg-yellow-500/5 border-l-2 border-yellow-500/40 my-1">
        <span className="section-note-text text-sm text-yellow-100/80">
          {line.noteText}
        </span>
      </div>
    );
  }

  // Lyric line – may have chords
  const tokens = tokenizeChords(line.raw);
  const hasChords = tokens.some((t) => t.kind === "chord");
  const hasText = tokens.some(
    (t) => t.kind === "text" && t.value.trim().length > 0,
  );

  // Nothing to show
  if (!showLyrics && !showChords) return null;
  if (!hasChords && !hasText) {
    // Empty line
    return <div className="chord-line" style={{ height: "1em" }} />;
  }

  // Chords-only line or mixed line: render using chord-row + lyric-row pattern
  const { chordRow, lyricRow } = buildRows(tokens, semitones, preferFlats);

  return (
    <div className="chord-line">
      {showChords && chordRow && (
        <div className="chord-line__chords">{chordRow}</div>
      )}
      {showLyrics && (
        <div className="chord-line__lyrics">{lyricRow || "\u00A0"}</div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildRows(
  tokens: ContentToken[],
  semitones: number,
  preferFlats: boolean,
): { chordRow: string; lyricRow: string } {
  let chordRow = "";
  let lyricRow = "";
  let lyricPos = 0;

  for (const token of tokens) {
    if (token.kind === "text") {
      lyricRow += token.value;
      lyricPos += token.value.length;
    } else {
      // Chord token
      const chordText = transposeToken(token.value, semitones, preferFlats);
      // Pad chord row to current lyric position
      while (chordRow.length < lyricPos) chordRow += " ";
      chordRow += chordText;
    }
  }

  return { chordRow, lyricRow };
}

function transposeToken(
  chord: string,
  semitones: number,
  preferFlats: boolean,
): string {
  if (semitones === 0) return chord;
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  return transposeParsedChord(parsed, semitones, preferFlats);
}
