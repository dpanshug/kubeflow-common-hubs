import { notFound } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";
import { getCfpByIdAdmin } from "@/lib/admin/cfps";
import { CfpForm } from "../cfp-form";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cfp = await getCfpByIdAdmin(id);
  return { title: cfp ? `Edit: ${cfp.title}` : "CFP Not Found" };
}

export default async function EditCfpPage({ params }: Props) {
  const { id } = await params;
  const cfp = await getCfpByIdAdmin(id);

  if (!cfp) notFound();

  const eventList = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(isNull(events.deletedAt))
    .orderBy(desc(events.eventDate))
    .limit(50);

  const initial = {
    title: cfp.title,
    description: cfp.description,
    guidelines: cfp.guidelines || "",
    deadline: cfp.deadline.toISOString().slice(0, 16),
    topics: cfp.topics ?? [],
    status: cfp.status as "draft" | "open" | "closed" | "reviewing" | "finalized",
    eventId: cfp.eventId || "",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit CFP</h1>
        <p className="text-sm text-text-muted mt-1">{cfp.title}</p>
      </div>
      <CfpForm cfpId={id} initialValues={initial} events={eventList} />
    </div>
  );
}
