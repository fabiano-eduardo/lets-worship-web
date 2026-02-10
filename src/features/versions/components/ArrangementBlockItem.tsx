import { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrangementBlockCard, type BlockAutoFocusTarget } from "./ArrangementBlockCard";
import type { ArrangementBlock } from "@/shared/types";

interface ArrangementBlockItemProps {
  block: ArrangementBlock;
  index: number;
  validationError?: string;
  autoFocusTarget?: BlockAutoFocusTarget | null;
  showDropIndicatorBefore?: boolean;
  showDropIndicatorAfter?: boolean;
  onAutoFocusHandled?: (blockId: string) => void;
  onContentCommit: (id: string, content: string) => void;
  onLabelCommit: (id: string, label: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function DropIndicator({ position }: { position: "before" | "after" }) {
  return (
    <div
      className={`arrangement-drop-indicator arrangement-drop-indicator--${position}`}
      aria-hidden="true"
    />
  );
}

function ArrangementBlockItemComponent({
  block,
  index,
  validationError,
  autoFocusTarget = null,
  showDropIndicatorBefore = false,
  showDropIndicatorAfter = false,
  onAutoFocusHandled,
  onContentCommit,
  onLabelCommit,
  onDuplicate,
  onDelete,
}: ArrangementBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setRefs} style={style} className="arrangement-block-slot">
      {showDropIndicatorBefore && <DropIndicator position="before" />}

      <ArrangementBlockCard
        block={block}
        index={index}
        validationError={validationError}
        isDragging={isDragging}
        autoFocusTarget={autoFocusTarget}
        dragHandleRef={setActivatorNodeRef}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        onAutoFocusHandled={() => onAutoFocusHandled?.(block.id)}
        onContentCommit={onContentCommit}
        onLabelCommit={onLabelCommit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

      {showDropIndicatorAfter && <DropIndicator position="after" />}
    </div>
  );
}

export const ArrangementBlockItem = memo(
  ArrangementBlockItemComponent,
  (prev, next) =>
    prev.block === next.block &&
    prev.index === next.index &&
    prev.validationError === next.validationError &&
    prev.autoFocusTarget === next.autoFocusTarget &&
    prev.showDropIndicatorBefore === next.showDropIndicatorBefore &&
    prev.showDropIndicatorAfter === next.showDropIndicatorAfter &&
    prev.onAutoFocusHandled === next.onAutoFocusHandled &&
    prev.onContentCommit === next.onContentCommit &&
    prev.onLabelCommit === next.onLabelCommit &&
    prev.onDuplicate === next.onDuplicate &&
    prev.onDelete === next.onDelete,
);
