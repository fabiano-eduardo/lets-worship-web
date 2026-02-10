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
      <div className="page">
        <PageHeader title="Músicas" />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return (
      <div className="page">
        <PageHeader title="Músicas" />
        <EmptyState
          icon={<IconMusic size={48} />}
          title="Erro ao carregar"
          description="Não foi possível carregar as músicas. Tente novamente."
        />
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <PageHeader title="Músicas" />

        {/* Search */}
        <div className="search-box">
          <IconSearch size={20} className="search-box__icon" />
          <input
            type="search"
            className="search-box__input"
            placeholder="Buscar músicas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="songs-list">
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
