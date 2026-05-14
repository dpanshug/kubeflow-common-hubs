"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

export async function getPublicEvents() {
  return db
    .select()
    .from(events)
    .where(and(isNull(events.deletedAt), eq(events.status, "upcoming")))
    .orderBy(asc(events.eventDate));
}

export async function getAllPublicEvents() {
  return db
    .select()
    .from(events)
    .where(isNull(events.deletedAt))
    .orderBy(desc(events.eventDate));
}

export async function getEventBySlug(slug: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), isNull(events.deletedAt)))
    .limit(1);

  return event ?? null;
}

export async function getRelatedEvents(currentSlug: string, limit = 2) {
  const rows = await db
    .select()
    .from(events)
    .where(and(isNull(events.deletedAt), eq(events.status, "upcoming")))
    .orderBy(asc(events.eventDate))
    .limit(limit + 1);

  return rows.filter((e) => e.slug !== currentSlug).slice(0, limit);
}
