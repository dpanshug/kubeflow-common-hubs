import Link from "next/link";
import { Plus } from "lucide-react";
import { listNewsAdmin } from "@/lib/admin/news";
import { Button } from "@/components/ui/button";
import { NewsClient } from "./news-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: News" };

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string; status?: string }>;
}

export default async function AdminNewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const search = params.q || "";
  const status = params.status || "";

  const { rows, totalCount } = await listNewsAdmin({ page, pageSize, search, status });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">News</h1>
          <p className="text-sm text-text-muted mt-1">
            Create and manage news articles.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/news/new">
            <Plus className="size-4" /> New Post
          </Link>
        </Button>
      </div>

      <NewsClient
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
