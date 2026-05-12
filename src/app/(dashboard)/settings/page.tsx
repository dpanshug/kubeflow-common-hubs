import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import { getEmailPreferences, getUserIdentities } from "@/lib/settings/actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?next=/settings");
  }

  const emailPrefs = await getEmailPreferences();
  const identities = await getUserIdentities();

  const hasPassword = identities.some((i) => i.provider === "email");
  const linkedProviders = identities.map((i) => ({
    id: i.id,
    provider: i.provider,
    email: i.identity_data?.email as string | undefined,
  }));

  return (
    <SettingsClient
      emailPreferences={emailPrefs}
      linkedProviders={linkedProviders}
      hasPassword={hasPassword}
    />
  );
}
