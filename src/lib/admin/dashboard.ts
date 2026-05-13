"use server";

import { cache } from "react";
import { db } from "@/db";
import { users, events, badges, newsPosts, auditLog, cfpSubmissions } from "@/db/schema";
import { eq, isNull, count, desc, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";

export const getDashboardMetrics = cache(async () => {
  await requireRole("moderator");
  const [
    [userCount],
    [eventCount],
    [pendingCfpCount],
    [badgeCount],
    [newsCount],
    [submissionCount],
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(isNull(users.deletedAt)),
    db.select({ value: count() }).from(events).where(isNull(events.deletedAt)),
    db
      .select({ value: count() })
      .from(cfpSubmissions)
      .where(eq(cfpSubmissions.status, "submitted")),
    db.select({ value: count() }).from(badges),
    db.select({ value: count() }).from(newsPosts).where(isNull(newsPosts.deletedAt)),
    db.select({ value: count() }).from(cfpSubmissions),
  ]);

  return {
    users: userCount?.value ?? 0,
    events: eventCount?.value ?? 0,
    pendingSubmissions: pendingCfpCount?.value ?? 0,
    badges: badgeCount?.value ?? 0,
    news: newsCount?.value ?? 0,
    totalSubmissions: submissionCount?.value ?? 0,
  };
});

export const getRecentActivity = cache(async (limit = 15) => {
  await requireRole("moderator");
  const entries = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      createdAt: auditLog.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return entries;
});

export const getSignupTrend = cache(async () => {
  await requireRole("moderator");
  const result = await db
    .select({
      date: sql<string>`date_trunc('day', ${users.createdAt})::date::text`,
      count: count(),
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .groupBy(sql`date_trunc('day', ${users.createdAt})`)
    .orderBy(sql`date_trunc('day', ${users.createdAt})`)
    .limit(30);

  return result;
});
