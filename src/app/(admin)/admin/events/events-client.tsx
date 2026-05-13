"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableToolbar, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface EventRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  city: string | null;
  eventDate: Date;
  deletedAt: Date | null;
  attendeeCount: number | null;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
  draft: "secondary",
  upcoming: "default",
  live: "success",
  completed: "secondary",
  cancelled: "destructive",
};

const columns: ColumnDef<EventRow, unknown>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/events/${row.original.id}`}
        className="font-medium text-text-primary hover:text-[var(--kf-blue)] transition-colors"
      >
        {row.original.title}
        {row.original.deletedAt && (
          <Badge variant="destructive" className="ml-2">Deleted</Badge>
        )}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type as "meetup" | "conference" | "workshop" | "hackathon" | "webinar"}>
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] || "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.city || "—"}</span>
    ),
  },
  {
    accessorKey: "attendeeCount",
    header: "Attendees",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.attendeeCount ?? 0}</span>
    ),
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-text-muted whitespace-nowrap">
        {new Date(row.original.eventDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Deleted", value: "deleted" },
];

interface EventsClientProps {
  rows: EventRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export function EventsClient({
  rows,
  totalCount,
  page,
  pageSize,
  search,
  status,
}: EventsClientProps) {
  const router = useRouter();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.q !== undefined || updates.status !== undefined) {
        params.delete("page");
      }
      router.push(`/admin/events?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder="Search events..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: STATUS_OPTIONS,
            value: status,
            onChange: (v) => updateParams({ status: v }),
          },
        ]}
      />
      <DataTable columns={columns} data={rows} emptyMessage="No events found." />
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onPageSizeChange={(s) =>
          updateParams({ pageSize: String(s), page: "1" })
        }
      />
    </>
  );
}
