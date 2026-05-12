"use client";

import { useState } from "react";
import { MapPin, Calendar, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Event = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  eventDate: string;
  type: "conference" | "workshop" | "meetup" | "webinar" | "hackathon";
  status: "upcoming" | "past";
  attendees: number;
};

const EVENT_TYPES = ["meetup", "conference", "workshop", "hackathon", "webinar"] as const;

const typeVariant: Record<string, "meetup" | "conference" | "workshop" | "webinar"> = {
  meetup: "meetup",
  conference: "conference",
  workshop: "workshop",
  webinar: "webinar",
};

export function EventsClient({ events }: { events: Event[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredEvents = activeFilter
    ? events.filter((e) => e.type === activeFilter)
    : events;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Events
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Join us at meetups, conferences, workshops, and hackathons across India and online.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by event type">
        <button
          aria-pressed={activeFilter === null}
          onClick={() => setActiveFilter(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            activeFilter === null
              ? "bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
              : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
          }`}
        >
          <Filter className="size-3.5" />
          All Types
        </button>
        {EVENT_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={activeFilter === type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              activeFilter === type
                ? "bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
                : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted">
            No events found for this type.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <a
              key={event.id}
              href={`/events/${event.slug}`}
              className="group block rounded-xl border border-border bg-bg-secondary p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-lg hover:border-border-strong"
            >
              <div className="flex items-start justify-between mb-4">
                <Badge variant={typeVariant[event.type] || "default"}>
                  {event.type}
                </Badge>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider font-medium text-[var(--kf-blue)]">
                    {new Date(event.eventDate).toLocaleDateString("en-IN", { month: "short" })}
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {new Date(event.eventDate).getDate()}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--kf-blue)] transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                {event.shortDescription}
              </p>

              <div className="flex items-center justify-between text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {new Date(event.eventDate).toLocaleString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
