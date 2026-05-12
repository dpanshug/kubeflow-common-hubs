"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  return (
    <a
      href="/notifications"
      className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="size-[18px]" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </a>
  );
}
