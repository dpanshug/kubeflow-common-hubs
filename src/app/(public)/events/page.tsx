import type { Metadata } from "next";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past Kubeflow community events across India - meetups, conferences, workshops, and hackathons.",
};

const mockEvents = [
  {
    id: "1",
    title: "KCD Bangalore 2026",
    slug: "kcd-bangalore-2026",
    shortDescription: "The biggest Kubernetes Community Day in South India, featuring Kubeflow talks and workshops.",
    location: "Bangalore",
    eventDate: "2026-06-15T09:00:00",
    type: "conference" as const,
    status: "upcoming" as const,
    attendees: 142,
  },
  {
    id: "2",
    title: "Kubeflow Pipelines Workshop",
    slug: "kubeflow-pipelines-workshop",
    shortDescription: "Hands-on workshop building ML pipelines with Kubeflow Pipelines v2.",
    location: "Virtual",
    eventDate: "2026-06-22T14:00:00",
    type: "workshop" as const,
    status: "upcoming" as const,
    attendees: 58,
  },
  {
    id: "3",
    title: "Delhi MLOps Meetup",
    slug: "delhi-mlops-meetup",
    shortDescription: "Monthly meetup for MLOps practitioners in Delhi NCR. Lightning talks and networking.",
    location: "Delhi NCR",
    eventDate: "2026-07-03T18:00:00",
    type: "meetup" as const,
    status: "upcoming" as const,
    attendees: 34,
  },
  {
    id: "4",
    title: "Kubeflow Katib Deep Dive",
    slug: "kubeflow-katib-deep-dive",
    shortDescription: "Deep dive into hyperparameter tuning with Kubeflow Katib.",
    location: "Virtual",
    eventDate: "2026-07-10T15:00:00",
    type: "webinar" as const,
    status: "upcoming" as const,
    attendees: 22,
  },
];

export default function EventsPage() {
  return <EventsClient events={mockEvents} />;
}
