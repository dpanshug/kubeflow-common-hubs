import type { Metadata } from "next";
import { EventsClient } from "./events-client";
import { mockEvents } from "./mock-data";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past Kubeflow community events across India - meetups, conferences, workshops, and hackathons.",
};

export default function EventsPage() {
  return <EventsClient events={mockEvents} />;
}
