// A single arrangement block item with label, content editor, drag handle,
// duplicate and delete actions.

import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SongContentEditor } from "./SongContentEditor";
import { Button, IconTrash } from "@/shared/ui";
import type { ArrangementBlock } from "@/shared/types";

// ─── Drag-handle icon (inline SVG) ─────────────────────────────────────────

function IconGripVertical({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="5" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function IconCopy({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ArrangementBlockItemProps {
  block: ArrangementBlock;
  index: number;
  autoFocus?: boolean;
  validationError?: string;
  onContentChange: (id: string, content: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const ArrangementBlockItem = forwardRef<
  HTMLDivElement,
  ArrangementBlockItemProps
>(function ArrangementBlockItem(
  {
    block,
    index,
    autoFocus = false,
    validationError,
    onContentChange,
    onLabelChange,
    onDuplicate,
    onDelete,
  },
  _ref,
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="card mb-3">
      {/* Header: drag handle + label + actions */}
      <div className="p-3 flex items-center gap-2 border-b border-border-light">
        {/* Drag handle */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-primary p-1"
          aria-label="Arrastar bloco"
          style={{ touchAction: "none" }}
        >
          <IconGripVertical size={20} />
        </button>

        {/* Label input */}
        <input
          type="text"
          value={block.label ?? ""}
          onChange={(e) => onLabelChange(block.id, e.target.value)}
          placeholder={`Bloco ${index + 1}`}
          className="input input--sm flex-1"
          style={{ maxWidth: 200 }}
        />

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          isIcon
          onClick={() => onDuplicate(block.id)}
          aria-label="Duplicar bloco"
          title="Duplicar"
        >
          <IconCopy size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          isIcon
          onClick={() => onDelete(block.id)}
          aria-label="Excluir bloco"
          title="Excluir"
        >
          <IconTrash size={16} />
        </Button>
      </div>

      {/* Content editor */}
      <div className="p-3">
        <SongContentEditor
          value={block.content}
          onChange={(value) => onContentChange(block.id, value)}
          autoFocus={autoFocus}
        />

        {validationError && (
          <p className="text-sm mt-2" style={{ color: "var(--color-error)" }}>
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
});
