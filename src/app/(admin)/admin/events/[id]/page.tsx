import { notFound } from "next/navigation";
import { getEventById } from "@/lib/admin/events";
import { EventForm } from "../event-form";
import { EVENT_TIMEZONE } from "@/lib/constants";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event ? `Edit: ${event.title}` : "Event Not Found" };
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  function toISTDatetimeLocal(date: Date): string {
    const formatted = date.toLocaleString("sv-SE", {
      timeZone: EVENT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatted.replace(" ", "T");
  }

  const initial = {
    title: event.title,
    slug: event.slug,
    description: event.description,
    shortDescription: event.shortDescription || "",
    location: event.location || "",
    city: event.city || "",
    eventDate: toISTDatetimeLocal(event.eventDate),
    eventEndDate: event.eventEndDate
      ? toISTDatetimeLocal(event.eventEndDate)
      : "",
    type: event.type as "meetup" | "conference" | "workshop" | "hackathon" | "webinar",
    status: event.status as "draft" | "upcoming" | "live" | "completed" | "cancelled",
    bannerUrl: event.bannerUrl || "",
    rsvpUrl: event.rsvpUrl || "",
    maxAttendees: event.maxAttendees ?? undefined,
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit Event</h1>
        <p className="text-sm text-text-muted mt-1">{event.title}</p>
      </div>
      <EventForm eventId={id} initialValues={initial} />
    </div>
  );
}
