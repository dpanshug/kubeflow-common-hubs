import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { eq, desc, or, and, isNull } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Building,
  Globe,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { db } from "@/db";
import { users, profiles, userBadges, badges, activityLog, githubContributions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";
import { LEVELS } from "@/lib/constants";
import { LevelRing } from "@/components/profile/level-ring";
import { ContributionHeatmap } from "@/components/profile/contribution-heatmap";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { EmptyState } from "@/components/profile/empty-state";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { SyncButton } from "@/components/profile/sync-button";

interface PageProps {
  params: Promise<{ username: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getProfile = cache(async function getProfile(username: string) {
  const isUUID = UUID_REGEX.test(username);

  const result = await db
    .select()
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        isNull(users.deletedAt),
        isUUID
          ? or(eq(profiles.githubUsername, username), eq(users.id, username))
          : eq(profiles.githubUsername, username)
      )
    )
    .limit(1);

  return result[0] || null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    return { title: "Member Not Found" };
  }

  return {
    title: data.profiles?.displayName || data.users.name,
    description: data.profiles?.bio || `${data.users.name} - Kubeflow Community Member`,
  };
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    notFound();
  }

  const { users: user, profiles: profile } = data;
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.user?.id === user.id;

  const level = LEVELS.find((l) => l.level === (profile?.level ?? 1)) || LEVELS[0];

  const [earnedBadges, activities, contributions] = await Promise.all([
    db
      .select({ badge: badges, awardedAt: userBadges.awardedAt })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, user.id)),
    db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, user.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(20),
    db
      .select()
      .from(githubContributions)
      .where(eq(githubContributions.userId, user.id)),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
        <LevelRing level={profile?.level ?? 1} points={profile?.points ?? 0} size={96}>
          <div className="size-[84px] rounded-full bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" width={84} height={84} className="size-full object-cover rounded-full" />
            ) : (
              user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
          </div>
        </LevelRing>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {profile?.displayName || user.name}
              </h1>
              {profile?.title && (
                <p className="text-text-secondary mt-0.5">{profile.title}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                {profile?.company && (
                  <span className="flex items-center gap-1">
                    <Building className="size-3" /> {profile.company}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {profile.location}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-[var(--kf-blue)]/10 text-[var(--kf-blue)] font-medium">
                  Lv.{profile?.level ?? 1} {level.name}
                </span>
              </div>
            </div>
            {isOwner && (
              <Link
                href="/profile/edit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                <Pencil className="size-3" /> Edit
              </Link>
            )}
          </div>

          {profile?.bio && (
            <p className="text-sm text-text-secondary mt-3 max-w-xl">{profile.bio}</p>
          )}

          {/* Social links */}
          <div className="flex items-center gap-3 mt-3">
            {profile?.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
            )}
            {profile?.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
            )}
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full bg-bg-tertiary text-[11px] font-medium text-text-secondary border border-border"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Content */}
      <ProfileTabs
        tabs={[
          { id: "badges", label: "Badges", count: earnedBadges.length },
          { id: "contributions", label: "Contributions", count: contributions.length },
          { id: "timeline", label: "Timeline", count: activities.length },
        ]}
      >
        {{
          badges: (
            <section>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {earnedBadges.map(({ badge, awardedAt }) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-4 rounded-xl border border-border bg-bg-secondary text-center"
                    >
                      <div className="size-12 rounded-full bg-gradient-to-br from-[var(--kf-blue)]/20 to-[var(--kf-teal)]/20 flex items-center justify-center mb-2">
                        <span className="text-lg">🏆</span>
                      </div>
                      <p className="text-xs font-medium text-text-primary">{badge.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 capitalize">{badge.tier}</p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(awardedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No badges yet"
                  description="Start contributing to earn your first badge!"
                  actionLabel="Browse Badges"
                  actionHref="/badges"
                />
              )}
            </section>
          ),
          contributions: (
            <section>
              {profile?.githubUsername ? (
                <div className="space-y-6">
                  {isOwner && <SyncButton />}
                  {profile.contributionCalendar && Object.keys(profile.contributionCalendar).length > 0 ? (
                    <ContributionHeatmap data={profile.contributionCalendar} />
                  ) : (
                    <div className="rounded-xl border border-border bg-bg-secondary p-6 text-center">
                      <p className="text-sm text-text-secondary mb-2">
                        {isOwner
                          ? "Your contribution data hasn't been synced yet."
                          : "Contribution data not available yet."}
                      </p>
                      {isOwner && (
                        <p className="text-xs text-text-muted">
                          Click &quot;Sync Contributions&quot; above to fetch your GitHub activity.
                        </p>
                      )}
                    </div>
                  )}

                  {contributions.length > 0 && (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-bg-tertiary text-left text-xs text-text-muted">
                            <th className="px-4 py-2 font-medium">Repository</th>
                            <th className="px-4 py-2 font-medium">PRs Merged</th>
                            <th className="px-4 py-2 font-medium">Issues</th>
                            <th className="px-4 py-2 font-medium">Reviews</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {contributions.map((c) => (
                            <tr key={c.id} className="text-text-secondary">
                              <td className="px-4 py-2">
                                <a
                                  href={`https://github.com/${c.repoFullName}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[var(--kf-blue)] hover:underline"
                                >
                                  {c.repoFullName} <ExternalLink className="size-3" />
                                </a>
                              </td>
                              <td className="px-4 py-2">{c.prsMerged}</td>
                              <td className="px-4 py-2">{c.issuesOpened}</td>
                              <td className="px-4 py-2">{c.reviewsDone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No GitHub linked"
                  description={isOwner ? "Link your GitHub to see your contributions here." : "This member hasn't linked their GitHub yet."}
                  actionLabel={isOwner ? "Link GitHub" : undefined}
                  actionHref={isOwner ? "/settings" : undefined}
                />
              )}
            </section>
          ),
          timeline: (
            <section>
              {activities.length > 0 ? (
                <ActivityTimeline activities={activities} />
              ) : (
                <EmptyState
                  title="Your journey starts here!"
                  description="Activities will appear as you participate in the community."
                />
              )}
            </section>
          ),
        }}
      </ProfileTabs>
    </div>
  );
}
