import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, isNull, ne, desc, asc } from "drizzle-orm";

const publicFilter = and(isNull(events.deletedAt), ne(events.status, "draft"));

const listColumns = {
  id: events.id,
  title: events.title,
  slug: events.slug,
  shortDescription: events.shortDescription,
  location: events.location,
  city: events.city,
  eventDate: events.eventDate,
  eventEndDate: events.eventEndDate,
  type: events.type,
  status: events.status,
};

export async function getAllPublicEvents() {
  return db
    .select(listColumns)
    .from(events)
    .where(publicFilter)
    .orderBy(desc(events.eventDate));
}

export async function getEventBySlug(slug: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), publicFilter))
    .limit(1);

  return event ?? null;
}

export async function getRelatedEvents(currentSlug: string, limit = 2) {
  return db
    .select(listColumns)
    .from(events)
    .where(and(publicFilter, ne(events.slug, currentSlug)))
    .orderBy(asc(events.eventDate))
    .limit(limit);
}
