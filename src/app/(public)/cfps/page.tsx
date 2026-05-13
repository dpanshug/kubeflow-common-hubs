import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOpenCfps } from "@/lib/cfp/actions";
import { daysUntil, getCfpStatusBadge } from "@/lib/cfp/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Call for Papers",
  description:
    "Submit your talk proposals to upcoming Kubeflow community events in India.",
};

export default async function CfpsPage() {
  const cfpList = await getOpenCfps();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Call for Papers
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Your ideas deserve a stage. Submit talk proposals to upcoming community
          events.
        </p>
      </div>

      {cfpList.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No open CFPs right now.</p>
          <p className="text-sm">Check back soon for upcoming opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cfpList.map((cfp) => {
            const days = daysUntil(cfp.deadline);
            const statusBadge = getCfpStatusBadge(cfp.status);
            return (
              <div
                key={cfp.id}
                className="rounded-xl border border-border bg-bg-secondary p-6 md:p-8 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-border-strong"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      {cfp.status === "open" && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="size-3" />
                          {days} days left
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold mb-2">{cfp.title}</h2>
                    <p className="text-text-secondary text-sm mb-4">
                      {cfp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {cfp.topics?.map((topic) => (
                        <Badge key={topic} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[160px]">
                    <Button variant="gradient" size="sm" asChild>
                      <Link href={`/cfps/${cfp.id}`}>
                        <ArrowRight className="size-4" />
                        View Details
                      </Link>
                    </Button>
                    <span className="text-xs text-text-muted text-center md:text-right">
                      Deadline:{" "}
                      {new Date(cfp.deadline).toLocaleDateString("en-IN", {
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
      )}
    </div>
  );
}
