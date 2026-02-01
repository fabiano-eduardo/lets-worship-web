// Conflict repository for managing sync conflicts

import { db } from "@/db";
import type { SyncConflict, EntityType } from "@/shared/types";

export const conflictRepository = {
  // Create a conflict record
  async create(
    entityType: EntityType,
    entityId: string,
    localVersion: Record<string, unknown>,
    remoteVersion: Record<string, unknown>,
  ): Promise<SyncConflict> {
    const conflict: SyncConflict = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      localVersion,
      remoteVersion,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    await db.conflicts.add(conflict);
    return conflict;
  },

  // Get all unresolved conflicts
  async getUnresolved(): Promise<SyncConflict[]> {
    const all = await db.conflicts.toArray();
    return all.filter((c) => !c.resolved);
  },

  // Get conflict by entity
  async getByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<SyncConflict | undefined> {
    return db.conflicts
      .where({ entityType, entityId })
      .filter((c) => !c.resolved)
      .first();
  },

  // Mark conflict as resolved
  async resolve(id: string): Promise<void> {
    await db.conflicts.update(id, { resolved: true });
  },

  // Delete conflict
  async delete(id: string): Promise<void> {
    await db.conflicts.delete(id);
  },

  // Count unresolved
  async countUnresolved(): Promise<number> {
    const all = await db.conflicts.toArray();
    return all.filter((c) => !c.resolved).length;
  },

  // Clean up resolved conflicts older than X days
  async cleanupResolved(olderThanDays: number = 7): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const cutoffStr = cutoff.toISOString();

    const all = await db.conflicts.toArray();
    const old = all.filter((c) => c.resolved && c.createdAt < cutoffStr);

    await db.conflicts.bulkDelete(old.map((c) => c.id));
    return old.length;
  },
};
