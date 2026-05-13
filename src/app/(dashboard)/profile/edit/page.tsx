import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfileEditPage() {
  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const { profile } = data;

  return (
    <ProfileEditForm
      initialData={{
        displayName: profile?.displayName || data.user.name || "",
        title: profile?.title || "",
        company: profile?.company || "",
        location: profile?.location || "",
        bio: profile?.bio || "",
        githubUsername: profile?.githubUsername || "",
        linkedinUrl: profile?.linkedinUrl || "",
        twitterHandle: profile?.twitterHandle || "",
        website: profile?.website || "",
        skills: profile?.skills || [],
        interests: profile?.interests || [],
      }}
    />
  );
}
