"use server";

import { db } from "@/db";
import { auditLog, users } from "@/db/schema";
import { eq, and, desc, ilike, gte, lte, count, or, inArray } from "drizzle-orm";
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

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const safeAction = action?.slice(0, 200);
  const safeActorSearch = actorSearch?.slice(0, 200);

  const conditions = [];

  if (safeAction) {
    conditions.push(ilike(auditLog.action, `%${safeAction}%`));
  }

  if (targetType) {
    conditions.push(eq(auditLog.targetType, targetType));
  }

  if (safeActorSearch) {
    conditions.push(
      inArray(
        auditLog.actorId,
        db.select({ id: users.id }).from(users).where(
          or(
            ilike(users.name, `%${safeActorSearch}%`),
            ilike(users.email, `%${safeActorSearch}%`)
          )
        )
      )
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
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
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
