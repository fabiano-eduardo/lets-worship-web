// Content parser and tokenizer for arrangement blocks
//
// Supports inline notes {…} and inline chords […].
// parseContentToLines classifies each line as "note" or "lyric".
// tokenizeChords splits a lyric line into chord/text tokens.

export type LineType = "note" | "lyric";

export interface ParsedLine {
  type: LineType;
  raw: string;
  /** For note lines: the text inside the braces (trimmed). */
  noteText?: string;
}

/**
 * Classify every line of a block's content.
 *
 * A line is classified as a "note" when the **entire** trimmed line is wrapped
 * in `{…}` (curly braces). Everything else is a "lyric" (may contain chords).
 */
export function parseContentToLines(content: string): ParsedLine[] {
  if (!content) return [];

  return content.split("\n").map((raw) => {
    const trimmed = raw.trim();

    // A note line: the whole trimmed content is {…}
    if (
      trimmed.startsWith("{") &&
      trimmed.endsWith("}") &&
      trimmed.length >= 2
    ) {
      const inner = trimmed.slice(1, -1).trim();
      return { type: "note" as const, raw, noteText: inner };
    }

    return { type: "lyric" as const, raw };
  });
}

// ─── Chord tokenizer ───────────────────────────────────────────────────────

export type TokenKind = "chord" | "text";

export interface ContentToken {
  kind: TokenKind;
  value: string;
}

/**
 * Tokenize a single lyric line into alternating text/chord tokens.
 *
 * Chords are delimited by `[…]`. Text is everything outside brackets.
 *
 * Example:
 *   "Eu amo [G]Jesus [Am7/E]meu Senhor"
 *   → [{ kind: "text", value: "Eu amo " },
 *      { kind: "chord", value: "G" },
 *      { kind: "text", value: "Jesus " },
 *      { kind: "chord", value: "Am7/E" },
 *      { kind: "text", value: "meu Senhor" }]
 */
export function tokenizeChords(line: string): ContentToken[] {
  const tokens: ContentToken[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    // Text before the chord
    if (match.index > lastIndex) {
      tokens.push({ kind: "text", value: line.slice(lastIndex, match.index) });
    }
    tokens.push({ kind: "chord", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < line.length) {
    tokens.push({ kind: "text", value: line.slice(lastIndex) });
  }

  return tokens;
}
