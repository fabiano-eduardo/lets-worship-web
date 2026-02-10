// Editor for the list of arrangement blocks.
// Supports add, delete, duplicate, reorder (dnd-kit with drag handle).

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ArrangementBlockItem } from "./ArrangementBlockItem";
import { Button, IconPlus } from "@/shared/ui";
import type { ArrangementBlock } from "@/shared/types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface ArrangementBlocksEditorProps {
  blocks: ArrangementBlock[];
  onChange: (blocks: ArrangementBlock[]) => void;
  /** Map of blockId → validation error message */
  validationErrors?: Record<string, string>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ArrangementBlocksEditor({
  blocks,
  onChange,
  validationErrors = {},
}: ArrangementBlocksEditorProps) {
  // Track the id of the last created/duplicated block so we auto-focus it
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(blocks, oldIndex, newIndex).map(
        (block, i) => ({ ...block, order: i }),
      );
      onChange(reordered);
    },
    [blocks, onChange],
  );

  const handleAddBlock = useCallback(() => {
    const newId = crypto.randomUUID();
    const newBlock: ArrangementBlock = {
      id: newId,
      label: null,
      content: "",
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
    setFocusBlockId(newId);
  }, [blocks, onChange]);

  const handleContentChange = useCallback(
    (id: string, content: string) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    },
    [blocks, onChange],
  );

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      onChange(
        blocks.map((b) => (b.id === id ? { ...b, label: label || null } : b)),
      );
    },
    [blocks, onChange],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const source = blocks.find((b) => b.id === id);
      if (!source) return;

      const newId = crypto.randomUUID();
      const duplicate: ArrangementBlock = {
        ...source,
        id: newId,
        label: source.label ? `${source.label} (cópia)` : null,
        order: blocks.length,
      };

      // Insert right after source
      const sourceIndex = blocks.findIndex((b) => b.id === id);
      const updated = [...blocks];
      updated.splice(sourceIndex + 1, 0, duplicate);

      // Re-index orders
      onChange(updated.map((b, i) => ({ ...b, order: i })));
      setFocusBlockId(newId);
    },
    [blocks, onChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i }));
      onChange(updated);
    },
    [blocks, onChange],
  );

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2">
      {blocks.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-muted mb-4">Nenhum bloco criado</p>
          <Button size="sm" onClick={handleAddBlock}>
            <IconPlus size={16} />
            Criar primeiro bloco
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, index) => {
              const shouldFocus = focusBlockId === block.id;
              return (
                <ArrangementBlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  autoFocus={shouldFocus}
                  validationError={validationErrors[block.id]}
                  onContentChange={handleContentChange}
                  onLabelChange={handleLabelChange}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      )}

      {blocks.length > 0 && (
        <Button variant="secondary" size="sm" onClick={handleAddBlock}>
          <IconPlus size={16} />
          Novo bloco
        </Button>
      )}
    </div>
  );
}
