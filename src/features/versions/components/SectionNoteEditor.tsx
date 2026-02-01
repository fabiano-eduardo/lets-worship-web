// Section Note Editor - allows adding/editing notes for a section

import { useState } from "react";
import {
  useCreateSectionNote,
  useUpdateSectionNote,
  useDeleteSectionNote,
} from "@/features/songs/hooks/useSectionNotes";
import { Button, IconPlus, IconTrash, IconEdit, useToast } from "@/shared/ui";
import type { SectionNoteEntity, SectionNoteAnchor } from "@/shared/types";

// Simple anchor positions for user selection
type AnchorPosition = "start" | "general" | "end";

// Convert position to anchor object
function positionToAnchor(position: AnchorPosition): SectionNoteAnchor {
  switch (position) {
    case "start":
      return { type: "line", lineIndex: 0 };
    case "end":
      return { type: "line", lineIndex: -1 }; // -1 indicates end
    case "general":
    default:
      return { type: "range", fromLineIndex: 0, toLineIndex: -1 }; // full section
  }
}

// Determine position from anchor (for display)
function anchorToPosition(anchor: SectionNoteAnchor): AnchorPosition {
  if (anchor.type === "line") {
    if (anchor.lineIndex === 0) return "start";
    if (anchor.lineIndex === -1) return "end";
  }
  return "general";
}

interface SectionNoteEditorProps {
  versionId: string;
  sectionId: string;
  sectionNotes: SectionNoteEntity[];
}

export function SectionNoteEditor({
  versionId,
  sectionId,
  sectionNotes,
}: SectionNoteEditorProps) {
  const { showToast } = useToast();
  const createNote = useCreateSectionNote();
  const updateNote = useUpdateSectionNote();
  const deleteNote = useDeleteSectionNote(versionId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notePosition, setNotePosition] = useState<AnchorPosition>("general");

  const handleAdd = async () => {
    if (!noteText.trim()) return;

    try {
      await createNote.mutateAsync({
        versionId,
        sectionId,
        text: noteText.trim(),
        anchor: positionToAnchor(notePosition),
      });
      setNoteText("");
      setNotePosition("general");
      setIsAdding(false);
      showToast("success", "Nota adicionada");
    } catch {
      showToast("error", "Erro ao adicionar nota");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!noteText.trim()) return;

    try {
      await updateNote.mutateAsync({
        id,
        text: noteText.trim(),
        anchor: positionToAnchor(notePosition),
      });
      setEditingNoteId(null);
      setNoteText("");
      showToast("success", "Nota atualizada");
    } catch {
      showToast("error", "Erro ao atualizar nota");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      showToast("success", "Nota removida");
    } catch {
      showToast("error", "Erro ao remover nota");
    }
  };

  const startEditing = (note: SectionNoteEntity) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
    setNotePosition(anchorToPosition(note.anchor));
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setIsAdding(false);
    setNoteText("");
    setNotePosition("general");
  };

  const formatPosition = (position: AnchorPosition): string => {
    switch (position) {
      case "start":
        return "Início";
      case "end":
        return "Final";
      case "general":
        return "Geral";
      default:
        return "Geral";
    }
  };

  const positionOptions: Array<{ value: AnchorPosition; label: string }> = [
    { value: "general", label: "Geral" },
    { value: "start", label: "Início" },
    { value: "end", label: "Final" },
  ];

  return (
    <div className="mt-2 mb-4 p-3 bg-surface rounded-lg">
      {/* Existing notes */}
      {sectionNotes.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {sectionNotes.map((note) => {
            const position = anchorToPosition(note.anchor);
            return (
              <div key={note.id} className="flex items-start gap-2 text-sm">
                {editingNoteId === note.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      className="input w-full text-sm"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={2}
                      placeholder="Texto da nota..."
                      autoFocus
                    />
                    <div className="flex gap-2 items-center">
                      <select
                        className="input text-sm"
                        value={notePosition}
                        onChange={(e) =>
                          setNotePosition(e.target.value as AnchorPosition)
                        }
                      >
                        {positionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdate(note.id)}
                          isLoading={updateNote.isPending}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300 shrink-0"
                      title={formatPosition(position)}
                    >
                      {formatPosition(position)}
                    </span>
                    <span className="flex-1 text-secondary">{note.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      isIcon
                      onClick={() => startEditing(note)}
                      aria-label="Editar"
                    >
                      <IconEdit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      isIcon
                      onClick={() => handleDelete(note.id)}
                      isLoading={deleteNote.isPending}
                      aria-label="Remover"
                    >
                      <IconTrash size={14} />
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add new note form */}
      {isAdding ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="input w-full text-sm"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder="Texto da nota..."
            autoFocus
          />
          <div className="flex gap-2 items-center">
            <select
              className="input text-sm"
              value={notePosition}
              onChange={(e) =>
                setNotePosition(e.target.value as AnchorPosition)
              }
            >
              {positionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                isLoading={createNote.isPending}
              >
                Adicionar
              </Button>
              <Button variant="secondary" size="sm" onClick={cancelEditing}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setEditingNoteId(null);
          }}
        >
          <IconPlus size={14} />
          Adicionar nota
        </Button>
      )}
    </div>
  );
}
