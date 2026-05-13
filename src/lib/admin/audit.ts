"use server";

import { db } from "@/db";
import { auditLog, users } from "@/db/schema";
import { eq, and, desc, ilike, gte, lte, count, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";

interface QueryAuditLogParams {
  page?: number;
  pageSize?: number;
  action?: string;
  targetType?: string;
  actorSearch?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function queryAuditLog({
  page = 1,
  pageSize = 25,
  action,
  targetType,
  actorSearch,
  dateFrom,
  dateTo,
}: QueryAuditLogParams = {}) {
  await requireRole("admin");

  const conditions = [];

  if (action) {
    conditions.push(ilike(auditLog.action, `%${action}%`));
  }

  if (targetType) {
    conditions.push(eq(auditLog.targetType, targetType));
  }

  if (actorSearch) {
    conditions.push(
      sql`${auditLog.actorId} IN (
        SELECT id FROM users WHERE name ILIKE ${'%' + actorSearch + '%'} OR email ILIKE ${'%' + actorSearch + '%'}
      )`
    );
  }

  if (dateFrom) {
    conditions.push(gte(auditLog.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    conditions.push(lte(auditLog.createdAt, new Date(dateTo)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
        createdAt: auditLog.createdAt,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorId, users.id))
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(auditLog).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getAuditTargetTypes() {
  await requireRole("admin");

  const result = await db
    .selectDistinct({ targetType: auditLog.targetType })
    .from(auditLog)
    .orderBy(auditLog.targetType);

  return result.map((r) => r.targetType);
}
