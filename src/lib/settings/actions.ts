"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function updateEmailPreferences(
  preferences: {
    badgeEarned: boolean;
    cfpStatusChange: boolean;
    eventReminders: boolean;
    weeklyDigest: boolean;
  }
): Promise<ActionResult> {
  const user = await requireAuth();

  await db
    .update(profiles)
    .set({ emailPreferences: preferences })
    .where(eq(profiles.userId, user.id));

  return { success: true };
}

export async function getEmailPreferences() {
  const user = await requireAuth();

  const [profile] = await db
    .select({ emailPreferences: profiles.emailPreferences })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return profile?.emailPreferences ?? {
    badgeEarned: true,
    cfpStatusChange: true,
    eventReminders: true,
    weeklyDigest: true,
  };
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (!/[A-Z]/.test(newPassword)) {
    return { error: "Password must contain at least one uppercase letter" };
  }

  if (!/[0-9]/.test(newPassword)) {
    return { error: "Password must contain at least one number" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: "Failed to update password. Please try again." };
  }

  return { success: true };
}

export async function linkOAuthProvider(provider: "google" | "github") {
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo: `${origin}/settings`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function unlinkOAuthProvider(identityId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.unlinkIdentity({ id: identityId } as never);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getUserIdentities() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  return user.identities ?? [];
}
