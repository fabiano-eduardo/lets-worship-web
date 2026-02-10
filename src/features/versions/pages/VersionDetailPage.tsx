// Version detail/editor page — ArrangementBlocks model

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { useParams, useNavigate, useLocation } from "@tanstack/react-router";
import { useSong } from "@/features/songs/hooks/useSongs";
import {
  useVersion,
  useUpdateVersion,
  useDeleteVersion,
} from "../hooks/useVersions";
import {
  useIsOfflineAvailable,
  useDownloadOffline,
  useRemoveOffline,
} from "@/features/offline";
import {
  PageHeader,
  Button,
  Input,
  Select,
  Modal,
  ConfirmModal,
  LoadingSpinner,
  EmptyState,
  useToast,
  IconEdit,
  IconTrash,
  IconPin,
  IconPinOff,
  IconMaximize,
  IconMinimize,
  IconSettings,
  IconYoutube,
  IconSpotify,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconX,
} from "@/shared/ui";
import { ArrangementBlocksEditor } from "../components/ArrangementBlocksEditor";
import { SongContentRenderer } from "../components/SongContentRenderer";
import { TransposeControls } from "../components/TransposeControls";
import { validateAllBlocks } from "../utils/validateDelimiters";
import type {
  ArrangementBlock,
  NoteName,
  KeySignature,
  TimeSignature,
  TonalQuality,
  ModalMode,
} from "@/shared/types";
import {
  VALID_NOTE_NAMES,
  VALID_TIME_SIGNATURES,
  MODAL_MODES,
} from "@/shared/types/validation";

// ─── Constants ──────────────────────────────────────────────────────────────

const NOTE_OPTIONS = VALID_NOTE_NAMES.map((note) => ({
  value: note,
  label: note,
}));
const TIME_SIG_OPTIONS = VALID_TIME_SIGNATURES.map((ts) => ({
  value: ts,
  label: ts,
}));
const KEY_TYPE_OPTIONS = [
  { value: "tonal", label: "Tonal" },
  { value: "modal", label: "Modal" },
];
const TONAL_QUALITY_OPTIONS = [
  { value: "major", label: "Maior" },
  { value: "minor", label: "Menor" },
];
const MODE_OPTIONS = MODAL_MODES.map((mode) => ({
  value: mode,
  label: mode.charAt(0).toUpperCase() + mode.slice(1),
}));

type ViewMode = "view" | "edit" | "performance";

// ─── Main component ─────────────────────────────────────────────────────────

