import Link from "next/link";
import { Plus } from "lucide-react";
import { listCfpsAdmin } from "@/lib/admin/cfps";
import { Button } from "@/components/ui/button";
import { CfpsClient } from "./cfps-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: CFPs" };

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string; status?: string }>;
}

export default async function AdminCfpsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const search = params.q || "";
  const status = params.status || "";

  const { rows, totalCount } = await listCfpsAdmin({ page, pageSize, search, status });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">CFPs</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage Call for Papers and review submissions.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/cfps/new">
            <Plus className="size-4" /> New CFP
          </Link>
        </Button>
      </div>

      <CfpsClient
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
