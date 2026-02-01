// Section editor component

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Input,
  Modal,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
} from "@/shared/ui";
import { ChordEditor } from "./ChordEditor";
import type { SectionBlock, SequenceItem, NoteName } from "@/shared/types";

interface SectionEditorProps {
  sections: SectionBlock[];
  sequence: SequenceItem[];
  onSectionsChange: (sections: SectionBlock[]) => void;
  onSequenceChange: (sequence: SequenceItem[]) => void;
  originalKey?: NoteName;
  targetKey?: NoteName;
}

const DEFAULT_SECTION_NAMES = [
  "Intro",
  "V1",
  "V2",
  "V3",
  "Pré",
  "Refrão",
  "Ponte",
  "Tag",
  "Final",
];

export function SectionEditor({
  sections,
  sequence,
  onSectionsChange,
  onSequenceChange,
  originalKey,
  targetKey,
}: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<SectionBlock | null>(
    null,
  );
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // Create new section
  const handleCreateSection = () => {
    if (!newSectionName.trim()) return;

    const newSection: SectionBlock = {
      id: uuidv4(),
      name: newSectionName.trim(),
      chordProText: "",
      notes: [],
    };

    onSectionsChange([...sections, newSection]);

    // Auto-add to sequence
    onSequenceChange([...sequence, { sectionId: newSection.id, repeat: 1 }]);

    setNewSectionName("");
    setIsNewSectionModalOpen(false);
    setEditingSection(newSection);
  };

  // Update section content
  const handleUpdateSection = (id: string, updates: Partial<SectionBlock>) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
    if (editingSection?.id === id) {
      setEditingSection({ ...editingSection, ...updates });
    }
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
    onSequenceChange(sequence.filter((s) => s.sectionId !== id));
    if (editingSection?.id === id) {
      setEditingSection(null);
    }
  };

  // Sequence management
  const handleAddToSequence = (sectionId: string) => {
    onSequenceChange([...sequence, { sectionId, repeat: 1 }]);
  };

  const handleRemoveFromSequence = (index: number) => {
    onSequenceChange(sequence.filter((_, i) => i !== index));
  };

  const handleMoveSequenceItem = (index: number, direction: "up" | "down") => {
    const newSequence = [...sequence];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sequence.length) return;

    [newSequence[index], newSequence[newIndex]] = [
      newSequence[newIndex],
      newSequence[index],
    ];
    onSequenceChange(newSequence);
  };

  const handleUpdateRepeat = (index: number, repeat: number) => {
    const newSequence = [...sequence];
    newSequence[index] = { ...newSequence[index], repeat: Math.max(1, repeat) };
    onSequenceChange(newSequence);
  };

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.name || "Unknown";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sections list */}
      <div className="section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section__title mb-0">Seções</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNewSectionModalOpen(true)}
          >
            <IconPlus size={16} />
            Nova seção
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="text-muted mb-4">Nenhuma seção criada</p>
            <Button size="sm" onClick={() => setIsNewSectionModalOpen(true)}>
              Criar primeira seção
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map((section) => (
              <div key={section.id} className="card">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setEditingSection(
                      editingSection?.id === section.id ? null : section,
                    )
                  }
                >
                  <div>
                    <span className="font-semibold">{section.name}</span>
                    {section.chordProText && (
                      <span className="text-sm text-muted ml-2">
                        ({section.chordProText.split("\n").length} linhas)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      isIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToSequence(section.id);
                      }}
                      title="Adicionar à sequência"
                    >
                      <IconPlus size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      isIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      title="Excluir seção"
                    >
                      <IconTrash size={16} />
                    </Button>
                    <IconEdit size={16} className="text-muted" />
                  </div>
                </div>

                {/* Expanded editor */}
                {editingSection?.id === section.id && (
                  <div className="p-4 border-t">
                    <ChordEditor
                      value={section.chordProText}
                      onChange={(value) =>
                        handleUpdateSection(section.id, { chordProText: value })
                      }
                      originalKey={originalKey}
                      targetKey={targetKey}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sequence editor */}
      <div className="section">
        <h3 className="section__title">Sequência do arranjo</h3>

        {sequence.length === 0 ? (
          <p className="text-muted text-sm">
            A sequência será preenchida automaticamente ao criar seções
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sequence.map((item, index) => (
              <div key={index} className="card p-3 flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIcon
                    onClick={() => handleMoveSequenceItem(index, "up")}
                    disabled={index === 0}
                  >
                    <IconChevronUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isIcon
                    onClick={() => handleMoveSequenceItem(index, "down")}
                    disabled={index === sequence.length - 1}
                  >
                    <IconChevronDown size={14} />
                  </Button>
                </div>

                <span className="font-medium flex-1">
                  {getSectionName(item.sectionId)}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Repetir:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={item.repeat || 1}
                    onChange={(e) =>
                      handleUpdateRepeat(index, parseInt(e.target.value) || 1)
                    }
                    className="input input--sm"
                    style={{ width: 60 }}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  isIcon
                  onClick={() => handleRemoveFromSequence(index)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Section Modal */}
      <Modal
        isOpen={isNewSectionModalOpen}
        onClose={() => {
          setIsNewSectionModalOpen(false);
          setNewSectionName("");
        }}
        title="Nova seção"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsNewSectionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSection}
              disabled={!newSectionName.trim()}
            >
              Criar
            </Button>
          </>
        }
      >
        <Input
          label="Nome da seção"
          placeholder="Ex: V1, Refrão, Ponte"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateSection();
            }
          }}
        />
        <div className="mt-4">
          <p className="text-sm text-muted mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SECTION_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                className="px-3 py-1 text-sm bg-tertiary rounded-lg hover:bg-border-light transition"
                onClick={() => setNewSectionName(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
