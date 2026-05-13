"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableToolbar, DataTablePagination } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface BadgeRow {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  isAuto: boolean;
  isActive: boolean;
  pointsValue: number;
  createdAt: Date;
  awardCount: number | null;
}

const TIER_VARIANT: Record<string, "default" | "secondary" | "warning" | "success"> = {
  bronze: "secondary",
  silver: "secondary",
  gold: "warning",
  platinum: "success",
};

const columns: ColumnDef<BadgeRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/badges/${row.original.id}`}
        className="font-medium text-text-primary hover:text-[var(--kf-blue)] transition-colors"
      >
        {row.original.name}
        {!row.original.isActive && (
          <Badge variant="secondary" className="ml-2">Inactive</Badge>
        )}
      </Link>
    ),
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => (
      <Badge variant={TIER_VARIANT[row.original.tier] || "secondary"}>
        {row.original.tier}
      </Badge>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-text-secondary capitalize">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "pointsValue",
    header: "Points",
    cell: ({ row }) => (
      <span className="font-mono text-text-muted">{row.original.pointsValue}</span>
    ),
  },
  {
    accessorKey: "awardCount",
    header: "Awarded",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.awardCount ?? 0}</span>
    ),
  },
  {
    accessorKey: "isAuto",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.isAuto ? "default" : "outline"}>
        {row.original.isAuto ? "Auto" : "Manual"}
      </Badge>
    ),
  },
];

const CATEGORY_OPTIONS = [
  { label: "Contribution", value: "contribution" },
  { label: "Community", value: "community" },
  { label: "Engagement", value: "engagement" },
  { label: "Special", value: "special" },
];

const TIER_OPTIONS = [
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
];

interface BadgesClientProps {
  rows: BadgeRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  category: string;
  tier: string;
}

export function BadgesClient({
  rows,
  totalCount,
  page,
  pageSize,
  search,
  category,
  tier,
}: BadgesClientProps) {
  const router = useRouter();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.q !== undefined || updates.category !== undefined || updates.tier !== undefined) {
        params.delete("page");
      }
      router.push(`/admin/badges?${params.toString()}`);
    },
    [router]
  );

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder="Search badges..."
        filters={[
          {
            key: "category",
            label: "Category",
            options: CATEGORY_OPTIONS,
            value: category,
            onChange: (v) => updateParams({ category: v }),
          },
          {
            key: "tier",
            label: "Tier",
            options: TIER_OPTIONS,
            value: tier,
            onChange: (v) => updateParams({ tier: v }),
          },
        ]}
      />
      <DataTable columns={columns} data={rows} emptyMessage="No badges found." />
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
