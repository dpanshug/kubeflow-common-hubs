import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/common/share-button";
import { EventCard } from "@/components/events/event-card";
import { SITE_URL, EVENT_TIMEZONE } from "@/lib/constants";
import { getEventBySlug, getRelatedEvents } from "@/lib/public/events";

type EventType = "meetup" | "conference" | "workshop" | "hackathon" | "webinar";

const EVENT_TYPE_VARIANT: Record<EventType, EventType> = {
  meetup: "meetup",
  conference: "conference",
  workshop: "workshop",
  webinar: "webinar",
  hackathon: "hackathon",
};

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  upcoming: "success",
  live: "warning",
  completed: "secondary",
  cancelled: "destructive",
  draft: "secondary",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDateRange(start: Date, end?: Date | null): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIMEZONE,
  };

  if (!end) {
    return start.toLocaleString("en-IN", options);
  }

  const sameDayFmt = { timeZone: EVENT_TIMEZONE } as const;
  const sameDay =
    start.toLocaleDateString("en-IN", sameDayFmt) ===
    end.toLocaleDateString("en-IN", sameDayFmt);

  if (sameDay) {
    const datePart = start.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: EVENT_TIMEZONE,
    });
    const startTime = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: EVENT_TIMEZONE });
    const endTime = end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: EVENT_TIMEZONE });
    return `${datePart}, ${startTime} – ${endTime}`;
  }

  return `${start.toLocaleString("en-IN", options)} – ${end.toLocaleString("en-IN", options)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: event.shortDescription || event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.shortDescription || event.description.slice(0, 160),
      url: `${SITE_URL}/events/${event.slug}`,
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const relatedEvents = await getRelatedEvents(slug);
  const startDate = new Date(event.eventDate);
  const type = event.type as EventType;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href="/events" className="hover:text-text-primary transition-colors">
              Events
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li className="text-text-secondary truncate max-w-[250px] sm:max-w-none" aria-current="page">
            {event.title}
          </li>
        </ol>
      </nav>

      <div className="relative rounded-xl overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gradient-to-br from-bg-tertiary to-bg-secondary flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kf-blue)]/5 to-[var(--kf-teal)]/5" />
          <div className="absolute top-4 left-4 bg-bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 text-center border border-border">
            <div className="text-[10px] uppercase tracking-wider font-medium text-[var(--kf-blue)]">
              {startDate.toLocaleDateString("en-IN", { month: "short", timeZone: EVENT_TIMEZONE }).toUpperCase()}
            </div>
            <div className="text-2xl font-bold leading-tight">{startDate.toLocaleDateString("en-IN", { day: "numeric", timeZone: EVENT_TIMEZONE })}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={EVENT_TYPE_VARIANT[type] || "secondary"}>{event.type}</Badge>
          <Badge variant={STATUS_VARIANT[event.status] || "secondary"}>{event.status}</Badge>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
          {event.title}
        </h1>
        <p className="text-text-secondary text-lg">{event.shortDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBox icon={Calendar} label="Date & Time">
            {formatDateRange(event.eventDate, event.eventEndDate)}
          </InfoBox>
          <InfoBox icon={MapPin} label="Location">
            {event.location || event.city || "TBD"}
          </InfoBox>
          <InfoBox icon={Clock} label="Event Type">
            <span className="capitalize">{event.type}</span>
          </InfoBox>
        </div>

        <div className="flex flex-col gap-3">
          {event.rsvpUrl && (
            <Button variant="gradient" asChild>
              <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer">
                RSVP Now <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
          <ShareButton />
          <Link href="/events" className="inline-flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mt-1">
            <ArrowLeft className="size-4" /> Back to Events
          </Link>
        </div>
      </div>

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

      {relatedEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Other Events</h2>
            <Link href="/events" className="text-sm font-medium text-[var(--kf-blue)] hover:underline underline-offset-4">
              View all events
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedEvents.map((related) => (
              <EventCard key={related.slug} event={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoBox({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--kf-blue)]/10">
        <Icon className="size-5 text-[var(--kf-blue)]" />
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted mb-0.5">{label}</p>
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}
