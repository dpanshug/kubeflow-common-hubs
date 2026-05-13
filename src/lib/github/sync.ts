import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { profiles, githubContributions } from "@/db/schema";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTION_CALENDAR_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

const REPO_CONTRIBUTIONS_QUERY = `
query($username: String!) {
  user(login: $username) {
    pullRequests(first: 100, states: [MERGED, OPEN], orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        repository {
          nameWithOwner
          owner { login }
        }
        merged
        commits { totalCount }
      }
    }
    issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        repository {
          nameWithOwner
          owner { login }
        }
      }
    }
    contributionsCollection {
      pullRequestReviewContributions(first: 100) {
        nodes {
          pullRequest {
            repository {
              nameWithOwner
              owner { login }
            }
          }
        }
      }
    }
  }
}`;

async function graphql<T>(query: string, variables: Record<string, string>): Promise<T> {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (!token) throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN not configured");

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining === "0" || response.status === 403) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL error");
  }

  return json.data as T;
}

interface CalendarResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            date: string;
            contributionCount: number;
          }>;
        }>;
      };
    };
  };
}

export async function syncContributionCalendar(userId: string, username: string) {
  const data = await graphql<CalendarResponse>(CONTRIBUTION_CALENDAR_QUERY, {
    username,
  });

  if (!data.user) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  const calendar: Record<string, number> = {};
  for (const week of data.user.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        calendar[day.date] = day.contributionCount;
      }
    }
  }

  await db
    .update(profiles)
    .set({ contributionCalendar: calendar })
    .where(eq(profiles.userId, userId));

  return calendar;
}

interface RepoContributionsResponse {
  user: {
    pullRequests: {
      nodes: Array<{
        repository: { nameWithOwner: string; owner: { login: string } };
        merged: boolean;
        commits: { totalCount: number };
      }>;
    };
    issues: {
      nodes: Array<{
        repository: { nameWithOwner: string; owner: { login: string } };
      }>;
    };
    contributionsCollection: {
      pullRequestReviewContributions: {
        nodes: Array<{
          pullRequest: {
            repository: { nameWithOwner: string; owner: { login: string } };
          };
        }>;
      };
    };
  };
}

export async function syncRepoContributions(userId: string, username: string) {
  const data = await graphql<RepoContributionsResponse>(REPO_CONTRIBUTIONS_QUERY, {
    username,
  });

  if (!data.user) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  const repoStats: Record<
    string,
    { prsMerged: number; prsOpened: number; issuesOpened: number; commits: number; reviewsDone: number }
  > = {};

  for (const pr of data.user.pullRequests.nodes) {
    const repo = pr.repository.nameWithOwner;
    if (pr.repository.owner.login.toLowerCase() !== "kubeflow") continue;
    if (!repoStats[repo]) repoStats[repo] = { prsMerged: 0, prsOpened: 0, issuesOpened: 0, commits: 0, reviewsDone: 0 };
    repoStats[repo].prsOpened++;
    if (pr.merged) {
      repoStats[repo].prsMerged++;
      repoStats[repo].commits += pr.commits.totalCount;
    }
  }

  for (const issue of data.user.issues.nodes) {
    const repo = issue.repository.nameWithOwner;
    if (issue.repository.owner.login.toLowerCase() !== "kubeflow") continue;
    if (!repoStats[repo]) repoStats[repo] = { prsMerged: 0, prsOpened: 0, issuesOpened: 0, commits: 0, reviewsDone: 0 };
    repoStats[repo].issuesOpened++;
  }

  for (const review of data.user.contributionsCollection.pullRequestReviewContributions.nodes) {
    const repo = review.pullRequest.repository.nameWithOwner;
    if (review.pullRequest.repository.owner.login.toLowerCase() !== "kubeflow") continue;
    if (!repoStats[repo]) repoStats[repo] = { prsMerged: 0, prsOpened: 0, issuesOpened: 0, commits: 0, reviewsDone: 0 };
    repoStats[repo].reviewsDone++;
  }

  const existingContribs = await db
    .select({ repoFullName: githubContributions.repoFullName })
    .from(githubContributions)
    .where(eq(githubContributions.userId, userId));

  const existingRepos = new Set(existingContribs.map((c) => c.repoFullName));

  const toInsert = Object.entries(repoStats)
    .filter(([repo]) => !existingRepos.has(repo))
    .map(([repoFullName, stats]) => ({ userId, repoFullName, ...stats }));

  const toUpdate = Object.entries(repoStats)
    .filter(([repo]) => existingRepos.has(repo));

  if (toInsert.length > 0) {
    await db.insert(githubContributions).values(toInsert);
  }

  for (const [repoFullName, stats] of toUpdate) {
    await db
      .update(githubContributions)
      .set({ ...stats, lastSynced: new Date() })
      .where(
        and(
          eq(githubContributions.userId, userId),
          eq(githubContributions.repoFullName, repoFullName)
        )
      );
  }
}

export async function syncUserContributions(userId: string, username: string) {
  await syncContributionCalendar(userId, username);
  await syncRepoContributions(userId, username);
}

export async function syncBatchUsers(batchSize = 10) {
  // Get users who have GitHub usernames and need syncing
  const allUsers = await db
    .select({
      userId: profiles.userId,
      githubUsername: profiles.githubUsername,
    })
    .from(profiles)
    .where(isNotNull(profiles.githubUsername))
    .limit(batchSize);

  const results: Array<{ userId: string; success: boolean; error?: string }> = [];

  for (const user of allUsers) {
    try {
      await syncUserContributions(user.userId, user.githubUsername!);
      results.push({ userId: user.userId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ userId: user.userId, success: false, error: message });
      if (message === "RATE_LIMITED") break;
    }
  }

  return results;
}
