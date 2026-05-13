import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getMySubmissions } from "@/lib/cfp/actions";
import { Badge } from "@/components/ui/badge";
import { getSubmissionStatusBadge, type CfpSubmissionStatus } from "@/lib/cfp/utils";
import { CFP_TALK_TYPES } from "@/lib/constants";
import { EmptyState } from "@/components/profile/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Submissions",
};

export default async function MySubmissionsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?next=/submissions");
  }

  const { items } = await getMySubmissions(1, 100);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">My Submissions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Track the status of your CFP proposals.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8" />}
          title="No submissions yet"
          description="You haven't submitted any proposals. Browse open CFPs to get started."
          actionLabel="Browse CFPs"
          actionHref="/cfps"
        />
      ) : (
        <div className="space-y-3">
          {items.map((submission) => {
            const statusBadge = getSubmissionStatusBadge(
              submission.status as CfpSubmissionStatus
            );
            const talkTypeLabel =
              CFP_TALK_TYPES.find((t) => t.value === submission.talkType)
                ?.label ?? submission.talkType;

            return (
              <Link
                key={submission.id}
                href={`/submissions/${submission.id}`}
                className="block rounded-xl border border-border bg-bg-secondary p-5 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Badge variant="secondary">{talkTypeLabel}</Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1 truncate">
                      {submission.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {submission.cfpTitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(submission.createdAt).toLocaleDateString(
                        "en-IN",
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                    {submission.avgRating !== null &&
                      submission.cfpStatus === "finalized" && (
                        <p className="text-xs text-text-secondary mt-1">
                          Rating: {submission.avgRating}/5
                        </p>
                      )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
