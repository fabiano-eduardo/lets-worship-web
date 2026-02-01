// Transposition controls component

import { Button, Select, IconChevronUp, IconChevronDown } from "@/shared/ui";
import type { NoteName, KeySignature } from "@/shared/types";
import { VALID_NOTE_NAMES } from "@/shared/types/validation";
import {
  getSemitonesBetween,
  transposeNote,
  shouldUseFlats,
} from "../utils/chordParser";

const NOTE_OPTIONS = VALID_NOTE_NAMES.map((note) => ({
  value: note,
  label: note,
}));

interface TransposeControlsProps {
  originalKey: KeySignature | null;
  targetKey: NoteName | null;
  onTargetKeyChange: (key: NoteName) => void;
}

export function TransposeControls({
  originalKey,
  targetKey,
  onTargetKeyChange,
}: TransposeControlsProps) {
  if (!originalKey) {
    return (
      <div className="transpose-controls">
        <span className="text-muted text-sm">
          Defina a tonalidade original para habilitar a transposição
        </span>
      </div>
    );
  }

  const originalRoot = originalKey.root;
  const currentTarget = targetKey || originalRoot;
  const semitones = getSemitonesBetween(originalRoot, currentTarget);

  const handleTransposeUp = () => {
    const preferFlats = shouldUseFlats(currentTarget);
    const newKey = transposeNote(currentTarget, 1, preferFlats) as NoteName;
    onTargetKeyChange(newKey);
  };

  const handleTransposeDown = () => {
    const preferFlats = shouldUseFlats(currentTarget);
    const newKey = transposeNote(currentTarget, -1, preferFlats) as NoteName;
    onTargetKeyChange(newKey);
  };

  const handleSelectChange = (value: string) => {
    onTargetKeyChange(value as NoteName);
  };

  return (
    <div className="transpose-controls">
      <div className="transpose-controls__key">
        <span className="transpose-controls__label">Tom original:</span>
        <span
          className="transpose-controls__key-display"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {originalRoot}
          {originalKey.type === "tonal"
            ? originalKey.tonalQuality === "minor"
              ? "m"
              : ""
            : ` ${originalKey.mode}`}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div className="transpose-controls__key">
        <span className="transpose-controls__label">Tom atual:</span>
        <div className="transpose-controls__arrows">
          <Button
            variant="secondary"
            size="sm"
            isIcon
            onClick={handleTransposeDown}
            aria-label="Meio tom abaixo"
          >
            <IconChevronDown size={18} />
          </Button>
        </div>
        <Select
          options={NOTE_OPTIONS}
          value={currentTarget}
          onChange={(e) => handleSelectChange(e.target.value)}
          style={{ width: 80, height: 36 }}
        />
        <div className="transpose-controls__arrows">
          <Button
            variant="secondary"
            size="sm"
            isIcon
            onClick={handleTransposeUp}
            aria-label="Meio tom acima"
          >
            <IconChevronUp size={18} />
          </Button>
        </div>
      </div>

      {semitones !== 0 && (
        <span className="text-sm text-muted">
          ({semitones > 0 ? "+" : ""}
          {semitones} st)
        </span>
      )}
    </div>
  );
}
