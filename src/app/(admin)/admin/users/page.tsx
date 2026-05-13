import { listUsers } from "@/lib/admin/users";
import { UsersClient } from "./users-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Users" };

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const search = params.q || "";
  const role = params.role || "";

  const { rows, totalCount } = await listUsers({ page, pageSize, search, role });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage community members, roles, and suspensions.
          </p>
        </div>
      </div>

      <UsersClient
        rows={rows}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={search}
        role={role}
      />
    </div>
  );
}
