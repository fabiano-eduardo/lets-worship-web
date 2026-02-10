// Song detail page

import { useState } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { useSong, useUpdateSong, useDeleteSong } from "../hooks/useSongs";
import { useVersions } from "@/features/versions/hooks/useVersions";
import {
  PageHeader,
  Button,
  Input,
  Modal,
  ConfirmModal,
  EmptyState,
  LoadingSpinner,
  useToast,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconStarFilled,
  IconStar,
} from "@/shared/ui";
export function SongDetailPage() {
  const { songId } = useParams({ from: "/songs/$songId" });
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: song, isLoading: songLoading } = useSong(songId);
  const { data: versions, isLoading: versionsLoading } = useVersions(songId);
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (songLoading || versionsLoading) {
    return (
      <>
        <PageHeader title="Carregando..." showBack backTo="/songs" />
        <LoadingSpinner />
      </>
    );
  }

  if (!song) {
    return (
      <>
        <PageHeader title="Música não encontrada" showBack backTo="/songs" />
        <div className="page">
          <EmptyState
            title="Música não encontrada"
            description="Esta música pode ter sido removida."
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

  const handleSetDefaultVersion = async (versionId: string) => {
    try {
      await updateSong.mutateAsync({
        id: song.id,
        input: { defaultVersionId: versionId },
      });
      showToast("success", "Versão padrão atualizada");
    } catch {
      showToast("error", "Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSong.mutateAsync(song.id);
      showToast("success", "Música removida");
      navigate({ to: "/songs" });
    } catch {
      showToast("error", "Erro ao remover música");
    }
  };

  return (
    <>
      <PageHeader
        title={song.title}
        showBack
        backTo="/songs"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              isIcon
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Editar"
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
        {/* Song info */}
        {song.artist && <p className="text-secondary mb-6">{song.artist}</p>}

        {/* Versions section */}
        <div className="section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Versões</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/songs/$songId/versions/new",
                  params: { songId: song.id },
                })
              }
            >
              <IconPlus size={18} />
              Nova versão
            </Button>
          </div>

          {!versions || versions.length === 0 ? (
            <EmptyState
              title="Nenhuma versão"
              description="Adicione uma versão com cifra e arranjo"
              action={
                <Button
                  onClick={() =>
                    navigate({
                      to: "/songs/$songId/versions/new",
                      params: { songId: song.id },
                    })
                  }
                >
                  <IconPlus size={20} />
                  Criar versão
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((version) => (
                <Link
                  key={version.id}
                  to="/songs/$songId/versions/$versionId"
                  params={{ songId: song.id, versionId: version.id }}
                  className="list-card"
                >
                  <div className="list-card__content">
                    <div className="flex items-center gap-2">
                      <span className="list-card__title">{version.label}</span>
                      {version.id === song.defaultVersionId && (
                        <span
                          className="list-card__badge"
                          style={{
                            backgroundColor: "var(--color-warning)",
                            color: "var(--color-text-inverse)",
                          }}
                        >
                          <IconStarFilled size={12} />
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="list-card__meta">
                      {version.musicalMeta?.originalKey && (
                        <span className="list-card__badge">
                          Tom: {version.musicalMeta.originalKey.root}
                          {version.musicalMeta.originalKey.type === "tonal"
                            ? version.musicalMeta.originalKey.tonalQuality ===
                              "minor"
                              ? "m"
                              : ""
                            : ` ${version.musicalMeta.originalKey.mode}`}
                        </span>
                      )}
                      {version.musicalMeta?.bpm && (
                        <span className="list-card__badge">
                          {version.musicalMeta.bpm} BPM
                        </span>
                      )}
                      {version.musicalMeta?.timeSignature && (
                        <span className="list-card__badge">
                          {version.musicalMeta.timeSignature}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {version.id !== song.defaultVersionId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isIcon
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSetDefaultVersion(version.id);
                        }}
                        aria-label="Definir como padrão"
                        title="Definir como padrão"
                      >
                        <IconStar size={18} />
                      </Button>
                    )}
                    <IconChevronRight size={20} className="list-card__arrow" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditSongModal
        song={song}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir música"
        message={`Tem certeza que deseja excluir "${song.title}"? Esta ação também removerá todas as versões.`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={deleteSong.isPending}
      />
    </>
  );
}

// Edit song modal component
function EditSongModal({
  song,
  isOpen,
  onClose,
}: {
  song: { id: string; title: string; artist?: string | null };
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const updateSong = useUpdateSong();

  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!title.trim()) {
      setErrors({ title: "O título é obrigatório" });
      return;
    }

    try {
      await updateSong.mutateAsync({
        id: song.id,
        input: {
          title: title.trim(),
          artist: artist.trim() || null,
        },
      });
      showToast("success", "Música atualizada");
      onClose();
    } catch {
      showToast("error", "Erro ao atualizar");
    }
  };

  // Reset form when modal opens
  useState(() => {
    if (isOpen) {
      setTitle(song.title);
      setArtist(song.artist || "");
      setErrors({});
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar música"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={updateSong.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
        <Input
          label="Artista / Ministério"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Opcional"
        />
      </form>
    </Modal>
  );
}
