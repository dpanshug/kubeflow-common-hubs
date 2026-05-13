import { db } from "@/db";
import { auditLog } from "@/db/schema";

interface AuditEntry {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry) {
  await db.insert(auditLog).values({
    actorId: entry.actorId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    oldValues: entry.oldValues,
    newValues: entry.newValues,
  });
}

export function logAuditAsync(entry: AuditEntry) {
  logAudit(entry).catch((err) => {
    console.error("Failed to write audit log:", err);
  });
}
