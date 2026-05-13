import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { ToastProvider } from "@/components/admin/admin-toast";

const ADMIN_ROLES = new Set(["moderator", "admin", "superadmin"]);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/admin");
  }

  if (!ADMIN_ROLES.has(currentUser.user.role)) {
    redirect("/");
  }

  return (
    <ToastProvider>
      <div className="flex h-dvh overflow-hidden bg-bg-primary">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center border-b border-border px-6 md:px-8 pl-14 md:pl-8">
            <AdminBreadcrumbs />
          </header>
          <main
            id="main-content"
            className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
