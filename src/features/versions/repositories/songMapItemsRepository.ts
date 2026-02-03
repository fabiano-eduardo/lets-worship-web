// Song map items repository - data access layer for execution occurrences

import { db } from "@/db";
import type { SongMapItem } from "@/shared/types";
import { normalizeMapItemsOrder, sortMapItems } from "@/shared/utils/mapItems";

export interface CreateSongMapItemInput {
  songVersionId: string;
  sectionId: string;
  order: number;
  labelOverride?: string;
}

export interface UpdateSongMapItemInput {
  sectionId?: string;
  order?: number;
  labelOverride?: string | null;
}

export const songMapItemsRepository = {
  async getByVersion(songVersionId: string): Promise<SongMapItem[]> {
    const items = await db.songMapItems
      .where("songVersionId")
      .equals(songVersionId)
      .toArray();
    return sortMapItems(items);
  },

  async getById(id: string): Promise<SongMapItem | undefined> {
    return db.songMapItems.get(id);
  },

  async create(input: CreateSongMapItemInput): Promise<SongMapItem> {
    const now = new Date().toISOString();
    const item: SongMapItem = {
      id: crypto.randomUUID(),
      songVersionId: input.songVersionId,
      sectionId: input.sectionId,
      order: input.order,
      labelOverride: input.labelOverride?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db.songMapItems.add(item);
    return item;
  },

  async update(
    id: string,
    input: UpdateSongMapItemInput,
  ): Promise<SongMapItem | undefined> {
    const existing = await db.songMapItems.get(id);
    if (!existing) return undefined;

    const updates: Partial<SongMapItem> = {
      ...input,
      labelOverride:
        input.labelOverride !== undefined
          ? input.labelOverride?.trim() || undefined
          : existing.labelOverride,
      updatedAt: new Date().toISOString(),
    };

    await db.songMapItems.update(id, updates);
    return db.songMapItems.get(id);
  },

  async replaceByVersion(
    songVersionId: string,
    items: SongMapItem[],
  ): Promise<SongMapItem[]> {
    const now = new Date().toISOString();
    const normalized = normalizeMapItemsOrder(sortMapItems(items)).map(
      (item) => ({
        ...item,
        songVersionId,
        labelOverride: item.labelOverride?.trim() || undefined,
        createdAt: item.createdAt || now,
        updatedAt: now,
      }),
    );

    const existing = await db.songMapItems
      .where("songVersionId")
      .equals(songVersionId)
      .toArray();
    const nextIds = new Set(normalized.map((item) => item.id));
    const toDelete = existing
      .filter((item) => !nextIds.has(item.id))
      .map((item) => item.id);

    await db.transaction("rw", db.songMapItems, async () => {
      if (toDelete.length > 0) {
        await db.songMapItems.bulkDelete(toDelete);
      }
      await db.songMapItems.bulkPut(normalized);
    });

    return normalized;
  },

  async deleteByVersion(songVersionId: string): Promise<void> {
    await db.songMapItems.where("songVersionId").equals(songVersionId).delete();
  },
};
