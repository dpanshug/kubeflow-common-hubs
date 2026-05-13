"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface AuditRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  oldValues: unknown;
  newValues: unknown;
  createdAt: Date;
  actorName: string | null;
  actorEmail: string | null;
}

const columns: ColumnDef<AuditRow, unknown>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">
        {row.original.action}
      </span>
    ),
  },
  {
    accessorKey: "actorName",
    header: "Actor",
    cell: ({ row }) => (
      <span className="text-text-secondary">
        {row.original.actorName || row.original.actorEmail || "System"}
      </span>
    ),
  },
  {
    accessorKey: "targetType",
    header: "Target",
    cell: ({ row }) => (
      <div>
        <Badge variant="secondary">{row.original.targetType}</Badge>
        {row.original.targetId && (
          <span className="ml-1.5 font-mono text-xs text-text-muted">
            {row.original.targetId.slice(0, 8)}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => (
      <span className="text-text-muted whitespace-nowrap text-xs">
        {new Date(row.original.createdAt).toLocaleString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
];

interface AuditLogClientProps {
  rows: AuditRow[];
  totalCount: number;
  targetTypes: string[];
  page: number;
  pageSize: number;
  filters: {
    action: string;
    targetType: string;
    actor: string;
    from: string;
    to: string;
  };
}

export function AuditLogClient({
  rows,
  totalCount,
  targetTypes,
  page,
  pageSize,
  filters,
}: AuditLogClientProps) {
  const router = useRouter();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (
        updates.action !== undefined ||
        updates.targetType !== undefined ||
        updates.actor !== undefined ||
        updates.from !== undefined ||
        updates.to !== undefined
      ) {
        params.delete("page");
      }
      router.push(`/admin/audit-log?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <input
          type="text"
          value={filters.actor}
          onChange={(e) => updateParams({ actor: e.target.value })}
          placeholder="Search actor..."
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary placeholder:text-text-muted w-full sm:w-48"
        />
        <input
          type="text"
          value={filters.action}
          onChange={(e) => updateParams({ action: e.target.value })}
          placeholder="Filter by action..."
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary placeholder:text-text-muted w-full sm:w-48"
        />
        <select
          value={filters.targetType}
          onChange={(e) => updateParams({ targetType: e.target.value })}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary"
        >
          <option value="">All targets</option>
          {targetTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => updateParams({ from: e.target.value })}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary"
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => updateParams({ to: e.target.value })}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary"
          aria-label="To date"
        />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No audit log entries found."
      />
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
