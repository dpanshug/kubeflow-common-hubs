export type CfpStatus = "draft" | "open" | "closed" | "reviewing" | "finalized";

export interface MockCfp {
  id: string;
  title: string;
  description: string;
  deadline: string;
  topics: string[];
  status: CfpStatus;
  eventTitle: string;
  guidelines?: string;
  acceptedFormats?: string[];
}

export const mockCfps: MockCfp[] = [
  {
    id: "1",
    title: "KCD Bangalore 2026 - Call for Speakers",
    description:
      "We're looking for speakers to share their experience with Kubeflow, MLOps, and cloud-native ML. All levels welcome.",
    deadline: "2026-05-30T23:59:59",
    topics: ["Kubeflow Pipelines", "Model Serving", "MLOps", "Platform Engineering"],
    status: "open",
    eventTitle: "KCD Bangalore 2026",
    guidelines:
      "Talks should be 30 or 45 minutes long. Lightning talks of 10 minutes are also accepted. Please include a brief outline and speaker bio in your submission. We encourage first-time speakers to apply — mentorship is available.",
    acceptedFormats: ["talk_30", "talk_45", "lightning_10"],
  },
  {
    id: "2",
    title: "Community Webinar Series - Lightning Talks",
    description:
      "10-minute lightning talks on any Kubeflow topic. Perfect for first-time speakers.",
    deadline: "2026-06-15T23:59:59",
    topics: ["Any Kubeflow Topic"],
    status: "open",
    eventTitle: "Monthly Webinar Series",
    guidelines:
      "Lightning talks are 10 minutes long with 2 minutes for Q&A. Any topic related to Kubeflow, MLOps, or cloud-native ML is welcome. Slides are optional but recommended.",
    acceptedFormats: ["lightning_10"],
  },
  {
    id: "3",
    title: "Delhi MLOps Meetup - July Edition",
    description:
      "Looking for 2 speakers for 30-minute talks on MLOps in production.",
    deadline: "2026-06-20T23:59:59",
    topics: ["MLOps", "Production ML", "CI/CD for ML"],
    status: "open",
    eventTitle: "Delhi MLOps Meetup",
    guidelines:
      "We need 2 speakers for 30-minute talks. Topics should focus on real-world MLOps challenges and solutions. Case studies and live demos are highly encouraged.",
    acceptedFormats: ["talk_30"],
  },
];

export function getCfpById(id: string): MockCfp | undefined {
  return mockCfps.find((c) => c.id === id);
}

export function daysUntil(deadline: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

const cfpStatusVariant: Record<CfpStatus, "success" | "secondary" | "warning" | "destructive"> = {
  open: "success",
  draft: "secondary",
  closed: "secondary",
  reviewing: "warning",
  finalized: "secondary",
};

const cfpStatusLabel: Record<CfpStatus, string> = {
  open: "Open",
  draft: "Draft",
  closed: "Closed",
  reviewing: "Under Review",
  finalized: "Finalized",
};

export function getCfpStatusBadge(status: CfpStatus) {
  return {
    variant: cfpStatusVariant[status],
    label: cfpStatusLabel[status],
  };
}
