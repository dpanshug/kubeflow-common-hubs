export type EventType = "conference" | "workshop" | "meetup" | "webinar" | "hackathon";
export type EventStatus = "draft" | "upcoming" | "live" | "completed" | "cancelled";

export interface MockEvent {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  location: string;
  city: string;
  eventDate: string;
  eventEndDate?: string;
  type: EventType;
  status: EventStatus;
  attendees: number;
  bannerUrl?: string;
  rsvpUrl?: string;
  maxAttendees?: number;
}

export const mockEvents: MockEvent[] = [
  {
    id: "1",
    title: "KCD Bangalore 2026",
    slug: "kcd-bangalore-2026",
    shortDescription:
      "The biggest Kubernetes Community Day in South India, featuring Kubeflow talks and workshops.",
    description:
      "KCD Bangalore 2026 is the flagship Kubernetes Community Day event in South India, bringing together developers, platform engineers, and ML practitioners for a full day of learning and networking.\n\nThe event features keynote talks from Kubeflow maintainers, hands-on workshops covering Kubeflow Pipelines v2 and Katib, and lightning talks from community members. Whether you're just getting started with cloud-native ML or you're a seasoned contributor, there's something for everyone.\n\nTopics include ML pipeline orchestration, model serving at scale, feature stores, experiment tracking, and platform engineering for ML teams. The event also includes a contributor sprint where attendees can make their first open-source contribution with guidance from maintainers.",
    location: "Bangalore International Exhibition Centre, Bangalore",
    city: "Bangalore",
    eventDate: "2026-06-15T09:00:00",
    eventEndDate: "2026-06-15T18:00:00",
    type: "conference",
    status: "upcoming",
    attendees: 142,
    rsvpUrl: "https://kcd.smapply.io/prog/kcd_bangalore_2026/",
    maxAttendees: 300,
  },
  {
    id: "2",
    title: "Kubeflow Pipelines Workshop",
    slug: "kubeflow-pipelines-workshop",
    shortDescription:
      "Hands-on workshop building ML pipelines with Kubeflow Pipelines v2.",
    description:
      "Join us for an interactive, hands-on workshop where you'll build your first ML pipeline using Kubeflow Pipelines v2. This virtual workshop is perfect for data scientists and ML engineers who want to move from notebooks to production-ready pipelines.\n\nYou'll learn how to define pipeline components, chain them together, handle artifacts and metadata, and deploy pipelines to a Kubernetes cluster. We'll also cover best practices for testing, versioning, and monitoring your pipelines.\n\nPrerequisites: Basic Python knowledge and familiarity with Docker. A GitHub account is required for the hands-on exercises. All compute resources will be provided.",
    location: "Virtual (Google Meet)",
    city: "Virtual",
    eventDate: "2026-06-22T14:00:00",
    eventEndDate: "2026-06-22T17:00:00",
    type: "workshop",
    status: "upcoming",
    attendees: 58,
    rsvpUrl: "https://lu.ma/kubeflow-pipelines-workshop",
    maxAttendees: 100,
  },
  {
    id: "3",
    title: "Delhi MLOps Meetup",
    slug: "delhi-mlops-meetup",
    shortDescription:
      "Monthly meetup for MLOps practitioners in Delhi NCR. Lightning talks and networking.",
    description:
      "The Delhi MLOps Meetup is a monthly gathering of ML engineers, data scientists, and platform engineers in the Delhi NCR region. Each meetup features 2-3 lightning talks followed by open discussion and networking.\n\nThis month's theme is 'From Experiment to Production' — we'll hear from practitioners who have successfully deployed ML models using Kubeflow and other cloud-native tools. Talks will cover real-world challenges like model drift detection, A/B testing for ML, and managing ML infrastructure at scale.\n\nPizza and drinks will be provided. The venue is accessible by metro (nearest station: Sector 18, Noida).",
    location: "WeWork Berger Delhi One, Noida",
    city: "Delhi NCR",
    eventDate: "2026-07-03T18:00:00",
    eventEndDate: "2026-07-03T20:30:00",
    type: "meetup",
    status: "upcoming",
    attendees: 34,
    maxAttendees: 50,
  },
  {
    id: "4",
    title: "Kubeflow Katib Deep Dive",
    slug: "kubeflow-katib-deep-dive",
    shortDescription:
      "Deep dive into hyperparameter tuning with Kubeflow Katib.",
    description:
      "This webinar takes a deep dive into Kubeflow Katib — the hyperparameter tuning component of Kubeflow. You'll learn how Katib automates the search for optimal model hyperparameters using various algorithms including Bayesian optimization, grid search, and neural architecture search.\n\nThe session covers Katib's architecture, how to define experiments, configure search algorithms, and interpret results. We'll walk through real examples of tuning deep learning models and discuss how to integrate Katib into your existing ML workflows.\n\nThis is an intermediate-level session. Familiarity with Kubernetes and basic ML concepts is recommended.",
    location: "Virtual (YouTube Live)",
    city: "Virtual",
    eventDate: "2026-07-10T15:00:00",
    eventEndDate: "2026-07-10T16:30:00",
    type: "webinar",
    status: "upcoming",
    attendees: 22,
  },
];

export const eventTypeVariant: Record<
  EventType,
  "meetup" | "conference" | "workshop" | "webinar" | "hackathon"
> = {
  meetup: "meetup",
  conference: "conference",
  workshop: "workshop",
  webinar: "webinar",
  hackathon: "hackathon",
};

export function getEventBySlug(slug: string): MockEvent | undefined {
  return mockEvents.find((e) => e.slug === slug);
}

export function getRelatedEvents(currentSlug: string, limit = 2): MockEvent[] {
  return mockEvents.filter((e) => e.slug !== currentSlug).slice(0, limit);
}
