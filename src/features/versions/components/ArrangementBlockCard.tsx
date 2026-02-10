import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { Button, IconCopy, IconEdit, IconTrash } from "@/shared/ui";
import type { ArrangementBlock } from "@/shared/types";

export type BlockAutoFocusTarget = "title" | "content";

interface ArrangementBlockCardProps {
  block: ArrangementBlock;
  index: number;
  validationError?: string;
  isDragging?: boolean;
  isDragOverlay?: boolean;
  autoFocusTarget?: BlockAutoFocusTarget | null;
  dragHandleRef?: (node: HTMLButtonElement | null) => void;
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
  onAutoFocusHandled?: () => void;
  onContentCommit: (id: string, content: string) => void;
  onLabelCommit: (id: string, label: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

interface DragHandleButtonProps {
  blockLabel: string;
  isDragging?: boolean;
  isDisabled?: boolean;
  dragHandleRef?: (node: HTMLButtonElement | null) => void;
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
}

function IconGripVertical({ size = 16 }: { size?: number }) {
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
      aria-hidden="true"
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

function DragHandleButton({
  blockLabel,
  isDragging = false,
  isDisabled = false,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
}: DragHandleButtonProps) {
  return (
    <button
      type="button"
      ref={dragHandleRef}
      className={`arrangement-handle-button ${isDragging ? "is-dragging" : ""}`.trim()}
      aria-label={`Arrastar ${blockLabel}`}
      title="Arrastar bloco"
      style={{ touchAction: "none" }}
      disabled={isDisabled}
      {...dragHandleAttributes}
      {...dragHandleListeners}
    >
      <IconGripVertical size={16} />
    </button>
  );
}

function BlockIndexBadge({ index }: { index: number }) {
  return <span className="arrangement-block-card__index">#{index + 1}</span>;
}

interface InlineEditableTitleProps {
  value: string;
  placeholder: string;
  autoFocus?: boolean;
  onCommit: (value: string) => void;
  onAutoFocusHandled?: () => void;
  disabled?: boolean;
}

function InlineEditableTitle({
  value,
  placeholder,
  autoFocus = false,
  onCommit,
  onAutoFocusHandled,
  disabled = false,
}: InlineEditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    setIsEditing(true);
  }, [autoFocus, disabled]);

  useEffect(() => {
    if (!isEditing || disabled) return;
    inputRef.current?.focus();
    inputRef.current?.select();

    if (autoFocus) {
      onAutoFocusHandled?.();
    }
  }, [autoFocus, isEditing, disabled, onAutoFocusHandled]);

  const startEditing = useCallback(() => {
    if (disabled) return;
    setDraftValue(value);
    setIsEditing(true);
  }, [disabled, value]);

  const commit = useCallback(() => {
    const normalized = draftValue.trim();
    onCommit(normalized);
    setIsEditing(false);
  }, [draftValue, onCommit]);

  const cancel = useCallback(() => {
    skipBlurCommitRef.current = true;
    setDraftValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      }
    },
    [cancel, commit],
  );

  const displayValue = value.trim() || placeholder;

