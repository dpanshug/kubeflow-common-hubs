import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { cfps, cfpSubmissions, profiles } from "@/db/schema";
import { isDeadlinePassed, isValidUuid } from "@/lib/cfp/utils";
import { SubmissionWizard } from "./wizard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isValidUuid(id)) return { title: "Submit Proposal" };

  const [cfp] = await db
    .select({ title: cfps.title })
    .from(cfps)
    .where(eq(cfps.id, id))
    .limit(1);

  return {
    title: cfp ? `Submit to ${cfp.title}` : "Submit Proposal",
  };
}

export default async function SubmitCfpPage({ params }: PageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cfps/${id}/submit`);
  }

  const [cfp] = await db.select().from(cfps).where(eq(cfps.id, id)).limit(1);

  if (!cfp) {
    notFound();
  }

  if (cfp.status !== "open" || isDeadlinePassed(cfp.deadline)) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="size-7 text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Submissions Closed</h1>
        <p className="text-text-secondary mb-6">
          This CFP is no longer accepting submissions.
        </p>
        <Button variant="outline" asChild>
          <Link href={`/cfps/${id}`}>
            <ArrowLeft className="size-4" />
            Back to CFP
          </Link>
        </Button>
      </div>
    );
  }

  const [existingSub] = await db
    .select({ id: cfpSubmissions.id })
    .from(cfpSubmissions)
    .where(
      and(eq(cfpSubmissions.cfpId, id), eq(cfpSubmissions.userId, user.id))
    )
    .limit(1);

  if (existingSub) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Already Submitted</h1>
        <p className="text-text-secondary mb-6">
          You&apos;ve already submitted a proposal to this CFP.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/cfps/${id}`}>
              <ArrowLeft className="size-4" />
              Back to CFP
            </Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href={`/submissions/${existingSub.id}`}>
              View My Submission
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const [profile] = await db
    .select({ bio: profiles.bio })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href={`/cfps/${id}`}
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="size-3" /> Back to {cfp.title}
        </Link>
      </div>

      <SubmissionWizard
        cfpId={cfp.id}
        cfpTitle={cfp.title}
        cfpDeadline={cfp.deadline.toISOString()}
        acceptedFormats={cfp.acceptedFormats ?? []}
        defaultSpeakerBio={profile?.bio ?? ""}
      />
    </div>
  );
}
