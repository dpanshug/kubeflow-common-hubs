"use server";

import { db } from "@/db";
import { newsPosts, users } from "@/db/schema";
import { eq, and, isNull, isNotNull, desc, ilike, count, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { logAuditAsync } from "./audit-helper";
import { revalidatePath } from "next/cache";
import { createNewsSchema, type CreateNewsInput } from "@/lib/validations/news";
import { z } from "zod";

const uuidSchema = z.string().uuid();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  const MAX_ATTEMPTS = 100;

  while (attempt < MAX_ATTEMPTS) {
    const conditions = [eq(newsPosts.slug, slug)];
    if (excludeId) {
      conditions.push(sql`${newsPosts.id} != ${excludeId}`);
    }
    const [existing] = await db
      .select({ id: newsPosts.id })
      .from(newsPosts)
      .where(and(...conditions))
      .limit(1);

    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt + 1}`;
  }
  throw new Error("Could not generate a unique slug");
}

interface ListNewsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function listNewsAdmin({
  page = 1,
  pageSize = 25,
  search,
  status,
}: ListNewsParams = {}) {
  await requireRole("moderator");

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const safeSearch = search?.slice(0, 200);

  const conditions = [];

  if (status === "deleted") {
    conditions.push(isNotNull(newsPosts.deletedAt));
  } else {
    conditions.push(isNull(newsPosts.deletedAt));
    if (status && ["draft", "published", "archived"].includes(status)) {
      conditions.push(eq(newsPosts.status, status as typeof newsPosts.status.enumValues[number]));
    }
  }

  if (safeSearch) {
    conditions.push(ilike(newsPosts.title, `%${safeSearch}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: newsPosts.id,
        title: newsPosts.title,
        slug: newsPosts.slug,
        status: newsPosts.status,
        tags: newsPosts.tags,
        publishedAt: newsPosts.publishedAt,
        createdAt: newsPosts.createdAt,
        deletedAt: newsPosts.deletedAt,
        authorName: users.name,
      })
      .from(newsPosts)
      .leftJoin(users, eq(newsPosts.authorId, users.id))
      .where(where)
      .orderBy(desc(newsPosts.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
    db.select({ value: count() }).from(newsPosts).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getNewsById(id: string) {
  await requireRole("moderator");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const [post] = await db.select().from(newsPosts).where(eq(newsPosts.id, parsed.data)).limit(1);

  return post ?? null;
}

export async function createNews(input: CreateNewsInput) {
  const actor = await requireRole("moderator");

  const parsed = createNewsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;
  const slug = await ensureUniqueSlug(data.slug || slugify(data.title));
  const isPublishing = data.status === "published";

  const [created] = await db
    .insert(newsPosts)
    .values({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      coverImageUrl: data.coverImageUrl || null,
      tags: data.tags ?? null,
      status: data.status,
      authorId: actor.id,
      publishedAt: isPublishing ? new Date() : null,
    })
    .returning({ id: newsPosts.id });

  logAuditAsync({
    actorId: actor.id,
    action: "news.created",
    targetType: "news",
    targetId: created?.id,
    newValues: { title: data.title, slug },
  });

  revalidatePath("/admin/news");
  return { success: true, id: created?.id };
}

export async function updateNews(id: string, input: CreateNewsInput) {
  const actor = await requireRole("moderator");

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid news ID" };

  const validInput = createNewsSchema.safeParse(input);
  if (!validInput.success) return { error: validInput.error.issues[0]?.message ?? "Invalid input" };

  const data = validInput.data;
  const existing = await getNewsById(parsedId.data);
  if (!existing) return { error: "News post not found" };

  const slug = data.slug && data.slug !== existing.slug
    ? await ensureUniqueSlug(data.slug, parsedId.data)
    : existing.slug;

  const isNewlyPublished = data.status === "published" && existing.status !== "published";

  await db
    .update(newsPosts)
    .set({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      coverImageUrl: data.coverImageUrl || null,
      tags: data.tags ?? null,
      status: data.status,
      publishedAt: isNewlyPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(newsPosts.id, parsedId.data));

  logAuditAsync({
    actorId: actor.id,
    action: "news.updated",
    targetType: "news",
    targetId: parsedId.data,
    newValues: { title: data.title },
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function softDeleteNews(id: string) {
  const actor = await requireRole("moderator");

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid news ID" };

  await db
    .update(newsPosts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(newsPosts.id, parsedId.data));

  logAuditAsync({
    actorId: actor.id,
    action: "news.deleted",
    targetType: "news",
    targetId: parsedId.data,
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function restoreNews(id: string) {
  const actor = await requireRole("moderator");

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid news ID" };

  await db
    .update(newsPosts)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(newsPosts.id, parsedId.data));

  logAuditAsync({
    actorId: actor.id,
    action: "news.restored",
    targetType: "news",
    targetId: parsedId.data,
  });

  revalidatePath("/admin/news");
  return { success: true };
}
