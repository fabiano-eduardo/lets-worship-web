// New version page

import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useSong } from "@/features/songs/hooks/useSongs";
import { useCreateVersion } from "../hooks/useVersions";
import {
  PageHeader,
  Button,
  Input,
  Select,
  useToast,
  LoadingSpinner,
} from "@/shared/ui";
import type {
  KeySignature,
  TimeSignature,
  NoteName,
  TonalQuality,
  ModalMode,
} from "@/shared/types";
import {
  VALID_NOTE_NAMES,
  VALID_TIME_SIGNATURES,
  MODAL_MODES,
} from "@/shared/types/validation";

const NOTE_OPTIONS = VALID_NOTE_NAMES.map((note) => ({
  value: note,
  label: note,
}));
const TIME_SIG_OPTIONS = VALID_TIME_SIGNATURES.map((ts) => ({
  value: ts,
  label: ts,
}));
const KEY_TYPE_OPTIONS = [
  { value: "tonal", label: "Tonal (Maior/Menor)" },
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

export function NewVersionPage() {
  const { songId } = useParams({ from: "/songs/$songId/versions/new" });
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: song, isLoading: songLoading } = useSong(songId);
  const createVersion = useCreateVersion();

  // Form state
  const [label, setLabel] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [descriptionIfNoLink, setDescriptionIfNoLink] = useState("");
  const [bpm, setBpm] = useState("");
  const [timeSignature, setTimeSignature] = useState<TimeSignature | "">("4/4");

  // Key signature state
  const [keyType, setKeyType] = useState<"tonal" | "modal">("tonal");
  const [keyRoot, setKeyRoot] = useState<NoteName | "">("");
  const [tonalQuality, setTonalQuality] = useState<TonalQuality>("major");
  const [mode, setMode] = useState<ModalMode>("ionian");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!label.trim()) {
      setErrors({ label: "O nome da versão é obrigatório" });
      return;
    }

    const hasLink = youtubeUrl.trim() || spotifyUrl.trim();
    if (!hasLink && !descriptionIfNoLink.trim()) {
      setErrors({ reference: "Informe um link ou uma descrição" });
      return;
    }

    // Build key signature
    let originalKey: KeySignature | null = null;
    if (keyRoot) {
      if (keyType === "tonal") {
        originalKey = { type: "tonal", root: keyRoot, tonalQuality };
      } else {
        originalKey = { type: "modal", root: keyRoot, mode };
      }
    }

    try {
      const version = await createVersion.mutateAsync({
        songId,
        label: label.trim(),
        reference: {
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          descriptionIfNoLink: descriptionIfNoLink.trim() || undefined,
        },
        musicalMeta: {
          bpm: bpm ? parseInt(bpm, 10) : null,
          timeSignature: timeSignature || null,
          originalKey,
        },
      });

      showToast("success", "Versão criada!");
      navigate({
        to: "/songs/$songId/versions/$versionId",
        params: { songId, versionId: version.id },
      });
    } catch (error) {
      showToast("error", "Erro ao criar versão", String(error));
    }
  };

  if (songLoading) {
    return (
      <>
        <PageHeader title="Nova versão" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (!song) {
    navigate({ to: "/songs" });
    return null;
  }

  return (
    <>
      <PageHeader title="Nova versão" showBack backTo={`/songs/${songId}`} />

      <div className="page">
        <p className="text-secondary mb-6">
          Criando versão para:{" "}
          <strong className="text-primary">{song.title}</strong>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic info */}
          <div className="section">
            <h3 className="section__title">Informações básicas</h3>
            <Input
              label="Nome da versão"
              placeholder='Ex: "Ao Vivo 2022", "Versão da igreja"'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              error={errors.label}
              required
              autoFocus
            />
          </div>

          {/* Reference links */}
          <div className="section">
            <h3 className="section__title">Referência</h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Link do YouTube"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                type="url"
              />
              <Input
                label="Link do Spotify"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                type="url"
              />
              <Input
                label="Descrição (se não tiver link)"
                placeholder="Ex: Versão própria do ministério"
                value={descriptionIfNoLink}
                onChange={(e) => setDescriptionIfNoLink(e.target.value)}
                helpText="Obrigatório se não informar nenhum link"
              />
              {errors.reference && (
                <span className="error-message">{errors.reference}</span>
              )}
            </div>
          </div>

          {/* Musical metadata */}
          <div className="section">
            <h3 className="section__title">Informações musicais</h3>
            <div className="flex flex-col gap-4">
              <div className="form-row">
                <Input
                  label="BPM"
                  placeholder="Ex: 120"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value.replace(/\D/g, ""))}
                  type="number"
                  min={20}
                  max={300}
                />
                <Select
                  label="Compasso"
                  options={TIME_SIG_OPTIONS}
                  value={timeSignature}
                  onChange={(e) =>
                    setTimeSignature(e.target.value as TimeSignature)
                  }
                />
              </div>

              {/* Key signature */}
              <div className="card p-4">
                <h4 className="text-sm font-medium text-secondary mb-3">
                  Tonalidade
                </h4>
                <div className="flex flex-col gap-4">
                  <Select
                    label="Tipo"
                    options={KEY_TYPE_OPTIONS}
                    value={keyType}
                    onChange={(e) =>
                      setKeyType(e.target.value as "tonal" | "modal")
                    }
                  />
                  <div className="form-row">
                    <Select
                      label="Nota raiz"
                      options={[
                        { value: "", label: "Selecione..." },
                        ...NOTE_OPTIONS,
                      ]}
                      value={keyRoot}
                      onChange={(e) => setKeyRoot(e.target.value as NoteName)}
                    />
                    {keyType === "tonal" ? (
                      <Select
                        label="Qualidade"
                        options={TONAL_QUALITY_OPTIONS}
                        value={tonalQuality}
                        onChange={(e) =>
                          setTonalQuality(e.target.value as TonalQuality)
                        }
                        disabled={!keyRoot}
                      />
                    ) : (
                      <Select
                        label="Modo"
                        options={MODE_OPTIONS}
                        value={mode}
                        onChange={(e) => setMode(e.target.value as ModalMode)}
                        disabled={!keyRoot}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" fullWidth isLoading={createVersion.isPending}>
              Criar versão
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
