"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableToolbar, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface NewsRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[] | null;
  publishedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
  authorName: string | null;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
};

const columns: ColumnDef<NewsRow, unknown>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/news/${row.original.id}`}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] || "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "authorName",
    header: "Author",
    cell: ({ row }) => (
      <span className="text-text-secondary">{row.original.authorName || "—"}</span>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) =>
      row.original.tags && row.original.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-text-muted">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-text-muted whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
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
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
  { label: "Deleted", value: "deleted" },
];

interface NewsClientProps {
  rows: NewsRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export function NewsClient({
  rows,
  totalCount,
  page,
  pageSize,
  search,
  status,
}: NewsClientProps) {
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
      router.push(`/admin/news?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder="Search news..."
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
      <DataTable columns={columns} data={rows} emptyMessage="No news posts found." />
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
