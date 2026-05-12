import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get existing profile data (may already have partial data)
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  // Pre-fill from auth metadata + existing profile
  const initialData = {
    displayName:
      profile?.displayName ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "",
    title: profile?.title || "",
    company: profile?.company || "",
    location: profile?.location || "",
    githubUsername:
      profile?.githubUsername ||
      user.user_metadata?.user_name ||
      user.user_metadata?.preferred_username ||
      "",
    interests: profile?.interests || [],
    bio: profile?.bio || "",
  };

  return <OnboardingWizard initialData={initialData} />;
}
