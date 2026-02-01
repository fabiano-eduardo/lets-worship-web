// ChordPro Editor component

import { useState, useRef, useCallback } from "react";
import { Button, Modal, Input, IconPlus } from "@/shared/ui";
import { ChordDisplay } from "./ChordRenderer";
import type { NoteName } from "@/shared/types";

interface ChordEditorProps {
  value: string;
  onChange: (value: string) => void;
  originalKey?: NoteName;
  targetKey?: NoteName;
  placeholder?: string;
}

export function ChordEditor({
  value,
  onChange,
  originalKey,
  targetKey,
  placeholder = "Digite a letra com acordes entre colchetes...\n\nExemplo:\n[C]Eu amo Je[G]sus\n[Am]Meu Rei e Se[F]nhor",
}: ChordEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isChordModalOpen, setIsChordModalOpen] = useState(false);
  const [chordToInsert, setChordToInsert] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleInsertChord = useCallback(() => {
    if (!chordToInsert.trim()) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = cursorPosition ?? textarea.selectionStart;
    const chordText = `[${chordToInsert.trim()}]`;

    const newValue = value.slice(0, start) + chordText + value.slice(start);
    onChange(newValue);

    setChordToInsert("");
    setIsChordModalOpen(false);

    // Focus back to textarea after modal closes
    setTimeout(() => {
      if (textarea) {
        const newPos = start + chordText.length;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 100);
  }, [chordToInsert, cursorPosition, value, onChange]);

  const openChordModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
    setIsChordModalOpen(true);
  };

  return (
    <div className="chord-editor">
      {/* Toolbar */}
      <div className="chord-editor__toolbar">
        <Button
          variant={isPreview ? "secondary" : "primary"}
          size="sm"
          onClick={() => setIsPreview(false)}
        >
          Editar
        </Button>
        <Button
          variant={isPreview ? "primary" : "secondary"}
          size="sm"
          onClick={() => setIsPreview(true)}
        >
          Visualizar
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          variant="secondary"
          size="sm"
          onClick={openChordModal}
          disabled={isPreview}
        >
          <IconPlus size={16} />
          Acorde
        </Button>
      </div>

      {/* Editor or Preview */}
      {isPreview ? (
        <div className="card p-4">
          {value.trim() ? (
            <ChordDisplay
              chordProText={value}
              originalKey={originalKey}
              targetKey={targetKey}
            />
          ) : (
            <p className="text-muted text-center py-6">
              Nenhum conteúdo para visualizar
            </p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="textarea textarea--mono chord-editor__textarea"
          style={{ minHeight: 200 }}
        />
      )}

      {/* Help text */}
      {!isPreview && (
        <p className="text-sm text-muted">
          Use colchetes para inserir acordes:{" "}
          <code className="bg-tertiary px-1 rounded">[C]</code>,{" "}
          <code className="bg-tertiary px-1 rounded">[Am7]</code>,{" "}
          <code className="bg-tertiary px-1 rounded">[G/B]</code>
        </p>
      )}

      {/* Insert Chord Modal */}
      <Modal
        isOpen={isChordModalOpen}
        onClose={() => setIsChordModalOpen(false)}
        title="Inserir acorde"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsChordModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInsertChord}
              disabled={!chordToInsert.trim()}
            >
              Inserir
            </Button>
          </>
        }
      >
        <Input
          label="Acorde"
          placeholder="Ex: Am7, G/B, C#m"
          value={chordToInsert}
          onChange={(e) => setChordToInsert(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleInsertChord();
            }
          }}
        />
        <p className="text-sm text-muted mt-3">
          Exemplos: C, Cm, C7, Cmaj7, Cadd9, Csus4, C/E, G/B
        </p>
      </Modal>
    </div>
  );
}
