// New song page

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateSong } from "../hooks/useSongs";
import { PageHeader, Button, Input, useToast } from "@/shared/ui";
import { ValidationError } from "@/shared/types/validation";

export function NewSongPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createSong = useCreateSong();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const song = await createSong.mutateAsync({
        title,
        artist: artist || null,
      });

      showToast("success", "Música criada!", `"${song.title}" foi adicionada.`);
      navigate({ to: "/songs/$songId", params: { songId: song.id } });
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors({ [error.field]: error.message });
      } else {
        showToast("error", "Erro ao criar música", "Tente novamente.");
      }
    }
  };

  return (
    <>
      <PageHeader title="Nova música" showBack />

      <div className="page">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Título"
            placeholder="Nome da música"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
            autoFocus
          />

          <Input
            label="Artista / Ministério"
            placeholder="Ex: Hillsong, Fernandinho (opcional)"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            error={errors.artist}
          />

          <div className="mt-4">
            <Button type="submit" fullWidth isLoading={createSong.isPending}>
              Criar música
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
