import {
  Users,
  Calendar,
  MessageSquareText,
  Award,
  Newspaper,
  FileText,
} from "lucide-react";
import { getDashboardMetrics, getRecentActivity } from "@/lib/admin/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="rounded-lg bg-[var(--kf-blue)]/10 p-2.5">
          <Icon className="size-5 text-[var(--kf-blue)]" />
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function actionLabel(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminDashboardPage() {
  const [metrics, recentActivity] = await Promise.all([
    getDashboardMetrics(),
    getRecentActivity(10),
  ]);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of your community platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Total Users" value={metrics.users} icon={Users} />
        <MetricCard label="Events" value={metrics.events} icon={Calendar} />
        <MetricCard
          label="Pending Submissions"
          value={metrics.pendingSubmissions}
          icon={MessageSquareText}
        />
        <MetricCard label="Badges" value={metrics.badges} icon={Award} />
        <MetricCard label="News Posts" value={metrics.news} icon={Newspaper} />
        <MetricCard
          label="Total CFP Submissions"
          value={metrics.totalSubmissions}
          icon={FileText}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">
            No recent activity yet.
          </p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-text-muted">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">
                      Actor
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">
                      Target
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border last:border-0 hover:bg-bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {actionLabel(entry.action)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {entry.actorName || entry.actorEmail || "System"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {entry.targetType}
                        {entry.targetId && (
                          <span className="ml-1 font-mono text-xs">
                            {entry.targetId.slice(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
