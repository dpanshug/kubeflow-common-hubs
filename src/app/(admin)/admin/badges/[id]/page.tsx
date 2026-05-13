import { notFound } from "next/navigation";
import { getBadgeById, getBadgeAwardHistory } from "@/lib/admin/badges";
import { BadgeForm } from "../badge-form";
import { BadgeActions } from "./badge-actions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const badge = await getBadgeById(id);
  return { title: badge ? `Edit: ${badge.name}` : "Badge Not Found" };
}

export default async function EditBadgePage({ params }: Props) {
  const { id } = await params;
  const badge = await getBadgeById(id);

  if (!badge) notFound();

  const awardHistory = await getBadgeAwardHistory(id);

  const initial = {
    name: badge.name,
    description: badge.description,
    imageUrl: badge.imageUrl || "",
    criteriaDescription: badge.criteriaDescription || "",
    category: badge.category as "contribution" | "community" | "engagement" | "special",
    tier: badge.tier as "bronze" | "silver" | "gold" | "platinum",
    isAuto: badge.isAuto,
    pointsValue: badge.pointsValue,
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit Badge</h1>
        <p className="text-sm text-text-muted mt-1">{badge.name}</p>
      </div>

      <BadgeActions badgeId={id} isActive={badge.isActive} />

      <BadgeForm badgeId={id} initialValues={initial} />

      {awardHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Award History ({awardHistory.length})
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-text-muted">User</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Reason</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Awarded</th>
                </tr>
              </thead>
              <tbody>
                {awardHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border last:border-0 hover:bg-bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{entry.userName}</div>
                      <div className="text-xs text-text-muted">{entry.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{entry.reason || "—"}</td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(entry.awardedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
