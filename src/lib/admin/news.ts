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

  while (true) {
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

  const conditions = [];

  if (status === "deleted") {
    conditions.push(isNotNull(newsPosts.deletedAt));
  } else {
    conditions.push(isNull(newsPosts.deletedAt));
    if (status && ["draft", "published", "archived"].includes(status)) {
      conditions.push(eq(newsPosts.status, status as typeof newsPosts.status.enumValues[number]));
    }
  }

  if (search) {
    conditions.push(ilike(newsPosts.title, `%${search}%`));
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
      .limit(pageSize)
      .offset((page - 1) * pageSize),
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

  const slug = await ensureUniqueSlug(parsed.data.slug || slugify(parsed.data.title));
  const isPublishing = input.status === "published";

  const [created] = await db
    .insert(newsPosts)
    .values({
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt || null,
      coverImageUrl: input.coverImageUrl || null,
      tags: input.tags ?? null,
      status: input.status,
      authorId: actor.id,
      publishedAt: isPublishing ? new Date() : null,
    })
    .returning({ id: newsPosts.id });

  logAuditAsync({
    actorId: actor.id,
    action: "news.created",
    targetType: "news",
    targetId: created?.id,
    newValues: { title: input.title, slug },
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

  const existing = await getNewsById(id);
  if (!existing) return { error: "News post not found" };

  const slug = input.slug && input.slug !== existing.slug
    ? await ensureUniqueSlug(input.slug, id)
    : existing.slug;

  const isNewlyPublished = input.status === "published" && existing.status !== "published";

  await db
    .update(newsPosts)
    .set({
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt || null,
      coverImageUrl: input.coverImageUrl || null,
      tags: input.tags ?? null,
      status: input.status,
      publishedAt: isNewlyPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(newsPosts.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "news.updated",
    targetType: "news",
    targetId: id,
    newValues: { title: input.title },
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function softDeleteNews(id: string) {
  const actor = await requireRole("moderator");

  await db
    .update(newsPosts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(newsPosts.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "news.deleted",
    targetType: "news",
    targetId: id,
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function restoreNews(id: string) {
  const actor = await requireRole("moderator");

  await db
    .update(newsPosts)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(newsPosts.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "news.restored",
    targetType: "news",
    targetId: id,
  });

  revalidatePath("/admin/news");
  return { success: true };
}
