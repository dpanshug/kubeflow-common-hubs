import { notFound } from "next/navigation";
import { getEventById } from "@/lib/admin/events";
import { EventForm } from "../event-form";
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

  const initial = {
    title: event.title,
    slug: event.slug,
    description: event.description,
    shortDescription: event.shortDescription || "",
    location: event.location || "",
    city: event.city || "",
    eventDate: event.eventDate.toISOString().slice(0, 16),
    eventEndDate: event.eventEndDate
      ? event.eventEndDate.toISOString().slice(0, 16)
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
