"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableToolbar, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: Date;
  points: number | null;
  level: number | null;
}

const columns: ColumnDef<UserRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/users/${row.original.id}`}
        className="font-medium text-text-primary hover:text-[var(--kf-blue)] transition-colors"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-text-secondary">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      const variant =
        role === "superadmin" || role === "admin"
          ? "default"
          : role === "moderator"
            ? "warning"
            : "secondary";
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: "isSuspended",
    header: "Status",
    cell: ({ row }) =>
      row.original.isSuspended ? (
        <Badge variant="destructive">Suspended</Badge>
      ) : (
        <Badge variant="success">Active</Badge>
      ),
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.level ?? 1}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
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

const ROLE_OPTIONS = [
  { label: "Member", value: "member" },
  { label: "Moderator", value: "moderator" },
  { label: "Admin", value: "admin" },
  { label: "Superadmin", value: "superadmin" },
];

interface UsersClientProps {
  rows: UserRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  role: string;
}

export function UsersClient({
  rows,
  totalCount,
  page,
  pageSize,
  search,
  role,
}: UsersClientProps) {
  const router = useRouter();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.q !== undefined || updates.role !== undefined) {
        params.delete("page");
      }
      router.push(`/admin/users?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            key: "role",
            label: "Role",
            options: ROLE_OPTIONS,
            value: role,
            onChange: (v) => updateParams({ role: v }),
          },
        ]}
      />
      <DataTable columns={columns} data={rows} emptyMessage="No users found." />
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
