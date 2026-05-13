"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, suspendUser, unsuspendUser } from "@/lib/admin/users";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/admin-toast";

interface Props {
  userId: string;
  currentRole: string;
  isSuspended: boolean;
}

const ROLES = ["member", "moderator", "admin", "superadmin"] as const;

export function UserDetailActions({ userId, currentRole, isSuspended }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  function handleRoleChange() {
    if (selectedRole === currentRole) return;
    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole as typeof ROLES[number]);
      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: "Role updated successfully" });
        router.refresh();
      }
    });
  }

  function handleSuspendToggle() {
    startTransition(async () => {
      const result = isSuspended
        ? await unsuspendUser(userId)
        : await suspendUser(userId);
      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({
          title: isSuspended ? "User unsuspended" : "User suspended",
        });
        router.refresh();
      }
      setShowSuspendDialog(false);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-bg-secondary p-6">
        <h3 className="font-semibold text-text-primary mb-4">Change Role</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-9 rounded-lg border border-border bg-bg-primary px-3 text-sm text-text-primary"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleRoleChange}
            disabled={pending || selectedRole === currentRole}
          >
            {pending ? "Saving..." : "Update Role"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-6">
        <h3 className="font-semibold text-text-primary mb-2">
          {isSuspended ? "Unsuspend User" : "Suspend User"}
        </h3>
        <p className="text-sm text-text-muted mb-4">
          {isSuspended
            ? "This user is currently suspended. Unsuspending will restore their access."
            : "Suspending will prevent this user from accessing the platform."}
        </p>
        <Button
          variant={isSuspended ? "default" : "destructive"}
          size="sm"
          onClick={() => setShowSuspendDialog(true)}
        >
          {isSuspended ? "Unsuspend User" : "Suspend User"}
        </Button>
      </div>

      <ConfirmDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        title={isSuspended ? "Unsuspend User?" : "Suspend User?"}
        description={
          isSuspended
            ? "This will restore the user's access to the platform."
            : "This user will be locked out of their account immediately."
        }
        confirmLabel={isSuspended ? "Unsuspend" : "Suspend"}
        variant={isSuspended ? "default" : "destructive"}
        onConfirm={handleSuspendToggle}
        loading={pending}
      />
    </div>
  );
}
