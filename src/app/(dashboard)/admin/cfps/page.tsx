import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getAdminCfpList } from "@/lib/cfp/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCfpStatusBadge, daysUntil, type CfpStatus } from "@/lib/cfp/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin: CFPs",
};

export default async function AdminCfpsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const role = currentUser.user.role;
  if (role !== "admin" && role !== "superadmin" && role !== "moderator") {
    redirect("/");
  }

  const cfpList = await getAdminCfpList();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default">Admin</Badge>
            <h1 className="text-2xl font-bold text-text-primary">
              CFP Management
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            Review and manage Call for Papers submissions.
          </p>
        </div>
      </div>

      {cfpList.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <FileText className="size-8 mx-auto mb-3 opacity-50" />
          <p>No CFPs found. Create one from the Supabase dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cfpList.map((cfp) => {
            const statusBadge = getCfpStatusBadge(cfp.status as CfpStatus);
            const days = daysUntil(cfp.deadline);

            return (
              <div
                key={cfp.id}
                className="rounded-xl border border-border bg-bg-secondary p-6 transition-all hover:border-border-strong"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                    <h2 className="text-lg font-semibold mb-1">{cfp.title}</h2>
                    <p className="text-sm text-text-muted">
                      {cfp.submissionCount} submission
                      {cfp.submissionCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/cfps/${cfp.id}/submissions`}>
                      Review Submissions <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
