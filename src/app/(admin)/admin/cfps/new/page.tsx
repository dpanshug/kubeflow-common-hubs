import { db } from "@/db";
import { events } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";
import { CfpForm } from "../cfp-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Create CFP" };

export default async function NewCfpPage() {
  const eventList = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(isNull(events.deletedAt))
    .orderBy(desc(events.eventDate))
    .limit(50);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create CFP</h1>
        <p className="text-sm text-text-muted mt-1">
          Set up a new Call for Papers.
        </p>
      </div>
      <CfpForm events={eventList} />
    </div>
  );
}
