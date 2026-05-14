import type { Metadata } from "next";
import { EventsClient } from "./events-client";
import { getAllPublicEvents } from "@/lib/public/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past Kubeflow community events across India - meetups, conferences, workshops, and hackathons.",
};

export default async function EventsPage() {
  const events = await getAllPublicEvents();
  return <EventsClient events={events} />;
}
