"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBadgeActive, awardBadge } from "@/lib/admin/badges";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/admin-toast";
import { Badge } from "@/components/ui/badge";

interface Props {
  badgeId: string;
  isActive: boolean;
}

export function BadgeActions({ badgeId, isActive }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBadgeActive(badgeId);
      if (result.error) {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: isActive ? "Badge deactivated" : "Badge activated" });
        router.refresh();
      }
    });
  }

  function handleAward() {
    if (!userId.trim()) return;
    startTransition(async () => {
      const result = await awardBadge(badgeId, userId.trim(), reason || undefined);
      if (result.error) {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: "Badge awarded successfully" });
        setUserId("");
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary p-4">
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
        <Button
          size="sm"
          variant={isActive ? "destructive" : "default"}
          onClick={handleToggle}
          disabled={pending}
        >
          {isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-4">
        <h3 className="font-semibold text-text-primary text-sm mb-3">
          Manually Award Badge
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="form-input flex-1"
            placeholder="User ID (UUID)"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-input flex-1"
            placeholder="Reason (optional)"
          />
          <Button size="sm" onClick={handleAward} disabled={pending || !userId.trim()}>
            Award
          </Button>
        </div>
      </div>
    </div>
  );
}
