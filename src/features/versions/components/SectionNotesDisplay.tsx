// Section Notes Display - shows notes for a section in view/performance mode

import type { SectionNoteEntity, SectionNoteAnchor } from "@/shared/types";
import { IconNote } from "@/shared/ui";

// Simple anchor positions for filtering
type AnchorPosition = "start" | "general" | "end" | "all";

// Determine position from anchor object
function anchorToPosition(
  anchor: SectionNoteAnchor,
): "start" | "general" | "end" {
  if (anchor.type === "line") {
    if (anchor.lineIndex === 0) return "start";
    if (anchor.lineIndex === -1) return "end";
  }
  return "general";
}

interface SectionNotesDisplayProps {
  notes: SectionNoteEntity[];
  filter?: AnchorPosition;
  compact?: boolean;
}

export function SectionNotesDisplay({
  notes,
  filter = "all",
  compact = false,
}: SectionNotesDisplayProps) {
  const filteredNotes =
    filter === "all"
      ? notes
      : notes.filter((n) => anchorToPosition(n.anchor) === filter);

  if (filteredNotes.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {filteredNotes.map((note) => (
          <span
            key={note.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-300"
            title={note.text}
          >
            <IconNote size={12} />
            {note.text.length > 30
              ? note.text.substring(0, 30) + "..."
              : note.text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-2 mb-2">
      {filteredNotes.map((note) => (
        <div
          key={note.id}
          className="flex items-start gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500/50"
        >
          <IconNote size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <span className="text-sm text-yellow-100">{note.text}</span>
        </div>
      ))}
    </div>
  );
}
