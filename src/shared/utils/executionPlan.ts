// Build a linear execution plan from map items (no deduplication).

import type { SectionBlock, SongMapItem } from "@/shared/types";
import { sortMapItems } from "./mapItems";

export interface ExecutionStep {
  id: string;
  sectionId: string;
  order: number;
  labelOverride?: string;
  displayName: string;
  occurrenceIndex: number;
  occurrenceTotal: number;
  section?: SectionBlock;
}

export function buildExecutionPlan(
  sections: SectionBlock[],
  mapItems: SongMapItem[],
): ExecutionStep[] {
  const ordered = sortMapItems(mapItems);
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const totals = new Map<string, number>();

  for (const item of ordered) {
    totals.set(item.sectionId, (totals.get(item.sectionId) || 0) + 1);
  }

  const counters = new Map<string, number>();

  return ordered.map((item) => {
    const section = sectionById.get(item.sectionId);
    const total = totals.get(item.sectionId) || 1;
    const nextIndex = (counters.get(item.sectionId) || 0) + 1;
    counters.set(item.sectionId, nextIndex);

    const baseName = item.labelOverride?.trim() || section?.name || "Seção";
    const displayName =
      total > 1 ? `${baseName} (${nextIndex}/${total})` : baseName;

    return {
      id: item.id,
      sectionId: item.sectionId,
      order: item.order,
      labelOverride: item.labelOverride,
      displayName,
      occurrenceIndex: nextIndex,
      occurrenceTotal: total,
      section,
    };
  });
}
