import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subId } = await params;
  const data = await getCachedReview(subId);
  return { title: data ? `Review: ${data.submission.title}` : "Review Submission" };
}

export default async function AdminReviewPage({ params }: PageProps) {
  const currentUser = await getCachedUser();
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
    (r) => r.reviewerId === currentUser?.user.id
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
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
          by {submission.speakerName ?? submission.guestName ?? "Unknown"} ({submission.speakerEmail ?? submission.guestEmail ?? "N/A"})
          {!submission.userId && <span className="ml-1 text-xs text-amber-400">(guest)</span>}
        </p>
      </div>

      {validTransitions.length > 0 && (
        <StatusControls
          submissionId={subId}
          currentStatus={submission.status}
          validTransitions={validTransitions}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-bg-secondary p-6">
            <h2 className="text-sm font-semibold text-text-muted mb-3">Abstract</h2>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {submission.abstract}
            </p>
          </section>

          {submission.outline && (
            <section className="rounded-xl border border-border bg-bg-secondary p-6">
              <h2 className="text-sm font-semibold text-text-muted mb-3">Talk Outline</h2>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {submission.outline}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-bg-secondary p-6">
            <h2 className="text-sm font-semibold text-text-muted mb-3">Speaker Bio</h2>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {submission.speakerBio}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <ReviewForm
            submissionId={subId}
            existingRating={existingReview?.rating}
            existingFeedback={existingReview?.feedback ?? ""}
            existingNotes={existingReview?.internalNotes ?? ""}
          />

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
                      <p className="text-xs text-text-secondary">{review.feedback}</p>
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

      <div className="pt-4">
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
