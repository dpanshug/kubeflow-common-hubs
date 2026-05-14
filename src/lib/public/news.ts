"use server";

import { db } from "@/db";
import { newsPosts, users } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function getPublicNews() {
  return db
    .select({
      id: newsPosts.id,
      title: newsPosts.title,
      slug: newsPosts.slug,
      excerpt: newsPosts.excerpt,
      content: newsPosts.content,
      tags: newsPosts.tags,
      coverImageUrl: newsPosts.coverImageUrl,
      publishedAt: newsPosts.publishedAt,
      authorName: users.name,
    })
    .from(newsPosts)
    .leftJoin(users, eq(newsPosts.authorId, users.id))
    .where(and(isNull(newsPosts.deletedAt), eq(newsPosts.status, "published")))
    .orderBy(desc(newsPosts.publishedAt));
}

export async function getNewsBySlug(slug: string) {
  const [post] = await db
    .select({
      id: newsPosts.id,
      title: newsPosts.title,
      slug: newsPosts.slug,
      content: newsPosts.content,
      excerpt: newsPosts.excerpt,
      tags: newsPosts.tags,
      coverImageUrl: newsPosts.coverImageUrl,
      publishedAt: newsPosts.publishedAt,
      authorName: users.name,
    })
    .from(newsPosts)
    .leftJoin(users, eq(newsPosts.authorId, users.id))
    .where(and(eq(newsPosts.slug, slug), isNull(newsPosts.deletedAt), eq(newsPosts.status, "published")))
    .limit(1);

  return post ?? null;
}

export async function getRelatedNews(currentSlug: string, limit = 2) {
  const rows = await db
    .select({
      id: newsPosts.id,
      title: newsPosts.title,
      slug: newsPosts.slug,
      excerpt: newsPosts.excerpt,
      tags: newsPosts.tags,
      publishedAt: newsPosts.publishedAt,
      authorName: users.name,
    })
    .from(newsPosts)
    .leftJoin(users, eq(newsPosts.authorId, users.id))
    .where(and(isNull(newsPosts.deletedAt), eq(newsPosts.status, "published")))
    .orderBy(desc(newsPosts.publishedAt))
    .limit(limit + 1);

  return rows.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
