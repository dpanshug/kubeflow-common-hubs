"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import type { MockEvent, EventType } from "./mock-data";

const EVENT_TYPES: EventType[] = ["meetup", "conference", "workshop", "hackathon", "webinar"];

export function EventsClient({ events }: { events: MockEvent[] }) {
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
            <EventCard
              key={event.id}
              event={event}
              showFullLocation
              showTime
            />
          ))
        )}
      </div>
    </div>
  );
}