  if (isEditing && !disabled) {
    return (
      <input
        ref={inputRef}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={() => {
          if (skipBlurCommitRef.current) {
            skipBlurCommitRef.current = false;
            return;
          }
          commit();
        }}
        onKeyDown={handleKeyDown}
        className="arrangement-inline-title__input"
        aria-label="Título do bloco"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="arrangement-inline-title__display">
      <button
        type="button"
        className="arrangement-inline-title__trigger"
        onClick={startEditing}
        aria-label="Editar título do bloco"
        title="Editar título"
        disabled={disabled}
      >
        <span
          className={`arrangement-inline-title__text ${value.trim() ? "" : "is-placeholder"}`.trim()}
          title={displayValue}
        >
          {displayValue}
        </span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        isIcon
        className="arrangement-inline-title__edit-button"
        onClick={startEditing}
        aria-label="Editar título"
        title="Editar título"
        disabled={disabled}
      >
        <IconEdit size={14} />
      </Button>
    </div>
  );
}

interface HeaderActionsProps {
  blockId: string;
  disabled?: boolean;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function HeaderActions({
  blockId,
  disabled = false,
  onDuplicate,
  onDelete,
}: HeaderActionsProps) {
  if (disabled) {
    return <div className="arrangement-block-card__actions is-hidden" />;
  }

  return (
    <div className="arrangement-block-card__actions" aria-label="Ações do bloco">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        isIcon
        className="arrangement-header-action"
        onClick={() => onDuplicate(blockId)}
        aria-label="Duplicar bloco"
        title="Duplicar bloco"
      >
        <IconCopy size={16} />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        isIcon
        className="arrangement-header-action arrangement-header-action--danger"
        onClick={() => onDelete(blockId)}
        aria-label="Excluir bloco"
        title="Excluir bloco"
      >
        <IconTrash size={16} />
      </Button>
    </div>
  );
}

interface BlockBodyProps {
  blockId: string;
  content: string;
  validationError?: string;
  autoFocusTarget?: BlockAutoFocusTarget | null;
  onAutoFocusHandled?: () => void;
  onCommit: (id: string, content: string) => void;
  disabled?: boolean;
}

function BlockBody({
  blockId,
  content,
  validationError,
  autoFocusTarget,
  onAutoFocusHandled,
  onCommit,
  disabled = false,
}: BlockBodyProps) {
  const [draftContent, setDraftContent] = useState(content);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

  const flushCommit = useCallback(
    (nextValue: string) => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = null;

      if (nextValue !== content) {
        onCommit(blockId, nextValue);
      }
    },
    [blockId, content, onCommit],
  );

  const scheduleCommit = useCallback(
    (nextValue: string) => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        onCommit(blockId, nextValue);
        debounceTimerRef.current = null;
      }, 260);
    },
    [blockId, onCommit],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setDraftContent(nextValue);
      scheduleCommit(nextValue);
    },
    [scheduleCommit],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoFocusTarget !== "content" || disabled) return;

    textAreaRef.current?.focus();

    const len = textAreaRef.current?.value.length ?? 0;
    textAreaRef.current?.setSelectionRange(len, len);

    onAutoFocusHandled?.();
  }, [autoFocusTarget, disabled, onAutoFocusHandled]);

  return (
    <div className="arrangement-block-card__body">
      <textarea
        ref={textAreaRef}
        value={draftContent}
        onChange={handleChange}
        onBlur={(event) => flushCommit(event.target.value)}
        placeholder="Use [C] para acordes e {nota} para notas de execução."
        className="textarea arrangement-block-card__textarea"
        spellCheck={false}
        disabled={disabled}
        aria-label="Conteúdo do bloco"
      />

      {validationError && <p className="arrangement-block-card__error">{validationError}</p>}
    </div>
  );
}

export function ArrangementBlockCard({
  block,
  index,
  validationError,
  isDragging = false,
  isDragOverlay = false,
  autoFocusTarget = null,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
  onAutoFocusHandled,
  onContentCommit,
  onLabelCommit,
  onDuplicate,
  onDelete,
}: ArrangementBlockCardProps) {
  const placeholder = useMemo(() => `Bloco ${index + 1}`, [index]);

  return (
    <article
      id={`arrangement-block-${block.id}`}
      className={`arrangement-block-card ${isDragging ? "is-dragging" : ""} ${isDragOverlay ? "is-overlay" : ""}`.trim()}
    >
      <header className="arrangement-block-card__header">
        <DragHandleButton
          blockLabel={block.label?.trim() || placeholder}
          isDragging={isDragging || isDragOverlay}
          isDisabled={isDragOverlay}
          dragHandleRef={dragHandleRef}
          dragHandleAttributes={dragHandleAttributes}
          dragHandleListeners={dragHandleListeners}
        />

        <div className="arrangement-block-card__title-zone">
          <BlockIndexBadge index={index} />

          <InlineEditableTitle
            value={block.label?.trim() || ""}
            placeholder={placeholder}
            autoFocus={autoFocusTarget === "title"}
            onAutoFocusHandled={onAutoFocusHandled}
            disabled={isDragOverlay}
            onCommit={(value) => onLabelCommit(block.id, value)}
          />
        </div>

        <HeaderActions
          blockId={block.id}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          disabled={isDragOverlay}
        />
      </header>

      <BlockBody
        blockId={block.id}
        content={block.content}
        validationError={validationError}
        autoFocusTarget={autoFocusTarget}
        onAutoFocusHandled={onAutoFocusHandled}
        onCommit={onContentCommit}
        disabled={isDragOverlay}
      />
    </article>
  );
}
