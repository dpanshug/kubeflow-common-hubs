"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles, users, activityLog, notifications } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  profileSchema,
} from "@/lib/validations/profile";

type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function updateOnboardingStep1(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();

  const raw = {
    displayName: formData.get("displayName") as string,
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    location: formData.get("location") as string,
  };

  const parsed = onboardingStep1Schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(profiles)
    .set({
      displayName: parsed.data.displayName,
      title: parsed.data.title || null,
      company: parsed.data.company || null,
      location: parsed.data.location || null,
    })
    .where(eq(profiles.userId, user.id));

  await db
    .update(users)
    .set({ name: parsed.data.displayName })
    .where(eq(users.id, user.id));

  return { success: true };
}

export async function updateOnboardingStep2(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();

  const raw = {
    githubUsername: formData.get("githubUsername") as string,
  };

  const parsed = onboardingStep2Schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (parsed.data.githubUsername) {
    // Validate GitHub username exists
    try {
      const response = await fetch(
        `https://api.github.com/users/${parsed.data.githubUsername}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_PERSONAL_ACCESS_TOKEN
              ? { Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}` }
              : {}),
          },
        }
      );

      if (!response.ok) {
        return { error: "GitHub username not found" };
      }
    } catch {
      return { error: "Failed to verify GitHub username. Please try again." };
    }

    await db
      .update(profiles)
      .set({ githubUsername: parsed.data.githubUsername })
      .where(eq(profiles.userId, user.id));
  }

  return { success: true };
}

export async function updateOnboardingStep3(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();

  const interests = formData.getAll("interests") as string[];
  const bio = formData.get("bio") as string;

  const parsed = onboardingStep3Schema.safeParse({ interests, bio });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(profiles)
    .set({
      interests: parsed.data.interests.length > 0 ? parsed.data.interests : null,
      bio: parsed.data.bio || null,
    })
    .where(eq(profiles.userId, user.id));

  return { success: true };
}

export async function completeOnboarding(): Promise<void> {
  const user = await requireAuth();

  await db
    .update(profiles)
    .set({ onboardingCompleted: true })
    .where(eq(profiles.userId, user.id));

  await db.insert(activityLog).values({
    userId: user.id,
    actionType: "profile_completed",
    description: "Completed profile onboarding",
  });

  await db.insert(notifications).values({
    userId: user.id,
    type: "welcome",
    title: "Welcome to Kubeflow Common Hubs!",
    message: "Your profile is set up. Start exploring events, badges, and CFPs.",
    link: "/events",
  });

  const [profile] = await db
    .select({ githubUsername: profiles.githubUsername })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const slug = profile?.githubUsername || user.id;
  redirect(`/members/${slug}`);
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();

  const raw = {
    displayName: formData.get("displayName") as string,
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    location: formData.get("location") as string,
    bio: formData.get("bio") as string,
    githubUsername: formData.get("githubUsername") as string,
    linkedinUrl: formData.get("linkedinUrl") as string,
    twitterHandle: formData.get("twitterHandle") as string,
    website: formData.get("website") as string,
    skills: formData.getAll("skills") as string[],
    interests: formData.getAll("interests") as string[],
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(profiles)
    .set({
      displayName: parsed.data.displayName,
      title: parsed.data.title || null,
      company: parsed.data.company || null,
      location: parsed.data.location || null,
      bio: parsed.data.bio || null,
      githubUsername: parsed.data.githubUsername || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      twitterHandle: parsed.data.twitterHandle || null,
      website: parsed.data.website || null,
      skills: parsed.data.skills.length > 0 ? parsed.data.skills : null,
      interests: parsed.data.interests.length > 0 ? parsed.data.interests : null,
    })
    .where(eq(profiles.userId, user.id));

  await db
    .update(users)
    .set({ name: parsed.data.displayName })
    .where(eq(users.id, user.id));

  revalidatePath("/members");
  return { success: true };
}

export async function updateAvatarUrl(avatarUrl: string): Promise<ActionResult> {
  const user = await requireAuth();

  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const isValidR2Url = r2PublicUrl && avatarUrl.startsWith(r2PublicUrl);
  const isValidExternalUrl = avatarUrl.startsWith("https://");
  if (!isValidR2Url && !isValidExternalUrl) {
    return { error: "Invalid avatar URL" };
  }

  await db
    .update(users)
    .set({ avatarUrl })
    .where(eq(users.id, user.id));

  revalidatePath("/members");
  return { success: true };
}

export async function syncGithubContributions(): Promise<ActionResult> {
  const user = await requireAuth();

  const [profile] = await db
    .select({ githubUsername: profiles.githubUsername })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile?.githubUsername) {
    return { error: "No GitHub username linked" };
  }

  try {
    const { syncUserContributions } = await import("@/lib/github/sync");
    await syncUserContributions(user.id, profile.githubUsername);
    revalidatePath("/members");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return { error: message };
  }
}

export async function deleteAccount(): Promise<void> {
  const user = await requireAuth();

  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, user.id));

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
