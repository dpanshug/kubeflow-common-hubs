import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";

export default async function DashboardProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const slug = currentUser.profile?.githubUsername || currentUser.user.id;
  redirect(`/members/${slug}`);
}
