import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrangementBlockItem } from "./ArrangementBlockItem";
import {
  ArrangementBlockCard,
  type BlockAutoFocusTarget,
} from "./ArrangementBlockCard";
import { Button, IconPlus } from "@/shared/ui";
import type { ArrangementBlock } from "@/shared/types";

interface ArrangementBlocksEditorProps {
  blocks: ArrangementBlock[];
  onChange: (blocks: ArrangementBlock[]) => void;
  validationErrors?: Record<string, string>;
}

interface FocusRequest {
  id: string;
  target: BlockAutoFocusTarget;
}

export function ArrangementBlocksEditor({
  blocks,
  onChange,
  validationErrors = {},
}: ArrangementBlocksEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => blocks.map((block) => block.id), [blocks]);

  const activeIndex = useMemo(
    () => (activeId ? blocks.findIndex((block) => block.id === activeId) : -1),
    [activeId, blocks],
  );

  const overIndex = useMemo(
    () => (overId ? blocks.findIndex((block) => block.id === overId) : -1),
    [overId, blocks],
  );

  const activeBlock = useMemo(
    () => (activeId ? blocks.find((block) => block.id === activeId) ?? null : null),
    [activeId, blocks],
  );

  useEffect(() => {
    if (!scrollTargetId) return;

    window.requestAnimationFrame(() => {
      const blockElement = document.getElementById(
        `arrangement-block-${scrollTargetId}`,
      );

      blockElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    setScrollTargetId(null);
  }, [scrollTargetId, blocks.length]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setOverId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      resetDragState();
    },
    [resetDragState],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
            ...block,
            order: index,
          }));

          onChange(reordered);
        }
      }

      resetDragState();
    },
    [blocks, onChange, resetDragState],
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
    setFocusRequest({ id: newId, target: "title" });
    setScrollTargetId(newId);
  }, [blocks, onChange]);

  const handleContentCommit = useCallback(
    (id: string, content: string) => {
      onChange(
        blocks.map((block) => (block.id === id ? { ...block, content } : block)),
      );
    },
    [blocks, onChange],
  );

  const handleLabelCommit = useCallback(
    (id: string, label: string) => {
      onChange(
        blocks.map((block) =>
          block.id === id ? { ...block, label: label.trim() || null } : block,
        ),
      );
    },
    [blocks, onChange],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const sourceIndex = blocks.findIndex((block) => block.id === id);
      if (sourceIndex === -1) return;

      const source = blocks[sourceIndex];
      const newId = crypto.randomUUID();

      const duplicate: ArrangementBlock = {
        ...source,
        id: newId,
        order: sourceIndex + 1,
      };

      const updated = [...blocks];
      updated.splice(sourceIndex + 1, 0, duplicate);

      onChange(updated.map((block, index) => ({ ...block, order: index })));
      setFocusRequest({
        id: newId,
        target: source.label?.trim() ? "content" : "title",
      });
      setScrollTargetId(newId);
    },
    [blocks, onChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = blocks
        .filter((block) => block.id !== id)
        .map((block, index) => ({ ...block, order: index }));

      onChange(updated);

      setFocusRequest((current) => (current?.id === id ? null : current));
    },
    [blocks, onChange],
  );

  const handleAutoFocusHandled = useCallback((id: string) => {
    setFocusRequest((current) => (current?.id === id ? null : current));
  }, []);

  return (
    <div className="arrangement-blocks-editor">
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => {
              const isDropTarget = activeId && overId && activeId !== overId && overId === block.id;
              const showDropIndicatorBefore =
                Boolean(isDropTarget) && activeIndex > -1 && overIndex > -1 && activeIndex > overIndex;
              const showDropIndicatorAfter =
                Boolean(isDropTarget) && activeIndex > -1 && overIndex > -1 && activeIndex < overIndex;

              return (
                <ArrangementBlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  validationError={validationErrors[block.id]}
                  autoFocusTarget={
                    focusRequest?.id === block.id ? focusRequest.target : null
                  }
                  showDropIndicatorBefore={showDropIndicatorBefore}
                  showDropIndicatorAfter={showDropIndicatorAfter}
                  onAutoFocusHandled={handleAutoFocusHandled}
                  onContentCommit={handleContentCommit}
                  onLabelCommit={handleLabelCommit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeBlock ? (
              <div className="arrangement-drag-overlay" aria-hidden="true">
                <ArrangementBlockCard
                  block={activeBlock}
                  index={Math.max(activeIndex, 0)}
                  isDragOverlay
                  onContentCommit={() => undefined}
                  onLabelCommit={() => undefined}
                  onDuplicate={() => undefined}
                  onDelete={() => undefined}
                />
              </div>
            ) : null}
          </DragOverlay>
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
