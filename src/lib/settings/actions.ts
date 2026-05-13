"use server";

import { z } from "zod";
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

const emailPreferencesSchema = z.object({
  badgeEarned: z.boolean(),
  cfpStatusChange: z.boolean(),
  eventReminders: z.boolean(),
  weeklyDigest: z.boolean(),
});

export async function updateEmailPreferences(
  preferences: z.infer<typeof emailPreferencesSchema>
): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = emailPreferencesSchema.safeParse(preferences);
  if (!parsed.success) {
    return { error: "Invalid preferences" };
  }

  await db
    .update(profiles)
    .set({ emailPreferences: parsed.data })
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
  const { resetPasswordSchema } = await import("@/lib/validations/auth");

  const raw = {
    password: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
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
