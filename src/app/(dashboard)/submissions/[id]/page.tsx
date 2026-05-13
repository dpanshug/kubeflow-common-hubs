import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getSubmissionDetail } from "@/lib/cfp/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSubmissionStatusBadge,
  type CfpSubmissionStatus,
} from "@/lib/cfp/utils";
import { CFP_TALK_TYPES } from "@/lib/constants";
import type { Metadata } from "next";

const getCachedUser = cache(() => getCurrentUser());
const getCachedSubmission = cache((id: string) => getSubmissionDetail(id));

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const currentUser = await getCachedUser();
  if (!currentUser) return { title: "Submission" };

  const submission = await getCachedSubmission(id);
  return {
    title: submission ? submission.title : "Submission Not Found",
  };
}

const PIPELINE_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "in_review", label: "In Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "approved", label: "Approved" },
] as const;

function StatusPipeline({ currentStatus }: { currentStatus: string }) {
  const isRejected = currentStatus === "rejected";
  const isWaitlisted = currentStatus === "waitlisted";

  const stepOrder = PIPELINE_STEPS.map((s) => s.key);
  const currentIdx = stepOrder.indexOf(currentStatus as typeof stepOrder[number]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const isPast =
            currentIdx >= 0 ? idx < currentIdx : idx === 0 && !isRejected;
          const isCurrent = step.key === currentStatus;
          const isFuture = !isPast && !isCurrent;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex items-center justify-center size-8 rounded-full transition-colors ${
                    isPast
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                        ? "bg-[var(--kf-blue)] text-white"
                        : "bg-bg-tertiary text-text-muted"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="size-4" />
                  ) : isCurrent ? (
                    <Circle className="size-4 fill-current" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    isCurrent
                      ? "text-[var(--kf-blue)]"
                      : isFuture
                        ? "text-text-muted"
                        : "text-emerald-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 rounded-full mt-[-14px] ${
                    isPast ? "bg-emerald-500/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
          <XCircle className="size-4" />
          <span>Not selected for this event</span>
        </div>
      )}
      {isWaitlisted && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
          <Clock className="size-4" />
          <span>Waitlisted — you&apos;ll be notified if a slot opens</span>
        </div>
      )}
    </div>
  );
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const currentUser = await getCachedUser();
  if (!currentUser) {
    redirect("/login?next=/submissions");
  }

  const { id } = await params;
  const submission = await getCachedSubmission(id);

  if (!submission) {
    notFound();
  }

  const statusBadge = getSubmissionStatusBadge(
    submission.status as CfpSubmissionStatus
  );
  const talkTypeLabel =
    CFP_TALK_TYPES.find((t) => t.value === submission.talkType)?.label ??
    submission.talkType;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link
              href="/submissions"
              className="hover:text-text-primary transition-colors"
            >
              My Submissions
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li
            className="text-text-secondary truncate max-w-[200px] sm:max-w-none"
            aria-current="page"
          >
            {submission.title}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge variant="secondary">{talkTypeLabel}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {submission.title}
        </h1>
        <p className="text-sm text-text-muted">
          Submitted to{" "}
          <Link
            href={`/cfps/${submission.cfpId}`}
            className="text-[var(--kf-blue)] hover:underline"
          >
            {submission.cfpTitle}
          </Link>{" "}
          on{" "}
          {new Date(submission.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Status pipeline */}
      <StatusPipeline currentStatus={submission.status} />

      {/* Admin feedback */}
      {submission.adminFeedback && (
        <div className="mb-6 rounded-xl border border-[var(--kf-blue)]/20 bg-[var(--kf-blue)]/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-4 text-[var(--kf-blue)]" />
            <p className="text-sm font-medium">Reviewer Feedback</p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {submission.adminFeedback}
          </p>
        </div>
      )}

      {/* Submission content */}
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-muted mb-3">
            Abstract
          </h2>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {submission.abstract}
          </p>
        </section>

        {submission.outline && (
          <section className="rounded-xl border border-border bg-bg-secondary p-6">
            <h2 className="text-sm font-semibold text-text-muted mb-3">
              Talk Outline
            </h2>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {submission.outline}
            </p>
          </section>
        )}

        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-muted mb-3">
            Speaker Bio
          </h2>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {submission.speakerBio}
          </p>
        </section>

        {submission.avgRating !== null &&
          submission.cfpStatus === "finalized" && (
            <section className="rounded-xl border border-border bg-bg-secondary p-6">
              <h2 className="text-sm font-semibold text-text-muted mb-3">
                Average Rating
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {submission.avgRating}
                </span>
                <span className="text-text-muted">/ 5</span>
              </div>
            </section>
          )}
      </div>

      {/* Back */}
      <div className="mt-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/submissions">
            <ArrowLeft className="size-4" />
            Back to Submissions
          </Link>
        </Button>
      </div>
    </div>
  );
}
