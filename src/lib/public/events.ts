import { db } from "@/db";
import { events, eventAttendees } from "@/db/schema";
import { eq, and, isNull, ne, desc, asc, gte, count } from "drizzle-orm";

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

export async function getUpcomingEvents(limit = 3) {
  const attendeeCounts = db
    .select({
      eventId: eventAttendees.eventId,
      count: count().as("attendee_count"),
    })
    .from(eventAttendees)
    .groupBy(eventAttendees.eventId)
    .as("attendee_counts");

  return db
    .select({
      ...listColumns,
      attendeeCount: attendeeCounts.count,
    })
    .from(events)
    .leftJoin(attendeeCounts, eq(events.id, attendeeCounts.eventId))
    .where(and(publicFilter, gte(events.eventDate, new Date())))
    .orderBy(asc(events.eventDate))
    .limit(limit);
}
