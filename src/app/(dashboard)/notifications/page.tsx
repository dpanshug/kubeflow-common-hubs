import { redirect } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/notifications/actions";
import { EmptyState } from "@/components/profile/empty-state";

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?next=/notifications");
  }

  const { items, total } = await getNotifications(1, 50);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            {total} notification{total !== 1 ? "s" : ""}
          </p>
        </div>
        {items.some((n) => !n.isRead) && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <Check className="size-3" /> Mark all read
            </button>
          </form>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((notification) => (
            <form
              key={notification.id}
              action={async () => {
                "use server";
                if (!notification.isRead) {
                  await markAsRead(notification.id);
                }
              }}
            >
              <button
                type="submit"
                className={`block w-full text-left p-4 rounded-xl border transition-colors ${
                  notification.isRead
                    ? "border-border bg-bg-secondary"
                    : "border-[var(--kf-blue)]/20 bg-[var(--kf-blue)]/5"
                } hover:bg-bg-tertiary`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 size-2 rounded-full shrink-0 ${notification.isRead ? "bg-transparent" : "bg-[var(--kf-blue)]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            </form>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="size-8" />}
          title="You're all caught up!"
          description="No notifications yet. They'll appear here as you participate."
        />
      )}
    </div>
  );
}
