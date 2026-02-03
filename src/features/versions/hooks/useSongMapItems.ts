// Song map items hooks

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { songMapItemsRepository } from "../repositories/songMapItemsRepository";
import type { SongMapItem } from "@/shared/types";

export const songMapItemsKeys = {
  all: ["songMapItems"] as const,
  byVersion: (versionId: string) =>
    [...songMapItemsKeys.all, "byVersion", versionId] as const,
  detail: (id: string) => [...songMapItemsKeys.all, "detail", id] as const,
};

export function useSongMapItems(versionId: string) {
  return useQuery({
    queryKey: songMapItemsKeys.byVersion(versionId),
    queryFn: () => songMapItemsRepository.getByVersion(versionId),
    enabled: !!versionId,
  });
}

export function useReplaceSongMapItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { songVersionId: string; items: SongMapItem[] }) =>
      songMapItemsRepository.replaceByVersion(input.songVersionId, input.items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: songMapItemsKeys.byVersion(variables.songVersionId),
      });
    },
  });
}
