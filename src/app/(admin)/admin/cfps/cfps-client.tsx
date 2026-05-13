"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableToolbar, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface CfpRow {
  id: string;
  title: string;
  status: string;
  deadline: Date;
  createdAt: Date;
  eventTitle: string | null;
  submissionCount: number | null;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
  draft: "secondary",
  open: "success",
  closed: "warning",
  reviewing: "default",
  finalized: "secondary",
};

const columns: ColumnDef<CfpRow, unknown>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/cfps/${row.original.id}`}
        className="font-medium text-text-primary hover:text-[var(--kf-blue)] transition-colors"
      >
        {row.original.title}
      </Link>
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
    accessorKey: "eventTitle",
    header: "Linked Event",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.eventTitle || "—"}</span>
    ),
  },
  {
    accessorKey: "submissionCount",
    header: "Submissions",
    cell: ({ row }) => (
      <Link
        href={`/admin/cfps/${row.original.id}/submissions`}
        className="text-[var(--kf-blue)] hover:underline"
      >
        {row.original.submissionCount ?? 0}
      </Link>
    ),
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => (
      <span className="text-text-muted whitespace-nowrap">
        {new Date(row.original.deadline).toLocaleDateString("en-IN", {
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
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Finalized", value: "finalized" },
];

interface CfpsClientProps {
  rows: CfpRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export function CfpsClient({
  rows,
  totalCount,
  page,
  pageSize,
  search,
  status,
}: CfpsClientProps) {
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
      router.push(`/admin/cfps?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder="Search CFPs..."
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
      <DataTable columns={columns} data={rows} emptyMessage="No CFPs found." />
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