export function VersionDetailPage() {
  const { songId, versionId } = useParams({
    from: "/songs/$songId/versions/$versionId",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // ── Data queries ────────────────────────────────────────────────────────
  const { data: song, isLoading: songLoading } = useSong(songId);
  const { data: version, isLoading: versionLoading } = useVersion(versionId);
  const updateVersion = useUpdateVersion();
  const deleteVersion = useDeleteVersion();
  const { data: isOffline } = useIsOfflineAvailable(versionId);
  const downloadOffline = useDownloadOffline();
  const removeOffline = useRemoveOffline();

  // ── View state ──────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [lyricsScale, setLyricsScale] = useState(100);
  const [notesScale, setNotesScale] = useState(100);
  const [targetKey, setTargetKey] = useState<NoteName | null>(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLSpanElement>(null);

  // Visibility preferences
  const [showLyrics, setShowLyrics] = useState(true);
  const [showChords, setShowChords] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showBlockLabels, setShowBlockLabels] = useState(true);

  // ── Meta edit state ─────────────────────────────────────────────────────
  const [editLabel, setEditLabel] = useState("");
  const [editBpm, setEditBpm] = useState("");
  const [editTimeSignature, setEditTimeSignature] = useState<
    TimeSignature | ""
  >("");
  const [editKeyType, setEditKeyType] = useState<"tonal" | "modal">("tonal");
  const [editKeyRoot, setEditKeyRoot] = useState<NoteName | "">("");
  const [editTonalQuality, setEditTonalQuality] =
    useState<TonalQuality>("major");
  const [editMode, setEditMode] = useState<ModalMode>("ionian");

  // ── Arrangement blocks state ────────────────────────────────────────────
  const [arrangementBlocks, setArrangementBlocks] = useState<
    ArrangementBlock[]
  >([]);
  const [hasArrangementChanges, setHasArrangementChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // ── Initialize state when version loads ─────────────────────────────────
  useEffect(() => {
    if (!version) return;

    setEditLabel(version.label);
    setEditBpm(version.musicalMeta?.bpm?.toString() || "");
    setEditTimeSignature(
      (version.musicalMeta?.timeSignature as TimeSignature) || "",
    );

    if (version.musicalMeta?.originalKey) {
      setEditKeyRoot(version.musicalMeta.originalKey.root as NoteName);
      if (version.musicalMeta.originalKey.type === "tonal") {
        setEditKeyType("tonal");
        setEditTonalQuality(
          version.musicalMeta.originalKey.tonalQuality as TonalQuality,
        );
      } else {
        setEditKeyType("modal");
        setEditMode(version.musicalMeta.originalKey.mode as ModalMode);
      }
    }

    // Map server blocks into local state
    const serverBlocks = version.arrangement?.blocks ?? [];
    setArrangementBlocks(
      serverBlocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((b, i) => ({
          id: b.id,
          label: b.label ?? null,
          content: b.content,
          order: i,
          repeat: b.repeat ?? null,
        })),
    );
    setHasArrangementChanges(false);
    setValidationErrors({});
  }, [version?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Presentation scales persistence ─────────────────────────────────────
  useEffect(() => {
    const l = localStorage.getItem("presentation.lyricsScale");
    const n = localStorage.getItem("presentation.notesScale");
    if (l) setLyricsScale(Math.max(75, Math.min(140, Number(l))));
    if (n) setNotesScale(Math.max(70, Math.min(150, Number(n))));

    try {
      const params = new URLSearchParams(
        location.search || window.location.search,
      );
      if (params.get("mode") === "presentation") {
        setViewMode("performance");
      }
    } catch {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem("presentation.lyricsScale", String(lyricsScale));
  }, [lyricsScale]);

  useEffect(() => {
    localStorage.setItem("presentation.notesScale", String(notesScale));
  }, [notesScale]);

  // ── Derived values ──────────────────────────────────────────────────────

  const presentationStyle = useMemo(() => {
    const sharedPx = Math.round((18 * lyricsScale) / 100);
    const notesPx = Math.round((14 * notesScale) / 100);
    return {
      "--presentation-lyrics-font-size": `${sharedPx}px`,
      "--presentation-chords-font-size": `${sharedPx}px`,
      "--presentation-notes-font-size": `${notesPx}px`,
    } as CSSProperties;
  }, [lyricsScale, notesScale]);

  const originalKey: KeySignature | null = useMemo(() => {
    const gqlKey = version?.musicalMeta?.originalKey;
    if (!gqlKey) return null;
    const root = gqlKey.root as NoteName;
    if (gqlKey.type === "tonal") {
      return {
        type: "tonal" as const,
        root,
        tonalQuality: (gqlKey.tonalQuality ?? "major") as TonalQuality,
      };
    }
    return {
      type: "modal" as const,
      root,
      mode: (gqlKey.mode?.toLowerCase() ?? "ionian") as ModalMode,
    };
  }, [version?.musicalMeta?.originalKey]);

  const effectiveTargetKey = targetKey || originalKey?.root || null;

  // ── Loading / error states ──────────────────────────────────────────────

  if (songLoading || versionLoading) {
    return (
      <>
        <PageHeader title="Carregando..." showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (!song || !version) {
    return (
      <>
        <PageHeader title="Não encontrado" showBack backTo="/songs" />
        <div className="page">
          <EmptyState
            title="Versão não encontrada"
            description="Esta versão pode ter sido removida."
            action={
              <Button onClick={() => navigate({ to: "/songs" })}>
                Voltar para músicas
              </Button>
            }
          />
        </div>
      </>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleTogglePin = async () => {
    try {
      if (isOffline) {
        await removeOffline.mutateAsync(versionId);
        showToast("success", "Removido do offline");
      } else {
        await downloadOffline.mutateAsync(versionId);
        showToast("success", "Disponível offline");
      }
    } catch {
      showToast("error", "Erro ao atualizar");
    }
  };

  const handleBlocksChange = (blocks: ArrangementBlock[]) => {
    setArrangementBlocks(blocks);
    setHasArrangementChanges(true);
    // Clear validation errors on change
    setValidationErrors({});
  };

  const handleSaveArrangement = async () => {
    // Validate delimiters before saving
    const errors = validateAllBlocks(arrangementBlocks);
    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      for (const err of errors) {
        errorMap[err.blockId] = err.message;
      }
      setValidationErrors(errorMap);
      showToast("error", "Corrija os erros nos blocos antes de salvar");
      return;
    }

    try {
      await updateVersion.mutateAsync({
        id: version.id,
        input: {
          arrangement: {
            blocks: arrangementBlocks.map((b, i) => ({
              ...b,
              order: i,
            })),
          },
        },
      });
      setHasArrangementChanges(false);
      setValidationErrors({});
      showToast("success", "Arranjo salvo!");
    } catch {
      showToast("error", "Erro ao salvar");
    }
  };

  const handleSaveMeta = async () => {
    let key: KeySignature | null = null;
    if (editKeyRoot) {
      if (editKeyType === "tonal") {
        key = {
          type: "tonal",
          root: editKeyRoot,
          tonalQuality: editTonalQuality,
        };
      } else {
        key = { type: "modal", root: editKeyRoot, mode: editMode };
      }
    }

    try {
      await updateVersion.mutateAsync({
        id: version.id,
        input: {
          label: editLabel.trim(),
          musicalMeta: {
            bpm: editBpm ? parseInt(editBpm, 10) : null,
            timeSignature: editTimeSignature || null,
            originalKey: key,
          },
        },
      });
      setIsMetaModalOpen(false);
      showToast("success", "Informações atualizadas");
    } catch {
      showToast("error", "Erro ao salvar");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVersion.mutateAsync(version.id);
      showToast("success", "Versão removida");
      navigate({ to: "/songs/$songId", params: { songId } });
    } catch {
      showToast("error", "Erro ao remover");
    }
  };

  // ── Performance mode ────────────────────────────────────────────────────

  if (viewMode === "performance") {
    return (
      <div className="performance-mode" style={presentationStyle}>
        <div className="flex items-center justify-between mb-4 px-4">
          <div>
            <h1
              style={{ color: "white" }}
              className="text-xl font-bold performance-mode__title"
            >
              {song.title}
            </h1>
            <p className="performance-mode__subtitle">{version.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <span ref={settingsButtonRef}>
              <Button
                variant="ghost"
                size="sm"
                isIcon
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-label="Ajustes de apresentação"
              >
                <IconSettings size={20} />
              </Button>
            </span>

            <Button
              variant="ghost"
              onClick={() => {
                setViewMode("view");
                setIsSettingsOpen(false);
                navigate({ to: `/songs/${songId}/versions/${versionId}` });
              }}
            >
              <IconMinimize size={20} />
              Sair
            </Button>
          </div>
        </div>

        {/* Visibility toggles */}
        <div className="flex gap-2 mb-4 px-4 flex-wrap">
          <Button
            variant={showLyrics ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowLyrics(!showLyrics)}
          >
            {showLyrics ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            Letras
          </Button>
          <Button
            variant={showChords ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowChords(!showChords)}
          >
            {showChords ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            Acordes
          </Button>
          <Button
            variant={showNotes ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            Notas
          </Button>
          <Button
            variant={showBlockLabels ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowBlockLabels(!showBlockLabels)}
          >
            {showBlockLabels ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            Blocos
          </Button>
        </div>

        {originalKey && (
          <div className="px-4 mb-6">
            <TransposeControls
              originalKey={originalKey}
              targetKey={effectiveTargetKey}
              onTargetKeyChange={setTargetKey}
            />
          </div>
        )}

        <PresentationSettingsPanel
          isOpen={isSettingsOpen}
          anchorRef={settingsButtonRef}
          lyricsScale={lyricsScale}
          notesScale={notesScale}
          onClose={() => setIsSettingsOpen(false)}
          onLyricsChange={setLyricsScale}
          onNotesChange={setNotesScale}
          onReset={() => {
            setLyricsScale(100);
            setNotesScale(100);
          }}
        />

        {/* Linear block rendering */}
        <div className="px-4">
          {arrangementBlocks.map((block, i) => (
            <div key={block.id} className="section-display">
              {showBlockLabels && (block.label?.trim() || `Bloco ${i + 1}`) && (
                <div className="section-display__header">
                  <span className="section-display__name">
                    {block.label?.trim() || `Bloco ${i + 1}`}
                  </span>
                </div>
              )}
              <div className="section-display__content">
                <SongContentRenderer
                  content={block.content}
                  originalKey={originalKey?.root}
                  targetKey={effectiveTargetKey || undefined}
                  showLyrics={showLyrics}
                  showChords={showChords}
                  showNotes={showNotes}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Normal view / edit mode ─────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title={version.label}
        showBack
        backTo={`/songs/${songId}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              isIcon
              onClick={handleTogglePin}
              aria-label={isOffline ? "Remover offline" : "Baixar offline"}
            >
              {isOffline ? <IconPinOff size={20} /> : <IconPin size={20} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isIcon
              onClick={() => setIsMetaModalOpen(true)}
              aria-label="Editar informações"
            >
              <IconEdit size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isIcon
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Excluir"
            >
              <IconTrash size={20} />
            </Button>
          </div>
        }
      />

      <div className="page">
        {/* Song title */}
        <p className="text-secondary mb-4">
          Música: <strong className="text-primary">{song.title}</strong>
        </p>

        {/* Meta info card */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {version.musicalMeta?.originalKey && (
              <div>
                <span className="text-sm text-muted">Tom:</span>
                <span
                  className="ml-2 font-semibold"
                  style={{ color: "var(--color-chord)" }}
                >
                  {version.musicalMeta.originalKey.root}
                  {version.musicalMeta.originalKey.type === "tonal"
                    ? version.musicalMeta.originalKey.tonalQuality === "minor"
                      ? "m"
                      : ""
                    : ` ${version.musicalMeta.originalKey.mode}`}
                </span>
              </div>
            )}
            {version.musicalMeta?.bpm && (
              <div>
                <span className="text-sm text-muted">BPM:</span>
                <span className="ml-2 font-semibold">
                  {version.musicalMeta.bpm}
                </span>
              </div>
            )}
            {version.musicalMeta?.timeSignature && (
              <div>
                <span className="text-sm text-muted">Compasso:</span>
                <span className="ml-2 font-semibold">
                  {version.musicalMeta.timeSignature}
                </span>
              </div>
            )}
          </div>

          {/* Reference links */}
          <div className="flex gap-3 mt-4">
            {version.reference?.youtubeUrl && (
              <a
                href={version.reference.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--secondary button--sm"
              >
                <IconYoutube size={18} />
                YouTube
                <IconExternalLink size={14} />
              </a>
            )}
            {version.reference?.spotifyUrl && (
              <a
                href={version.reference.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--secondary button--sm"
              >
                <IconSpotify size={18} />
                Spotify
                <IconExternalLink size={14} />
              </a>
            )}
          </div>
          {version.reference?.descriptionIfNoLink && (
            <p className="text-sm text-muted mt-3">
              {version.reference.descriptionIfNoLink}
            </p>
          )}
        </div>

        {/* View / Edit / Presentation toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === "view" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("view")}
          >
            <IconEye size={16} />
            Visualizar
          </Button>
          <Button
            variant={viewMode === "edit" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("edit")}
          >
            <IconEdit size={16} />
            Editar
          </Button>
          <div style={{ flex: 1 }} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setViewMode("performance");
              navigate({
                to: `/songs/${songId}/versions/${versionId}?mode=presentation`,
              });
            }}
          >
            <IconMaximize size={16} />
            Modo apresentação
          </Button>
        </div>

        {/* Transposition controls (view mode only) */}
        {originalKey && viewMode === "view" && (
          <TransposeControls
            originalKey={originalKey}
            targetKey={effectiveTargetKey}
            onTargetKeyChange={setTargetKey}
          />
        )}

        {/* Content based on mode */}
        {viewMode === "edit" ? (
          <>
            <ArrangementBlocksEditor
              blocks={arrangementBlocks}
              onChange={handleBlocksChange}
              validationErrors={validationErrors}
            />

            {hasArrangementChanges && (
              <div className="sticky bottom-24 mt-6">
                <Button
                  fullWidth
                  onClick={handleSaveArrangement}
                  isLoading={updateVersion.isPending}
                >
                  Salvar alterações
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {arrangementBlocks.length === 0 ? (
              <EmptyState
                title="Nenhum bloco"
                description="Adicione blocos no modo de edição"
                action={
                  <Button onClick={() => setViewMode("edit")}>
                    <IconEdit size={20} />
                    Editar arranjo
                  </Button>
                }
              />
            ) : (
              arrangementBlocks.map((block) => (
                <div key={block.id} className="section-display">
                  {block.label?.trim() && (
                    <div className="section-display__header">
                      <span className="section-display__name">
                        {block.label.trim()}
                      </span>
                    </div>
                  )}
                  <div className="section-display__content">
                    <SongContentRenderer
                      content={block.content}
                      originalKey={originalKey?.root}
                      targetKey={effectiveTargetKey || undefined}
                    />
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Edit Meta Modal */}
      <Modal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        title="Editar informações"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsMetaModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveMeta}
              isLoading={updateVersion.isPending}
            >
              Salvar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome da versão"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
          />

          <div className="form-row">
            <Input
              label="BPM"
              value={editBpm}
              onChange={(e) => setEditBpm(e.target.value.replace(/\D/g, ""))}
              type="number"
            />
            <Select
              label="Compasso"
              options={[
                { value: "", label: "Selecione..." },
                ...TIME_SIG_OPTIONS,
              ]}
              value={editTimeSignature}
              onChange={(e) =>
                setEditTimeSignature(e.target.value as TimeSignature)
              }
            />
          </div>

          <div className="card p-4">
            <h4 className="text-sm font-medium text-secondary mb-3">
              Tonalidade
            </h4>
            <div className="flex flex-col gap-4">
              <Select
                label="Tipo"
                options={KEY_TYPE_OPTIONS}
                value={editKeyType}
                onChange={(e) =>
                  setEditKeyType(e.target.value as "tonal" | "modal")
                }
              />
              <div className="form-row">
                <Select
                  label="Nota raiz"
                  options={[{ value: "", label: "Nenhuma" }, ...NOTE_OPTIONS]}
                  value={editKeyRoot}
                  onChange={(e) => setEditKeyRoot(e.target.value as NoteName)}
                />
                {editKeyType === "tonal" ? (
                  <Select
                    label="Qualidade"
                    options={TONAL_QUALITY_OPTIONS}
                    value={editTonalQuality}
                    onChange={(e) =>
                      setEditTonalQuality(e.target.value as TonalQuality)
                    }
                    disabled={!editKeyRoot}
                  />
                ) : (
                  <Select
                    label="Modo"
                    options={MODE_OPTIONS}
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as ModalMode)}
                    disabled={!editKeyRoot}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir versão"
        message={`Tem certeza que deseja excluir a versão "${version.label}"?`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={deleteVersion.isPending}
      />
    </>
  );
}

// ─── Presentation Settings Panel (kept from original) ───────────────────────

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

type PresentationSettingsPanelProps = {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement>;
  lyricsScale: number;
  notesScale: number;
  onClose: () => void;
  onLyricsChange: (value: number) => void;
  onNotesChange: (value: number) => void;
  onReset: () => void;
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
};

function PresentationSettingsPanel({
  isOpen,
  anchorRef,
  lyricsScale,
  notesScale,
  onLyricsChange,
  onNotesChange,
  onReset,
  onClose,
}: PresentationSettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  useEffect(() => {
    if (!isOpen || !isDesktop || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = Math.min(360, window.innerWidth - 32, 320);
      const left = Math.min(
        Math.max(rect.right - width, 16),
        window.innerWidth - width - 16,
      );
      const top = rect.bottom + 8;

      setPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, isDesktop, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const firstControl =
      panelRef.current?.querySelector<HTMLElement>("button, input");
    firstControl?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const panelStyle: CSSProperties = isDesktop
    ? {
        position: "fixed",
        top: position?.top ?? 72,
        left: position?.left ?? 16,
        width: position?.width ?? 320,
      }
    : {
        position: "fixed",
        inset: "auto 0 0 0",
        width: "100%",
        borderRadius: "16px 16px 0 0",
      };

  return (
    <>
      <div
        className={`presentation-settings-backdrop ${isDesktop ? "presentation-settings-backdrop--desktop" : "presentation-settings-backdrop--mobile"}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Ajustes de apresentação"
        className={`presentation-settings-panel ${isDesktop ? "presentation-settings-panel--desktop" : "presentation-settings-panel--mobile"}`}
        style={panelStyle}
      >
        <header className="presentation-settings-panel__header">
          <div>
            <p className="presentation-settings-panel__title">
              Ajustes de apresentação
            </p>
            <p className="presentation-settings-panel__subtitle">
              Ajuste o tamanho para seu celular
            </p>
          </div>
          <button
            type="button"
            className="presentation-settings-panel__close"
            aria-label="Fechar ajustes"
            onClick={onClose}
          >
            <IconX size={20} />
          </button>
        </header>

        <section className="presentation-settings-panel__section">
          <div className="presentation-settings-panel__section-header">
            <span>Texto (letra + cifra)</span>
            <span className="presentation-settings-panel__badge">
              {lyricsScale}%
            </span>
          </div>
          <div className="presentation-settings-panel__controls">
            <button
              type="button"
              className="presentation-settings-panel__control-button"
              aria-label="Diminuir texto"
              onClick={() => onLyricsChange(Math.max(75, lyricsScale - 5))}
            >
              A−
            </button>
            <input
              type="range"
              min={75}
              max={140}
              step={5}
              value={lyricsScale}
              onChange={(event) => onLyricsChange(Number(event.target.value))}
              className="presentation-settings-panel__slider"
              aria-label="Escala do texto"
            />
            <button
              type="button"
              className="presentation-settings-panel__control-button"
              aria-label="Aumentar texto"
              onClick={() => onLyricsChange(Math.min(140, lyricsScale + 5))}
            >
              A+
            </button>
          </div>
          <p className="presentation-settings-panel__caption">
            Passo: 5% · 75–140%
          </p>
        </section>

        <section className="presentation-settings-panel__section">
          <div className="presentation-settings-panel__section-header">
            <span>Notas / Observações</span>
            <span className="presentation-settings-panel__badge">
              {notesScale}%
            </span>
          </div>
          <div className="presentation-settings-panel__controls">
            <button
              type="button"
              className="presentation-settings-panel__control-button"
              aria-label="Diminuir notas"
              onClick={() => onNotesChange(Math.max(70, notesScale - 5))}
            >
              A−
            </button>
            <input
              type="range"
              min={70}
              max={150}
              step={5}
              value={notesScale}
              onChange={(event) => onNotesChange(Number(event.target.value))}
              className="presentation-settings-panel__slider"
              aria-label="Escala das notas"
            />
            <button
              type="button"
              className="presentation-settings-panel__control-button"
              aria-label="Aumentar notas"
              onClick={() => onNotesChange(Math.min(150, notesScale + 5))}
            >
              A+
            </button>
          </div>
          <p className="presentation-settings-panel__caption">
            Passo: 5% · 70–150%
          </p>
        </section>

        <footer className="presentation-settings-panel__footer">
          <button
            type="button"
            className="presentation-settings-panel__reset"
            onClick={onReset}
          >
            Resetar
          </button>
          <span className="presentation-settings-panel__footer-note">
            Padrão: 100%
          </span>
        </footer>
      </div>
    </>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}
