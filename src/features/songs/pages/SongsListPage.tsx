// Songs list page

import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSongs } from "../hooks/useSongs";
import {
  PageHeader,
  EmptyState,
  LoadingSpinner,
  Button,
  IconMusic,
  IconPlus,
  IconSearch,
  IconChevronRight,
} from "@/shared/ui";

export function SongsListPage() {
  const navigate = useNavigate();
  const { data: songs, isLoading, error } = useSongs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query),
    );
  }, [songs, searchQuery]);

  // Sort by title
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) =>
      a.title.localeCompare(b.title, "pt-BR"),
    );
  }, [filteredSongs]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Músicas" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Músicas" />
        <div className="page">
          <EmptyState
            icon={<IconMusic size={48} />}
            title="Erro ao carregar"
            description="Não foi possível carregar as músicas. Tente novamente."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Músicas" />

      <div className="page">
        {/* Search */}
        <div className="mb-4" style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <IconSearch size={20} className="text-muted" />
          </span>
          <input
            type="search"
            className="input"
            placeholder="Buscar músicas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>

        {/* Songs list */}
        {sortedSongs.length === 0 ? (
          <EmptyState
            icon={<IconMusic size={48} />}
            title={
              searchQuery ? "Nenhuma música encontrada" : "Nenhuma música ainda"
            }
            description={
              searchQuery
                ? "Tente buscar com outros termos"
                : "Adicione sua primeira música para começar"
            }
            action={
              !searchQuery && (
                <Button onClick={() => navigate({ to: "/songs/new" })}>
                  <IconPlus size={20} />
                  Nova música
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSongs.map((song) => (
              <Link
                key={song.id}
                to="/songs/$songId"
                params={{ songId: song.id }}
                className="list-card"
              >
                <div className="list-card__content">
                  <div className="list-card__title">{song.title}</div>
                  {song.artist && (
                    <div className="list-card__subtitle">{song.artist}</div>
                  )}
                </div>
                <IconChevronRight size={20} className="list-card__arrow" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => navigate({ to: "/songs/new" })}
        aria-label="Nova música"
      >
        <IconPlus size={24} />
      </button>
    </>
  );
}
