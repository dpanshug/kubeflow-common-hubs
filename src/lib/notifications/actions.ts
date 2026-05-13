"use server";

import { eq, and, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";

export async function getNotifications(page = 1, limit = 20) {
  const user = await requireAuth();
  const offset = (page - 1) * limit;

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ count: count() })
    .from(notifications)
    .where(eq(notifications.userId, user.id));

  return {
    items,
    total: total?.count ?? 0,
    page,
    totalPages: Math.ceil((total?.count ?? 0) / limit),
  };
}

export async function getUnreadCount() {
  const user = await requireAuth();

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false)
      )
    );

  return result?.count ?? 0;
}

export async function markAsRead(notificationId: string) {
  const user = await requireAuth();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.id)
      )
    );
}

export async function markAllAsRead() {
  const user = await requireAuth();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false)
      )
    );
}
