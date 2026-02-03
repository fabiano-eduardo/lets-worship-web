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
import type { SectionBlock, SongMapItem, NoteName } from "@/shared/types";
import {
  groupMapItems,
  normalizeMapItemsOrder,
  sortMapItems,
} from "@/shared/utils/mapItems";

interface SectionEditorProps {
  sections: SectionBlock[];
  mapItems: SongMapItem[];
  songVersionId: string;
  onSectionsChange: (sections: SectionBlock[]) => void;
  onMapItemsChange: (mapItems: SongMapItem[]) => void;
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
  mapItems,
  songVersionId,
  onSectionsChange,
  onMapItemsChange,
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
    const newItem: SongMapItem = {
      id: crypto.randomUUID(),
      songVersionId,
      sectionId: newSection.id,
      order: mapItems.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onMapItemsChange(normalizeMapItemsOrder([...mapItems, newItem]));

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
    onMapItemsChange(
      normalizeMapItemsOrder(
        mapItems.filter((item) => item.sectionId !== id),
      ),
    );
    if (editingSection?.id === id) {
      setEditingSection(null);
    }
  };

  // Sequence management
  const handleAddToSequence = (sectionId: string) => {
    const newItem: SongMapItem = {
      id: crypto.randomUUID(),
      songVersionId,
      sectionId,
      order: mapItems.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onMapItemsChange(normalizeMapItemsOrder([...mapItems, newItem]));
  };

  const handleRemoveFromSequence = (index: number) => {
    const groups = groupMapItems(sortMapItems(mapItems));
    const group = groups[index];
    if (!group) return;
    const remaining = sortMapItems(mapItems).filter(
      (item) => !group.items.includes(item),
    );
    onMapItemsChange(normalizeMapItemsOrder(remaining));
  };

  const handleMoveSequenceItem = (index: number, direction: "up" | "down") => {
    const groups = groupMapItems(sortMapItems(mapItems));
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= groups.length) return;

    const newGroups = [...groups];
    [newGroups[index], newGroups[newIndex]] = [
      newGroups[newIndex],
      newGroups[index],
    ];
    const reordered = newGroups.flatMap((group) => group.items);
    onMapItemsChange(normalizeMapItemsOrder(reordered));
  };

  const handleUpdateRepeat = (index: number, repeat: number) => {
    const safeRepeat = Math.max(1, repeat);
    const groups = groupMapItems(sortMapItems(mapItems));
    const group = groups[index];
    if (!group) return;

    const currentCount = group.items.length;
    if (safeRepeat === currentCount) return;

    const now = new Date().toISOString();
    let updatedItems = [...mapItems];

    if (safeRepeat > currentCount) {
      const toAdd = safeRepeat - currentCount;
      const additions: SongMapItem[] = Array.from({ length: toAdd }).map(() => ({
        id: crypto.randomUUID(),
        songVersionId,
        sectionId: group.sectionId,
        labelOverride: group.labelOverride,
        order: 0,
        createdAt: now,
        updatedAt: now,
      }));

      const ordered = sortMapItems(updatedItems);
      const insertAfter = group.items[group.items.length - 1];
      const insertIndex = ordered.findIndex((item) => item.id === insertAfter.id);
      const next = [...ordered];
      next.splice(insertIndex + 1, 0, ...additions);
      updatedItems = next;
    } else {
      const toRemove = currentCount - safeRepeat;
      const idsToRemove = new Set(
        group.items.slice(-toRemove).map((item) => item.id),
      );
      updatedItems = sortMapItems(mapItems).filter(
        (item) => !idsToRemove.has(item.id),
      );
    }

    onMapItemsChange(normalizeMapItemsOrder(updatedItems));
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

        {mapItems.length === 0 ? (
          <p className="text-muted text-sm">
            A sequência será preenchida automaticamente ao criar seções
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {groupMapItems(sortMapItems(mapItems), sections).map(
              (group, index) => (
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
                  {group.labelOverride || getSectionName(group.sectionId)}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Repetir:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={group.items.length}
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
            ),
            )}
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
