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
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers";

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

const THEME_CYCLE = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const current = THEME_CYCLE.find((t) => t.value === theme) ?? THEME_CYCLE[1];
  const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
  const next = THEME_CYCLE[nextIndex];

  return (
    <button
      onClick={() => setTheme(next.value)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? `Theme: ${current.label}` : undefined}
      aria-label={`Switch to ${next.label} theme`}
    >
      <current.icon className="size-[18px] shrink-0" />
      {!collapsed && <span>{current.label}</span>}
    </button>
  );
}

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
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-muted hover:bg-bg-tertiary/50 hover:text-text-primary",
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
          "flex h-16 items-center border-b border-border px-4",
          collapsed && "justify-center px-2"
        )}
      >
        <Link href="/admin" className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">KF</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-text-primary text-sm">Admin</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
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

      {/* Theme toggle */}
      <div className="border-t border-border p-3">
        <ThemeToggle collapsed={collapsed} />
      </div>

      {/* Back to site */}
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-bg-tertiary/50 hover:text-text-primary transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Back to Site" : undefined}
        >
          <ExternalLink className="size-[18px] shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block border-t border-border p-3">
        <button
          onClick={toggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-muted hover:bg-bg-tertiary/50 hover:text-text-primary transition-colors"
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
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-bg-secondary p-2 text-text-muted hover:text-text-primary shadow-lg border border-border"
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
            className="h-full w-64 bg-bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
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
          "hidden md:flex flex-col bg-bg-primary border-r border-border transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
