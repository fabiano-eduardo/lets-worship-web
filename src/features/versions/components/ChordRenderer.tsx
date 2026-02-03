// ChordPro renderer component

import { useMemo } from "react";
import {
  parseChordProText,
  formatChordLineForDisplay,
  transposeChordProText,
} from "../utils/chordParser";
import type { NoteName } from "@/shared/types";

interface ChordDisplayProps {
  chordProText: string;
  originalKey?: NoteName;
  targetKey?: NoteName;
  fontSize?: "normal" | "large" | "xlarge";
  showLyrics?: boolean;
  showChords?: boolean;
}

export function ChordDisplay({
  chordProText,
  originalKey,
  targetKey,
  fontSize = "normal",
  showLyrics = true,
  showChords = true,
}: ChordDisplayProps) {
  // Apply transposition if needed
  const displayText = useMemo(() => {
    if (originalKey && targetKey && originalKey !== targetKey) {
      return transposeChordProText(chordProText, originalKey, targetKey);
    }
    return chordProText;
  }, [chordProText, originalKey, targetKey]);

  // Parse into chord lines
  const lines = useMemo(() => {
    return parseChordProText(displayText);
  }, [displayText]);

  const sizeClass =
    fontSize === "large"
      ? "chord-display--large"
      : fontSize === "xlarge"
        ? "chord-display--xlarge"
        : "";

  // If neither lyrics nor chords are shown, render nothing
  if (!showLyrics && !showChords) {
    return null;
  }

  return (
    <div className={`chord-display ${sizeClass}`}>
      {lines.map((line, index) => {
        const { chordRow, lyricRow } = formatChordLineForDisplay(line);

        // Skip empty lines (but keep them for spacing)
        if (!chordRow && !lyricRow) {
          return (
            <div key={index} className="chord-line" style={{ height: "1em" }} />
          );
        }

        return (
          <div key={index} className="chord-line">
            {showChords && chordRow && (
              <div className="chord-line__chords">{chordRow}</div>
            )}
            {showLyrics && (
              <div className="chord-line__lyrics">{lyricRow || "\u00A0"}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SectionDisplayProps {
  name: string;
  chordProText: string;
  notes?: Array<{ text: string }>;
  originalKey?: NoteName;
  targetKey?: NoteName;
  fontSize?: "normal" | "large" | "xlarge";
  showLyrics?: boolean;
  showChords?: boolean;
  showSectionName?: boolean;
}

export function SectionDisplay({
  name,
  chordProText,
  notes = [],
  originalKey,
  targetKey,
  fontSize = "normal",
  showLyrics = true,
  showChords = true,
  showSectionName = true,
}: SectionDisplayProps) {
  return (
    <div className="section-display">
      <div className="section-display__header">
        {showSectionName === false ? (
          <></>
        ) : (
          <span className="section-display__name">{name}</span>
        )}

        {notes.length > 0 && (
          <div className="section-display__notes">
            {notes.map((note, i) => (
              <span key={i} className="section-note">
                {note.text}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className={
          (!showLyrics && !showChords) || (!chordProText && !showChords)
            ? "display__content__no__content"
            : "section-display__content"
        }
      >
        <ChordDisplay
          chordProText={chordProText}
          originalKey={originalKey}
          targetKey={targetKey}
          fontSize={fontSize}
          showLyrics={showLyrics}
          showChords={showChords}
        />
      </div>
    </div>
  );
}

interface SequenceDisplayProps {
  sequence: Array<{
    sectionId: string;
    sectionName: string;
    repeat?: number;
    notes?: string[];
  }>;
}

export function SequenceDisplay({ sequence }: SequenceDisplayProps) {
  if (sequence.length === 0) return null;

  return (
    <div className="sequence-display">
      {sequence.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="sequence-item">
            {item.sectionName}
            {item.repeat && item.repeat > 1 && (
              <span className="sequence-item__repeat">×{item.repeat}</span>
            )}
          </span>
          {index < sequence.length - 1 && (
            <span className="sequence-arrow">→</span>
          )}
        </span>
      ))}
    </div>
  );
}
