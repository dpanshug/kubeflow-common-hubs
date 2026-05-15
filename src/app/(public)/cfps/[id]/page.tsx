import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronRight, ArrowLeft, Send, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_URL, CFP_TALK_TYPES } from "@/lib/constants";
import { getCfpById, getUserSubmissionForCfp } from "@/lib/cfp/actions";
import { daysUntil, getCfpStatusBadge, isDeadlinePassed } from "@/lib/cfp/utils";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cfp = await getCfpById(id);

  if (!cfp) {
    return { title: "CFP Not Found" };
  }

  return {
    title: cfp.title,
    description: cfp.description,
    openGraph: {
      title: cfp.title,
      description: cfp.description,
      url: `${SITE_URL}/cfps/${cfp.id}`,
      type: "website",
    },
  };
}

export default async function CfpDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cfp = await getCfpById(id);

  if (!cfp) {
    notFound();
  }

  const days = daysUntil(cfp.deadline);
  const statusBadge = getCfpStatusBadge(cfp.status);
  const deadlinePassed = isDeadlinePassed(cfp.deadline);
  const canSubmit = cfp.status === "open" && !deadlinePassed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingSubmission: { id: string } | null = null;
  if (user) {
    try {
      existingSubmission = await getUserSubmissionForCfp(cfp.id);
    } catch {
      // not authenticated or error — fine
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link
              href="/cfps"
              className="hover:text-text-primary transition-colors"
            >
              Call for Papers
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li
            className="text-text-secondary truncate max-w-[250px] sm:max-w-none"
            aria-current="page"
          >
            {cfp.title}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          {cfp.status === "open" && !deadlinePassed && (
            <span className="text-sm text-text-muted flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {days} days left
            </span>
          )}
          {deadlinePassed && cfp.status === "open" && (
            <Badge variant="destructive">Deadline Passed</Badge>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
          {cfp.title}
        </h1>
        <p className="text-text-secondary text-lg">{cfp.description}</p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-bg-secondary p-5">
          <p className="text-xs font-medium text-text-muted mb-2">Deadline</p>
          <p className="font-medium">
            {new Date(cfp.deadline).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-secondary p-5">
          <p className="text-xs font-medium text-text-muted mb-2">Status</p>
          <p className="font-medium capitalize">{cfp.status}</p>
        </div>
      </div>

      {/* Topics */}
      {cfp.topics && cfp.topics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {cfp.topics.map((topic) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      {cfp.guidelines && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Submission Guidelines</h2>
          <div className="rounded-xl border border-border bg-bg-secondary p-6">
            <p className="text-text-secondary leading-relaxed">
              {cfp.guidelines}
            </p>
          </div>
        </div>
      )}

      {/* Accepted formats */}
      {cfp.acceptedFormats && cfp.acceptedFormats.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Accepted Formats</h2>
          <div className="flex flex-wrap gap-2">
            {cfp.acceptedFormats.map((format) => {
              const typeInfo = CFP_TALK_TYPES.find((t) => t.value === format);
              return (
                <Badge key={format} variant="secondary">
                  {typeInfo?.label ?? format.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit / Auth CTA */}
      <div className="mb-8">
        {existingSubmission ? (
          <Button variant="outline" asChild>
            <Link href={`/submissions/${existingSubmission.id}`}>
              <Eye className="size-4" />
              View My Submission
            </Link>
          </Button>
        ) : canSubmit ? (
          <Button variant="gradient" asChild>
            <Link href={`/cfps/${cfp.id}/submit`}>
              <Send className="size-4" />
              Submit Proposal
            </Link>
          </Button>
        ) : (
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Submissions Closed
          </Badge>
        )}
      </div>

      {/* Back link */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/cfps">
            <ArrowLeft className="size-4" />
            Back to CFPs
          </Link>
        </Button>
      </div>
    </div>
  );
}
