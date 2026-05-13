import { queryAuditLog, getAuditTargetTypes } from "@/lib/admin/audit";
import { AuditLogClient } from "./audit-log-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Audit Log" };

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    action?: string;
    targetType?: string;
    actor?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));

  const [{ rows, totalCount }, targetTypes] = await Promise.all([
    queryAuditLog({
      page,
      pageSize,
      action: params.action,
      targetType: params.targetType,
      actorSearch: params.actor,
      dateFrom: params.from,
      dateTo: params.to,
    }),
    getAuditTargetTypes(),
  ]);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Log</h1>
        <p className="text-sm text-text-muted mt-1">
          Track all administrative actions across the platform.
        </p>
      </div>

      <AuditLogClient
        rows={rows}
        totalCount={totalCount}
        targetTypes={targetTypes}
        page={page}
        pageSize={pageSize}
        filters={{
          action: params.action || "",
          targetType: params.targetType || "",
          actor: params.actor || "",
          from: params.from || "",
          to: params.to || "",
        }}
      />
    </div>
  );
}
