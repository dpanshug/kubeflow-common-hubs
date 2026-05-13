import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getCfpById, getCfpSubmissions } from "@/lib/cfp/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSubmissionStatusBadge,
  type CfpSubmissionStatus,
} from "@/lib/cfp/utils";
import { CFP_TALK_TYPES } from "@/lib/constants";
import type { Metadata } from "next";

const getCachedCfp = cache((id: string) => getCfpById(id));

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cfp = await getCachedCfp(id);
  return {
    title: cfp ? `Review: ${cfp.title}` : "Review Submissions",
  };
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "in_review", label: "In Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
];

export default async function AdminSubmissionsPage({
  params,
  searchParams,
}: PageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const role = currentUser.user.role;
  if (role !== "admin" && role !== "superadmin" && role !== "moderator") {
    redirect("/");
  }

  const { id } = await params;
  const { status: statusFilter } = await searchParams;

  const cfp = await getCachedCfp(id);
  if (!cfp) notFound();

  const { items } = await getCfpSubmissions(id, statusFilter || "all");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
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
          <li className="text-text-secondary truncate max-w-[200px] sm:max-w-none">
            {cfp.title}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="default">Admin</Badge>
          <h1 className="text-2xl font-bold">Submissions</h1>
        </div>
        <p className="text-sm text-text-secondary">{cfp.title}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((filter) => {
          const isActive =
            (!statusFilter && filter.value === "all") ||
            statusFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={
                filter.value === "all"
                  ? `/admin/cfps/${id}/submissions`
                  : `/admin/cfps/${id}/submissions?status=${filter.value}`
              }
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-bg-secondary border border-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Submissions list */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>No submissions found{statusFilter ? ` with status "${statusFilter}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((sub) => {
            const statusBadge = getSubmissionStatusBadge(
              sub.status as CfpSubmissionStatus
            );
            const talkLabel =
              CFP_TALK_TYPES.find((t) => t.value === sub.talkType)?.label ??
              sub.talkType;

            return (
              <Link
                key={sub.id}
                href={`/admin/cfps/${id}/submissions/${sub.id}`}
                className="block rounded-xl border border-border bg-bg-secondary p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Badge variant="secondary">{talkLabel}</Badge>
                      {sub.avgRating !== null && (
                        <span className="text-xs text-text-muted">
                          Avg: {sub.avgRating}/5
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 truncate">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      by {sub.speakerName}
                    </p>
                  </div>
                  <div className="text-xs text-text-muted shrink-0">
                    {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Back */}
      <div className="mt-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cfps">
            <ArrowLeft className="size-4" />
            Back to CFPs
          </Link>
        </Button>
      </div>
    </div>
  );
}
