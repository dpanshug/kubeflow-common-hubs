import { notFound } from "next/navigation";
import { getUserById } from "@/lib/admin/users";
import { Badge } from "@/components/ui/badge";
import { UserDetailActions } from "./user-detail-actions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getUserById(id);
  return { title: data ? `Admin: ${data.user.name}` : "User Not Found" };
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getUserById(id);

  if (!data) notFound();

  const { user, profile } = data;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
        <p className="text-sm text-text-muted mt-1">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InfoCard label="Role">
          <Badge
            variant={
              user.role === "admin" || user.role === "superadmin"
                ? "default"
                : user.role === "moderator"
                  ? "warning"
                  : "secondary"
            }
          >
            {user.role}
          </Badge>
        </InfoCard>
        <InfoCard label="Status">
          {user.isSuspended ? (
            <Badge variant="destructive">Suspended</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
        </InfoCard>
        <InfoCard label="Level">
          <span className="font-mono">{profile?.level ?? 1}</span>
        </InfoCard>
        <InfoCard label="Points">
          <span className="font-mono">{profile?.points ?? 0}</span>
        </InfoCard>
        <InfoCard label="Location">
          <span>{profile?.location || "—"}</span>
        </InfoCard>
        <InfoCard label="GitHub">
          <span>{profile?.githubUsername || "—"}</span>
        </InfoCard>
        <InfoCard label="Joined">
          <span>
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </InfoCard>
        <InfoCard label="Company">
          <span>{profile?.company || "—"}</span>
        </InfoCard>
      </div>

      <UserDetailActions
        userId={user.id}
        currentRole={user.role}
        isSuspended={user.isSuspended}
      />
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <p className="text-xs font-medium text-text-muted mb-1.5">{label}</p>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  );
}
