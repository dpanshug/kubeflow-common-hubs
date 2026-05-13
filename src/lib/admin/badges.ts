"use server";

import { db } from "@/db";
import { badges, userBadges, users } from "@/db/schema";
import { eq, desc, ilike, count, and } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { logAudit, logAuditAsync } from "./audit-helper";
import { revalidatePath } from "next/cache";
import { createBadgeSchema, awardBadgeSchema, type CreateBadgeInput } from "@/lib/validations/badges";
import { z } from "zod";

const uuidSchema = z.string().uuid();

interface ListBadgesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tier?: string;
}

export async function listBadgesAdmin({
  page = 1,
  pageSize = 25,
  search,
  category,
  tier,
}: ListBadgesParams = {}) {
  await requireRole("admin");

  const conditions = [];

  if (category && ["contribution", "community", "engagement", "special"].includes(category)) {
    conditions.push(eq(badges.category, category as typeof badges.category.enumValues[number]));
  }

  if (tier && ["bronze", "silver", "gold", "platinum"].includes(tier)) {
    conditions.push(eq(badges.tier, tier as typeof badges.tier.enumValues[number]));
  }

  if (search) {
    conditions.push(ilike(badges.name, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const awardCount = db
    .select({
      badgeId: userBadges.badgeId,
      count: count().as("award_count"),
    })
    .from(userBadges)
    .groupBy(userBadges.badgeId)
    .as("award_counts");

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        imageUrl: badges.imageUrl,
        category: badges.category,
        tier: badges.tier,
        isAuto: badges.isAuto,
        isActive: badges.isActive,
        pointsValue: badges.pointsValue,
        createdAt: badges.createdAt,
        awardCount: awardCount.count,
      })
      .from(badges)
      .leftJoin(awardCount, eq(badges.id, awardCount.badgeId))
      .where(where)
      .orderBy(desc(badges.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(badges).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getBadgeById(id: string) {
  await requireRole("admin");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const [badge] = await db.select().from(badges).where(eq(badges.id, parsed.data)).limit(1);

  return badge ?? null;
}

export async function createBadge(input: CreateBadgeInput) {
  const actor = await requireRole("admin");

  const parsed = createBadgeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const [created] = await db
    .insert(badges)
    .values({
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl || null,
      criteriaDescription: input.criteriaDescription || null,
      category: input.category,
      tier: input.tier,
      isAuto: input.isAuto,
      pointsValue: input.pointsValue,
      createdBy: actor.id,
    })
    .returning({ id: badges.id });

  logAuditAsync({
    actorId: actor.id,
    action: "badge.created",
    targetType: "badge",
    targetId: created?.id,
    newValues: { name: input.name },
  });

  revalidatePath("/admin/badges");
  return { success: true, id: created?.id };
}

export async function updateBadge(id: string, input: Partial<CreateBadgeInput>) {
  const actor = await requireRole("admin");

  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) values.name = input.name;
  if (input.description !== undefined) values.description = input.description;
  if (input.imageUrl !== undefined) values.imageUrl = input.imageUrl || null;
  if (input.criteriaDescription !== undefined) values.criteriaDescription = input.criteriaDescription || null;
  if (input.category !== undefined) values.category = input.category;
  if (input.tier !== undefined) values.tier = input.tier;
  if (input.isAuto !== undefined) values.isAuto = input.isAuto;
  if (input.pointsValue !== undefined) values.pointsValue = input.pointsValue;

  await db.update(badges).set(values).where(eq(badges.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "badge.updated",
    targetType: "badge",
    targetId: id,
    newValues: input as Record<string, unknown>,
  });

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function toggleBadgeActive(id: string) {
  const actor = await requireRole("admin");

  const badge = await getBadgeById(id);
  if (!badge) return { error: "Badge not found" };

  await db
    .update(badges)
    .set({ isActive: !badge.isActive, updatedAt: new Date() })
    .where(eq(badges.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: badge.isActive ? "badge.deactivated" : "badge.activated",
    targetType: "badge",
    targetId: id,
  });

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function awardBadge(badgeId: string, userId: string, reason?: string) {
  const actor = await requireRole("admin");

  const parsed = awardBadgeSchema.safeParse({ badgeId, userId, reason });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await db.insert(userBadges).values({
      badgeId,
      userId,
      awardedBy: actor.id,
      reason: reason || null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { error: "User already has this badge" };
    }
    throw err;
  }

  await logAudit({
    actorId: actor.id,
    action: "badge.awarded",
    targetType: "user_badge",
    targetId: userId,
    newValues: { badgeId, reason },
  });

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function getBadgeAwardHistory(badgeId: string) {
  await requireRole("admin");

  const rows = await db
    .select({
      id: userBadges.id,
      awardedAt: userBadges.awardedAt,
      reason: userBadges.reason,
      userName: users.name,
      userEmail: users.email,
    })
    .from(userBadges)
    .innerJoin(users, eq(userBadges.userId, users.id))
    .where(eq(userBadges.badgeId, badgeId))
    .orderBy(desc(userBadges.awardedAt));

  return rows;
}
