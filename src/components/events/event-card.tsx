import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EVENT_TIMEZONE } from "@/lib/constants";

type EventType = "meetup" | "conference" | "workshop" | "hackathon" | "webinar";

const EVENT_TYPE_VARIANT: Record<EventType, EventType> = {
  meetup: "meetup",
  conference: "conference",
  workshop: "workshop",
  webinar: "webinar",
  hackathon: "hackathon",
};

interface EventCardEvent {
  slug: string;
  title: string;
  shortDescription: string | null;
  location: string | null;
  city: string | null;
  eventDate: Date;
  type: string;
}

interface EventCardProps {
  event: EventCardEvent;
  showFullLocation?: boolean;
  showTime?: boolean;
}

export function EventCard({
  event,
  showFullLocation = false,
  showTime = false,
}: EventCardProps) {
  const date = new Date(event.eventDate);
  const type = event.type as EventType;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block rounded-xl border border-border bg-bg-secondary p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-lg hover:border-border-strong"
    >
      <div className="flex items-start justify-between mb-4">
        <Badge variant={EVENT_TYPE_VARIANT[type] || "secondary"}>
          {event.type}
        </Badge>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider font-medium text-[var(--kf-blue)]">
            {date.toLocaleDateString("en-IN", { month: "short", timeZone: EVENT_TIMEZONE })}
          </div>
          <div className="text-lg font-bold leading-tight">
            {date.toLocaleDateString("en-IN", { day: "numeric", timeZone: EVENT_TIMEZONE })}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--kf-blue)] transition-colors">
        {event.title}
      </h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {event.shortDescription || ""}
      </p>

      <div className="flex items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {showFullLocation ? (event.location || event.city || "TBD") : (event.city || "TBD")}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {date.toLocaleString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: EVENT_TIMEZONE,
            ...(showTime && { hour: "2-digit", minute: "2-digit" }),
          })}
        </div>
      </div>
    </Link>
  );
}
