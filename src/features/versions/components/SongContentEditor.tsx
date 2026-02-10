// Simple monospaced textarea wrapper for raw block content editing.
// Preserves content as-is, no sanitisation of {}, [] delimiters.

import { useRef, useEffect } from "react";

interface SongContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SongContentEditor({
  value,
  onChange,
  placeholder = "Digite a letra com [acordes] e {notas}…\n\nExemplo:\n{intro suave}\n[C]Eu amo Je[G]sus\n[Am]Meu Rei e Se[F]nhor",
  autoFocus = false,
}: SongContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="textarea textarea--mono chord-editor__textarea"
      style={{ minHeight: 160, width: "100%" }}
      spellCheck={false}
    />
  );
}
