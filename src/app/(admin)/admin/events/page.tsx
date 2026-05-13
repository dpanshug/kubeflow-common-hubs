import Link from "next/link";
import { Plus } from "lucide-react";
import { listEvents } from "@/lib/admin/events";
import { Button } from "@/components/ui/button";
import { EventsClient } from "./events-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Events" };

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string; status?: string }>;
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const search = params.q || "";
  const status = params.status || "";

  const { rows, totalCount } = await listEvents({ page, pageSize, search, status });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Events</h1>
          <p className="text-sm text-text-muted mt-1">
            Create and manage community events.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/events/new">
            <Plus className="size-4" /> New Event
          </Link>
        </Button>
      </div>

      <EventsClient
        rows={rows}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={search}
        status={status}
      />
    </div>
  );
}
