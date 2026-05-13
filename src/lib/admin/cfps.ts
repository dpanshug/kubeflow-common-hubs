"use server";

import { db } from "@/db";
import { cfps, events, cfpSubmissions } from "@/db/schema";
import { eq, desc, ilike, count, and } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { logAuditAsync } from "./audit-helper";
import { revalidatePath } from "next/cache";
import { createCfpSchema, type CreateCfpInput } from "@/lib/validations/cfp-admin";
import { z } from "zod";

const uuidSchema = z.string().uuid();

interface ListCfpsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function listCfpsAdmin({
  page = 1,
  pageSize = 25,
  search,
  status,
}: ListCfpsParams = {}) {
  await requireRole("moderator");

  const conditions = [];

  if (status && ["draft", "open", "closed", "reviewing", "finalized"].includes(status)) {
    conditions.push(eq(cfps.status, status as typeof cfps.status.enumValues[number]));
  }

  if (search) {
    conditions.push(ilike(cfps.title, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const subCount = db
    .select({
      cfpId: cfpSubmissions.cfpId,
      count: count().as("sub_count"),
    })
    .from(cfpSubmissions)
    .groupBy(cfpSubmissions.cfpId)
    .as("sub_counts");

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: cfps.id,
        title: cfps.title,
        status: cfps.status,
        deadline: cfps.deadline,
        createdAt: cfps.createdAt,
        eventTitle: events.title,
        submissionCount: subCount.count,
      })
      .from(cfps)
      .leftJoin(events, eq(cfps.eventId, events.id))
      .leftJoin(subCount, eq(cfps.id, subCount.cfpId))
      .where(where)
      .orderBy(desc(cfps.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(cfps).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getCfpByIdAdmin(id: string) {
  await requireRole("moderator");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const [cfp] = await db.select().from(cfps).where(eq(cfps.id, parsed.data)).limit(1);

  return cfp ?? null;
}

export async function createCfp(input: CreateCfpInput) {
  const actor = await requireRole("moderator");

  const parsed = createCfpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const [created] = await db
    .insert(cfps)
    .values({
      title: input.title,
      description: input.description,
      guidelines: input.guidelines || null,
      deadline: new Date(input.deadline),
      topics: input.topics ?? null,
      acceptedFormats: input.acceptedFormats ?? null,
      status: input.status,
      eventId: input.eventId || null,
      createdBy: actor.id,
    })
    .returning({ id: cfps.id });

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.created",
    targetType: "cfp",
    targetId: created?.id,
    newValues: { title: input.title },
  });

  revalidatePath("/admin/cfps");
  return { success: true, id: created?.id };
}

export async function updateCfp(id: string, input: CreateCfpInput) {
  const actor = await requireRole("moderator");

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid CFP ID" };

  const parsed = createCfpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await db
    .update(cfps)
    .set({
      title: input.title,
      description: input.description,
      guidelines: input.guidelines || null,
      deadline: new Date(input.deadline),
      topics: input.topics ?? null,
      acceptedFormats: input.acceptedFormats ?? null,
      status: input.status,
      eventId: input.eventId || null,
      updatedAt: new Date(),
    })
    .where(eq(cfps.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.updated",
    targetType: "cfp",
    targetId: id,
    newValues: { title: input.title },
  });

  revalidatePath("/admin/cfps");
  return { success: true };
}

export async function archiveCfp(id: string) {
  const actor = await requireRole("moderator");

  await db
    .update(cfps)
    .set({ status: "finalized", updatedAt: new Date() })
    .where(eq(cfps.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.archived",
    targetType: "cfp",
    targetId: id,
  });

  revalidatePath("/admin/cfps");
  return { success: true };
}
