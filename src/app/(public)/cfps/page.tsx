import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Call for Papers",
  description: "Submit your talk proposals to upcoming Kubeflow community events in India.",
};

const mockCfps = [
  {
    id: "1",
    title: "KCD Bangalore 2026 - Call for Speakers",
    description: "We're looking for speakers to share their experience with Kubeflow, MLOps, and cloud-native ML. All levels welcome.",
    deadline: "2026-05-30T23:59:59",
    topics: ["Kubeflow Pipelines", "Model Serving", "MLOps", "Platform Engineering"],
    status: "open" as const,
    eventTitle: "KCD Bangalore 2026",
  },
  {
    id: "2",
    title: "Community Webinar Series - Lightning Talks",
    description: "10-minute lightning talks on any Kubeflow topic. Perfect for first-time speakers.",
    deadline: "2026-06-15T23:59:59",
    topics: ["Any Kubeflow Topic"],
    status: "open" as const,
    eventTitle: "Monthly Webinar Series",
  },
  {
    id: "3",
    title: "Delhi MLOps Meetup - July Edition",
    description: "Looking for 2 speakers for 30-minute talks on MLOps in production.",
    deadline: "2026-06-20T23:59:59",
    topics: ["MLOps", "Production ML", "CI/CD for ML"],
    status: "open" as const,
    eventTitle: "Delhi MLOps Meetup",
  },
];

function daysUntil(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function CfpsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Call for Papers
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Your ideas deserve a stage. Submit talk proposals to upcoming community events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockCfps.map((cfp) => {
          const days = daysUntil(cfp.deadline);
          return (
            <div
              key={cfp.id}
              className="rounded-xl border border-border bg-bg-secondary p-6 md:p-8 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-border-strong"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="success">Open</Badge>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="size-3" />
                      {days} days left
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold mb-2">{cfp.title}</h2>
                  <p className="text-text-secondary text-sm mb-4">{cfp.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {cfp.topics.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[160px]">
                  <Button variant="gradient" size="sm" asChild>
                    <Link href={`/cfps/${cfp.id}`}>
                      <FileText className="size-4" />
                      Submit Proposal
                    </Link>
                  </Button>
                  <span className="text-xs text-text-muted text-center md:text-right">
                    Deadline: {new Date(cfp.deadline).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
