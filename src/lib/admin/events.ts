"use server";

import { db } from "@/db";
import { events, eventAttendees, users } from "@/db/schema";
import { eq, and, isNull, isNotNull, desc, ilike, count, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { logAuditAsync } from "./audit-helper";
import { revalidatePath } from "next/cache";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/events";
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
    const conditions = [eq(events.slug, slug)];
    if (excludeId) {
      conditions.push(sql`${events.id} != ${excludeId}`);
    }
    const [existing] = await db
      .select({ id: events.id })
      .from(events)
      .where(and(...conditions))
      .limit(1);

    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt + 1}`;
  }
}

interface ListEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function listEvents({
  page = 1,
  pageSize = 25,
  search,
  status,
}: ListEventsParams = {}) {
  await requireRole("moderator");

  const conditions = [];

  if (status === "deleted") {
    conditions.push(isNotNull(events.deletedAt));
  } else {
    conditions.push(isNull(events.deletedAt));
    if (status && ["draft", "upcoming", "live", "completed", "cancelled"].includes(status)) {
      conditions.push(eq(events.status, status as typeof events.status.enumValues[number]));
    }
  }

  if (search) {
    conditions.push(ilike(events.title, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const attendeeCount = db
    .select({
      eventId: eventAttendees.eventId,
      count: count().as("attendee_count"),
    })
    .from(eventAttendees)
    .groupBy(eventAttendees.eventId)
    .as("attendee_counts");

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        type: events.type,
        status: events.status,
        city: events.city,
        eventDate: events.eventDate,
        deletedAt: events.deletedAt,
        attendeeCount: attendeeCount.count,
      })
      .from(events)
      .leftJoin(attendeeCount, eq(events.id, attendeeCount.eventId))
      .where(where)
      .orderBy(desc(events.eventDate))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(events).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getEventById(id: string) {
  await requireRole("moderator");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, parsed.data))
    .limit(1);

  return event ?? null;
}

export async function createEvent(input: CreateEventInput) {
  const actor = await requireRole("moderator");

  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const slug = await ensureUniqueSlug(data.slug || slugify(data.title));

  const [created] = await db
    .insert(events)
    .values({
      title: data.title,
      slug,
      description: data.description,
      shortDescription: data.shortDescription || null,
      location: data.location || null,
      city: data.city || null,
      eventDate: new Date(data.eventDate),
      eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
      type: data.type,
      status: data.status,
      bannerUrl: data.bannerUrl || null,
      rsvpUrl: data.rsvpUrl || null,
      maxAttendees: data.maxAttendees ?? null,
      createdBy: actor.id,
    })
    .returning({ id: events.id });

  logAuditAsync({
    actorId: actor.id,
    action: "event.created",
    targetType: "event",
    targetId: created?.id,
    newValues: { title: data.title, slug },
  });

  revalidatePath("/admin/events");
  return { success: true, id: created?.id };
}

export async function updateEvent(id: string, input: CreateEventInput) {
  const actor = await requireRole("moderator");

  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await getEventById(id);
  if (!existing) return { error: "Event not found" };

  const slug = input.slug && input.slug !== existing.slug
    ? await ensureUniqueSlug(input.slug, id)
    : existing.slug;

  await db
    .update(events)
    .set({
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription || null,
      location: input.location || null,
      city: input.city || null,
      eventDate: new Date(input.eventDate),
      eventEndDate: input.eventEndDate ? new Date(input.eventEndDate) : null,
      type: input.type,
      status: input.status,
      bannerUrl: input.bannerUrl || null,
      rsvpUrl: input.rsvpUrl || null,
      maxAttendees: input.maxAttendees ?? null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "event.updated",
    targetType: "event",
    targetId: id,
    newValues: { title: input.title },
  });

  revalidatePath("/admin/events");
  return { success: true };
}

export async function softDeleteEvent(id: string) {
  const actor = await requireRole("moderator");

  await db
    .update(events)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(events.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "event.deleted",
    targetType: "event",
    targetId: id,
  });

  revalidatePath("/admin/events");
  return { success: true };
}

export async function restoreEvent(id: string) {
  const actor = await requireRole("moderator");

  await db
    .update(events)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(events.id, id));

  logAuditAsync({
    actorId: actor.id,
    action: "event.restored",
    targetType: "event",
    targetId: id,
  });

  revalidatePath("/admin/events");
  return { success: true };
}

export async function listEventAttendees(eventId: string) {
  await requireRole("moderator");

  const rows = await db
    .select({
      id: eventAttendees.id,
      rsvpStatus: eventAttendees.rsvpStatus,
      checkedInAt: eventAttendees.checkedInAt,
      createdAt: eventAttendees.createdAt,
      userName: users.name,
      userEmail: users.email,
      userAvatar: users.avatarUrl,
    })
    .from(eventAttendees)
    .innerJoin(users, eq(eventAttendees.userId, users.id))
    .where(eq(eventAttendees.eventId, eventId))
    .orderBy(desc(eventAttendees.createdAt));

  return rows;
}
