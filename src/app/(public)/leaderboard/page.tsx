import type { Metadata } from "next";
import { TrendingUp, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See the top contributors in the Kubeflow community in India.",
};

function getLevelName(level: number): string {
  return LEVELS.find((l) => l.level === level)?.name ?? "Newcomer";
}

const topMembers = [
  { rank: 1, name: "Rahul Sharma", points: 2850, level: 6, badges: 14, trend: "up" as const },
  { rank: 2, name: "Priya Patel", points: 2200, level: 5, badges: 11, trend: "up" as const },
  { rank: 3, name: "Amit Kumar", points: 1900, level: 5, badges: 10, trend: "same" as const },
  { rank: 4, name: "Sneha Reddy", points: 1450, level: 5, badges: 9, trend: "up" as const },
  { rank: 5, name: "Vikram Singh", points: 1100, level: 5, badges: 8, trend: "up" as const },
  { rank: 6, name: "Deepika Nair", points: 850, level: 4, badges: 7, trend: "up" as const },
  { rank: 7, name: "Arjun Mehta", points: 620, level: 4, badges: 6, trend: "same" as const },
  { rank: 8, name: "Kavita Joshi", points: 480, level: 4, badges: 5, trend: "up" as const },
  { rank: 9, name: "Rohan Das", points: 320, level: 3, badges: 4, trend: "up" as const },
  { rank: 10, name: "Ananya Gupta", points: 210, level: 3, badges: 3, trend: "up" as const },
];

const risingStars = [
  { name: "Meera K.", points: 85, level: 2, gained: 60 },
  { name: "Suresh R.", points: 72, level: 2, gained: 55 },
  { name: "Tanya M.", points: 65, level: 2, gained: 45 },
];

const periods = ["All Time", "This Year", "This Month", "This Week"];

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Leaderboard
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Recognizing the most active contributors in the Kubeflow community.
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg border border-border w-fit mb-8" role="tablist" aria-label="Leaderboard time period">
        {periods.map((period, i) => (
          <button
            key={period}
            role="tab"
            aria-selected={i === 0}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              i === 0
                ? "bg-bg-tertiary text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Podium - Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[topMembers[1], topMembers[0], topMembers[2]].map((member, podiumIndex) => {
          const isFirst = podiumIndex === 1;
          return (
            <div
              key={member.rank}
              className={cn(
                "flex flex-col items-center p-6 rounded-xl border bg-bg-secondary text-center",
                isFirst
                  ? "border-[var(--tier-gold)]/30 sm:-mt-4 shadow-lg shadow-[var(--tier-gold)]/5"
                  : "border-border"
              )}
            >
              {/* Rank */}
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center text-sm font-bold mb-3",
                  member.rank === 1
                    ? "bg-[var(--tier-gold)]/10 text-[var(--tier-gold)]"
                    : member.rank === 2
                      ? "bg-[var(--tier-silver)]/10 text-[var(--tier-silver)]"
                      : "bg-[var(--tier-bronze)]/10 text-[var(--tier-bronze)]"
                )}
              >
                #{member.rank}
              </div>

              {/* Avatar placeholder */}
              <div className="size-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] flex items-center justify-center text-white font-bold text-lg mb-3">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>

              <h3 className="font-semibold mb-1">{member.name}</h3>
              <p className="text-xs text-text-muted mb-3">
                Level {member.level} · {getLevelName(member.level)}
              </p>
              <div className="text-2xl font-bold font-mono text-[var(--kf-blue)]">
                {member.points.toLocaleString()}
              </div>
              <p className="text-xs text-text-muted">points</p>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <th className="text-left p-4 font-medium">Rank</th>
                <th className="text-left p-4 font-medium">Member</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Level</th>
                <th className="text-right p-4 font-medium hidden sm:table-cell">Badges</th>
                <th className="text-right p-4 font-medium">Points</th>
                <th className="text-center p-4 font-medium w-12">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topMembers.map((member) => (
                <tr
                  key={member.rank}
                  className="border-b border-border last:border-0 hover:bg-bg-tertiary/50 transition-colors"
                >
                  <td className="p-4 font-mono text-sm text-text-muted">
                    {member.rank}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-medium">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-sm">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary hidden sm:table-cell">
                    Lv. {member.level}
                  </td>
                  <td className="p-4 text-sm text-text-secondary text-right hidden sm:table-cell">
                    {member.badges}
                  </td>
                  <td className="p-4 text-sm font-semibold font-mono text-right">
                    {member.points.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {member.trend === "up" ? (
                      <ArrowUp className="size-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Minus className="size-4 text-text-muted mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rising Stars */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="size-5 text-[var(--kf-teal)]" />
          <h2 className="text-xl font-semibold">Rising Stars</h2>
          <span className="text-sm text-text-muted">- Newcomers gaining the most points this week</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {risingStars.map((star) => (
            <div
              key={star.name}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-secondary"
            >
              <div className="size-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-medium">
                {star.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{star.name}</div>
                <div className="text-xs text-text-muted">Level {star.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <ArrowUp className="size-3" />+{star.gained}
                </div>
                <div className="text-xs text-text-muted">{star.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
