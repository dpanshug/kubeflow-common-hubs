import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/common/share-button";
import { EventCard } from "@/components/events/event-card";
import { SITE_URL } from "@/lib/constants";
import {
  mockEvents,
  getEventBySlug,
  getRelatedEvents,
  eventTypeVariant,
} from "../mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const statusVariant: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  upcoming: "success",
  live: "warning",
  completed: "secondary",
  cancelled: "destructive",
  draft: "secondary",
};

function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  if (!end) {
    return startDate.toLocaleString("en-IN", options);
  }

  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    const datePart = startDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const startTime = startDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart}, ${startTime} – ${endTime}`;
  }

  return `${startDate.toLocaleString("en-IN", options)} – ${endDate.toLocaleString("en-IN", options)}`;
}

export function generateStaticParams() {
  return mockEvents.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.shortDescription,
    openGraph: {
      title: event.title,
      description: event.shortDescription,
      url: `${SITE_URL}/events/${event.slug}`,
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = getRelatedEvents(slug);
  const startDate = new Date(event.eventDate);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link
              href="/events"
              className="hover:text-text-primary transition-colors"
            >
              Events
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li
            className="text-text-secondary truncate max-w-[250px] sm:max-w-none"
            aria-current="page"
          >
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Hero banner */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gradient-to-br from-bg-tertiary to-bg-secondary flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kf-blue)]/5 to-[var(--kf-teal)]/5" />

          {/* Date chip */}
          <div className="absolute top-4 left-4 bg-bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 text-center border border-border">
            <div className="text-[10px] uppercase tracking-wider font-medium text-[var(--kf-blue)]">
              {startDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
            </div>
            <div className="text-2xl font-bold leading-tight">
              {startDate.getDate()}
            </div>
          </div>
        </div>
      </div>

      {/* Title & badges */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={eventTypeVariant[event.type]}>
            {event.type}
          </Badge>
          <Badge variant={statusVariant[event.status] || "secondary"}>
            {event.status}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
          {event.title}
        </h1>
        <p className="text-text-secondary text-lg">
          {event.shortDescription}
        </p>
      </div>

      {/* Info grid + actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Info cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--kf-blue)]/10">
              <Calendar className="size-5 text-[var(--kf-blue)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted mb-0.5">
                Date & Time
              </p>
              <p className="text-sm font-medium">
                {formatDateRange(event.eventDate, event.eventEndDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--kf-blue)]/10">
              <MapPin className="size-5 text-[var(--kf-blue)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted mb-0.5">
                Location
              </p>
              <p className="text-sm font-medium">{event.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--kf-blue)]/10">
              <Users className="size-5 text-[var(--kf-blue)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted mb-0.5">
                Attendees
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="size-6 rounded-full bg-bg-tertiary border-2 border-bg-secondary"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {event.attendees}
                  {event.maxAttendees && (
                    <span className="text-text-muted">
                      {" "}
                      / {event.maxAttendees}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--kf-blue)]/10">
              <Clock className="size-5 text-[var(--kf-blue)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted mb-0.5">
                Event Type
              </p>
              <p className="text-sm font-medium capitalize">{event.type}</p>
            </div>
          </div>
        </div>

        {/* Action sidebar */}
        <div className="flex flex-col gap-3">
          {event.rsvpUrl && (
            <Button variant="gradient" asChild>
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP Now
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
          <ShareButton />
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mt-1"
          >
            <ArrowLeft className="size-4" />
            Back to Events
          </Link>
        </div>
      </div>

      {/* Description */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">About This Event</h2>
        <div className="rounded-xl border border-border bg-bg-secondary p-6 md:p-8">
          <div className="max-w-3xl space-y-4 text-text-secondary leading-relaxed">
            {event.description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Related events */}
      {relatedEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Other Events</h2>
            <Link
              href="/events"
              className="text-sm font-medium text-[var(--kf-blue)] hover:underline underline-offset-4"
            >
              View all events
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedEvents.map((related) => (
              <EventCard key={related.id} event={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
