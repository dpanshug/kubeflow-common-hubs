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

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const safeSearch = search?.slice(0, 200);

  const conditions = [];

  if (status && ["draft", "open", "closed", "reviewing", "finalized"].includes(status)) {
    conditions.push(eq(cfps.status, status as typeof cfps.status.enumValues[number]));
  }

  if (safeSearch) {
    conditions.push(ilike(cfps.title, `%${safeSearch}%`));
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
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
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

  const data = parsed.data;
  const [created] = await db
    .insert(cfps)
    .values({
      title: data.title,
      description: data.description,
      guidelines: data.guidelines || null,
      deadline: new Date(data.deadline),
      topics: data.topics ?? null,
      acceptedFormats: data.acceptedFormats ?? null,
      status: data.status,
      eventId: data.eventId || null,
      createdBy: actor.id,
    })
    .returning({ id: cfps.id });

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.created",
    targetType: "cfp",
    targetId: created?.id,
    newValues: { title: data.title },
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

  const data = parsed.data;
  await db
    .update(cfps)
    .set({
      title: data.title,
      description: data.description,
      guidelines: data.guidelines || null,
      deadline: new Date(data.deadline),
      topics: data.topics ?? null,
      acceptedFormats: data.acceptedFormats ?? null,
      status: data.status,
      eventId: data.eventId || null,
      updatedAt: new Date(),
    })
    .where(eq(cfps.id, parsedId.data));

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.updated",
    targetType: "cfp",
    targetId: parsedId.data,
    newValues: { title: data.title },
  });

  revalidatePath("/admin/cfps");
  return { success: true };
}

export async function archiveCfp(id: string) {
  const actor = await requireRole("moderator");

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid CFP ID" };

  await db
    .update(cfps)
    .set({ status: "finalized", updatedAt: new Date() })
    .where(eq(cfps.id, parsedId.data));

  logAuditAsync({
    actorId: actor.id,
    action: "cfp.archived",
    targetType: "cfp",
    targetId: parsedId.data,
  });

  revalidatePath("/admin/cfps");
  return { success: true };
}
