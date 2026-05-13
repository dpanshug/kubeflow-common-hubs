import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getSubmissionForReview } from "@/lib/cfp/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSubmissionStatusBadge,
  type CfpSubmissionStatus,
} from "@/lib/cfp/utils";
import { CFP_TALK_TYPES } from "@/lib/constants";
import { getValidTransitions } from "@/lib/validations/cfp";
import { ReviewForm } from "./review-form";
import { StatusControls } from "./status-controls";
import type { Metadata } from "next";

const getCachedUser = cache(() => getCurrentUser());
const getCachedReview = cache((id: string) =>
  getSubmissionForReview(id).catch(() => null)
);

interface PageProps {
  params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subId } = await params;
  const data = await getCachedReview(subId);
  return {
    title: data ? `Review: ${data.submission.title}` : "Review Submission",
  };
}

export default async function AdminReviewPage({ params }: PageProps) {
  const currentUser = await getCachedUser();
  if (!currentUser) redirect("/login");

  const role = currentUser.user.role;
  if (role !== "admin" && role !== "superadmin" && role !== "moderator") {
    redirect("/");
  }

  const { id: cfpId, subId } = await params;
  const data = await getCachedReview(subId);
  if (!data) notFound();

  const { submission, reviews } = data;
  const statusBadge = getSubmissionStatusBadge(
    submission.status as CfpSubmissionStatus
  );
  const talkLabel =
    CFP_TALK_TYPES.find((t) => t.value === submission.talkType)?.label ??
    submission.talkType;
  const validTransitions = getValidTransitions(submission.status);

  const existingReview = reviews.find(
    (r) => r.reviewerId === currentUser.user.id
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link
              href="/admin/cfps"
              className="hover:text-text-primary transition-colors"
            >
              Admin: CFPs
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link
              href={`/admin/cfps/${cfpId}/submissions`}
              className="hover:text-text-primary transition-colors"
            >
              {submission.cfpTitle}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-text-secondary truncate max-w-[150px] sm:max-w-none">
            {submission.title}
          </li>
        </ol>
      </nav>

      {/* Header with quick actions */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default">Admin</Badge>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge variant="secondary">{talkLabel}</Badge>
          {submission.avgRating !== null && (
            <span className="text-sm text-text-muted flex items-center gap-1">
              <Star className="size-3.5" />
              Avg: {submission.avgRating}/5
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {submission.title}
        </h1>
        <p className="text-sm text-text-muted">
          by {submission.speakerName} ({submission.speakerEmail})
        </p>
      </div>

      {/* Status change controls */}
      {validTransitions.length > 0 && (
        <StatusControls
          submissionId={subId}
          currentStatus={submission.status}
          validTransitions={validTransitions}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
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
        </div>

        {/* Sidebar: Review form + history */}
        <div className="space-y-6">
          <ReviewForm
            submissionId={subId}
            existingRating={existingReview?.rating}
            existingFeedback={existingReview?.feedback ?? ""}
            existingNotes={existingReview?.internalNotes ?? ""}
          />

          {/* Review history */}
          {reviews.length > 0 && (
            <section className="rounded-xl border border-border bg-bg-secondary p-6">
              <h2 className="text-sm font-semibold text-text-muted mb-3">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {review.reviewerName}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Star className="size-3" />
                        {review.rating}/5
                      </span>
                    </div>
                    {review.feedback && (
                      <p className="text-xs text-text-secondary">
                        {review.feedback}
                      </p>
                    )}
                    {review.internalNotes && (
                      <p className="text-xs text-text-muted mt-1 italic">
                        Note: {review.internalNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Back */}
      <div className="mt-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/cfps/${cfpId}/submissions`}>
            <ArrowLeft className="size-4" />
            Back to Submissions
          </Link>
        </Button>
      </div>
    </div>
  );
}
