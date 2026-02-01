// Outbox repository for managing pending mutations

import { db, getDeviceId } from "@/db";
import type { OutboxItem, EntityType, OutboxOperation } from "@/shared/types";

export const outboxRepository = {
  // Add item to outbox
  async add(
    entityType: EntityType,
    op: OutboxOperation,
    entityId: string,
    baseRev?: number,
    payload?: Record<string, unknown>,
  ): Promise<OutboxItem> {
    const deviceId = await getDeviceId();
    const item: OutboxItem = {
      id: crypto.randomUUID(),
      deviceId,
      entityType,
      op,
      entityId,
      baseRev,
      payload,
      createdAt: new Date().toISOString(),
      status: "PENDING",
    };
    await db.outbox.add(item);
    return item;
  },

  // Get pending items (for push)
  async getPending(limit: number = 50): Promise<OutboxItem[]> {
    return db.outbox.where("status").equals("PENDING").limit(limit).toArray();
  },

  // Get all items by status
  async getByStatus(status: OutboxItem["status"]): Promise<OutboxItem[]> {
    return db.outbox.where("status").equals(status).toArray();
  },

  // Update item status
  async updateStatus(
    id: string,
    status: OutboxItem["status"],
    errorMessage?: string,
  ): Promise<void> {
    await db.outbox.update(id, { status, errorMessage });
  },

  // Mark as ACK and optionally remove
  async acknowledge(id: string, remove: boolean = true): Promise<void> {
    if (remove) {
      await db.outbox.delete(id);
    } else {
      await db.outbox.update(id, { status: "ACK" });
    }
  },

  // Mark as conflict
  async markConflict(id: string): Promise<void> {
    await db.outbox.update(id, { status: "CONFLICT" });
  },

  // Get conflicts
  async getConflicts(): Promise<OutboxItem[]> {
    return db.outbox.where("status").equals("CONFLICT").toArray();
  },

  // Remove acknowledged items
  async cleanupAcknowledged(): Promise<number> {
    const acked = await db.outbox.where("status").equals("ACK").toArray();
    await db.outbox.bulkDelete(acked.map((i) => i.id));
    return acked.length;
  },

  // Clear all
  async clear(): Promise<void> {
    await db.outbox.clear();
  },

  // Count by status
  async countByStatus(): Promise<Record<OutboxItem["status"], number>> {
    const items = await db.outbox.toArray();
    const counts: Record<OutboxItem["status"], number> = {
      PENDING: 0,
      SENT: 0,
      ACK: 0,
      CONFLICT: 0,
      REJECTED: 0,
    };
    for (const item of items) {
      counts[item.status]++;
    }
    return counts;
  },
};
