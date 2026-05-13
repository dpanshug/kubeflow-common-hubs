import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronRight, ArrowLeft, FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";
import { mockCfps, getCfpById, daysUntil, getCfpStatusBadge } from "../mock-data";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return mockCfps.map((cfp) => ({ id: cfp.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cfp = getCfpById(id);

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
  const cfp = getCfpById(id);

  if (!cfp) {
    notFound();
  }

  const days = daysUntil(cfp.deadline);
  const statusBadge = getCfpStatusBadge(cfp.status);

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
          {cfp.status === "open" && (
            <span className="text-sm text-text-muted flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {days} days left
            </span>
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
          <p className="text-xs font-medium text-text-muted mb-2">
            Associated Event
          </p>
          <p className="font-medium">{cfp.eventTitle}</p>
        </div>
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
      </div>

      {/* Topics */}
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
            {cfp.acceptedFormats.map((format) => (
              <Badge key={format} variant="secondary">
                {format.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Coming soon card */}
      <div className="rounded-xl border-2 border-dashed border-border bg-bg-secondary p-8 text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--kf-blue)]/10">
            <FileText className="size-7 text-[var(--kf-blue)]" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Submission Form Coming Soon
        </h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
          We&apos;re building a streamlined submission experience. In the
          meantime, you can prepare your talk proposal and abstract.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <Info className="size-3.5" />
          <span>
            The submission wizard will be available as part of our next update.
          </span>
        </div>
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
