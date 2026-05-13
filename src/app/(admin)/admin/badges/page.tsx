import Link from "next/link";
import { Plus } from "lucide-react";
import { listBadgesAdmin } from "@/lib/admin/badges";
import { Button } from "@/components/ui/button";
import { BadgesClient } from "./badges-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Badges" };

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string; category?: string; tier?: string }>;
}

export default async function AdminBadgesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const search = params.q || "";
  const category = params.category || "";
  const tier = params.tier || "";

  const { rows, totalCount } = await listBadgesAdmin({ page, pageSize, search, category, tier });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Badges</h1>
          <p className="text-sm text-text-muted mt-1">
            Create and manage achievement badges.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/badges/new">
            <Plus className="size-4" /> New Badge
          </Link>
        </Button>
      </div>

      <BadgesClient
        rows={rows}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={search}
        category={category}
        tier={tier}
      />
    </div>
  );
}
