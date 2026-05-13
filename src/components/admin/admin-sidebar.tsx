"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  MessageSquareText,
  Users,
  Award,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "CFPs", href: "/admin/cfps", icon: MessageSquareText },
      { label: "News", href: "/admin/news", icon: Newspaper },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Badges", href: "/admin/badges", icon: Award },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
    ],
  },
];

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white/90",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="size-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

const SIDEBAR_KEY = "admin-sidebar-collapsed";
const SIDEBAR_EVENT = "admin-sidebar-toggle";

function subscribeSidebar(callback: () => void) {
  window.addEventListener(SIDEBAR_EVENT, callback);
  return () => window.removeEventListener(SIDEBAR_EVENT, callback);
}

function getCollapsedSnapshot() {
  return localStorage.getItem(SIDEBAR_KEY) === "true";
}

function getCollapsedServerSnapshot() {
  return false;
}

export function AdminSidebar() {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapse() {
    localStorage.setItem(SIDEBAR_KEY, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed && "justify-center px-2"
        )}
      >
        <Link href="/admin" className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">KF</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-white text-sm">Admin</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to site */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Back to Site" : undefined}
        >
          <ExternalLink className="size-[18px] shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block border-t border-white/10 p-3">
        <button
          onClick={toggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-[#0f1a33] p-2 text-white/70 hover:text-white shadow-lg border border-white/10"
        aria-label="Open admin menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="h-full w-64 bg-[#0a1228]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              aria-label="Close admin menu"
            >
              <X className="size-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-[#0a1228] border-r border-white/10 transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
