// Utilities for song map items (execution occurrences)

import type { SectionBlock, SequenceItem, SongMapItem } from "@/shared/types";

export interface MapItemGroup {
  sectionId: string;
  labelOverride?: string;
  sectionName?: string;
  items: SongMapItem[];
}

export function sortMapItems(items: SongMapItem[]): SongMapItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function normalizeMapItemsOrder(items: SongMapItem[]): SongMapItem[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

export function groupMapItems(
  items: SongMapItem[],
  sections?: SectionBlock[],
): MapItemGroup[] {
  const ordered = sortMapItems(items);
  const sectionNameById = new Map(
    (sections || []).map((section) => [section.id, section.name]),
  );

  const groups: MapItemGroup[] = [];

  for (const item of ordered) {
    const last = groups[groups.length - 1];
    const lastLabel = last?.labelOverride ?? null;
    const currentLabel = item.labelOverride ?? null;

    if (last && last.sectionId === item.sectionId && lastLabel === currentLabel) {
      last.items.push(item);
      continue;
    }

    groups.push({
      sectionId: item.sectionId,
      labelOverride: item.labelOverride,
      sectionName: sectionNameById.get(item.sectionId),
      items: [item],
    });
  }

  return groups;
}

export function buildSequenceFromMapItems(
  items: SongMapItem[],
): SequenceItem[] {
  const groups = groupMapItems(items);
  return groups.map((group) => ({
    sectionId: group.sectionId,
    repeat: group.items.length,
  }));
}

export function buildMapItemsFromArrangement(params: {
  songVersionId: string;
  sections: SectionBlock[];
  sequence?: SequenceItem[];
}): SongMapItem[] {
  const { songVersionId, sections, sequence } = params;
  const now = new Date().toISOString();
  const items: SongMapItem[] = [];
  let order = 0;

  const pushItem = (sectionId: string) => {
    items.push({
      id: crypto.randomUUID(),
      songVersionId,
      sectionId,
      order,
      createdAt: now,
      updatedAt: now,
    });
    order += 1;
  };

  if (sequence && sequence.length > 0) {
    for (const item of sequence) {
      const repeat = item.repeat ?? 1;
      for (let i = 0; i < repeat; i += 1) {
        pushItem(item.sectionId);
      }
    }
  } else {
    for (const section of sections) {
      pushItem(section.id);
    }
  }

  return items;
}
