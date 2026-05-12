"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search, Sun, Moon, LogOut, Settings, User } from "lucide-react";
import { useTheme } from "@/components/providers";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { signOut } from "@/lib/auth/actions";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-300" />
        <div className="relative size-10 rounded-2xl bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ring-1 ring-white/10">
          <span className="text-white font-bold text-[15px] tracking-tight">KF</span>
        </div>
      </div>
      <span className="font-semibold hidden sm:inline-block text-[15px] text-text-primary group-hover:text-[var(--kf-blue)] transition-colors">
        {SITE_NAME}
      </span>
    </Link>
  );
}

function UserMenu({ avatarUrl, name, username }: { avatarUrl?: string | null; name?: string; username?: string }) {
  const [open, setOpen] = useState(false);
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?";

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="size-8 rounded-full bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-transparent hover:ring-[var(--kf-blue)]/30 transition-all"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={32} height={32} className="size-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-bg-secondary shadow-lg z-50 py-1">
            <Link
              href={username ? `/members/${username}` : "/profile"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <User className="size-4" /> My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <Settings className="size-4" /> Settings
            </Link>
            <div className="border-t border-border my-1" />
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors w-full text-left"
              >
                <LogOut className="size-4" /> Sign Out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();

  const { theme, setTheme } = useTheme();
  const isHome = pathname === "/";
  const showSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showSolid
          ? "glass border-b border-border shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav
          className={cn(
            "hidden md:flex items-center gap-0.5 rounded-full px-1.5 py-1 border transition-colors duration-300",
            showSolid
              ? "bg-bg-tertiary/50 border-border"
              : "bg-bg-tertiary/30 border-border/50"
          )}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "text-text-primary bg-bg-secondary"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-secondary/50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            aria-label="Search"
          >
            <Search className="size-[18px]" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="size-[18px] hidden dark:block" />
            <Moon className="size-[18px] dark:hidden" />
          </button>

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  <NotificationBell />
                  <UserMenu
                    avatarUrl={user.user_metadata?.avatar_url}
                    name={user.user_metadata?.full_name || user.email}
                    username={user.user_metadata?.user_name || user.user_metadata?.preferred_username}
                  />
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-[13px] font-medium text-white bg-[var(--kf-blue)] hover:bg-[var(--kf-blue)]/90 px-4 py-2 rounded-full transition-all shadow-md shadow-[var(--kf-blue)]/20"
                  >
                    Join Community
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          <button
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-text-primary bg-bg-tertiary"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href={user.user_metadata?.user_name ? `/members/${user.user_metadata.user_name}` : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  Notifications
                </Link>
              </>
            )}

            <div className="border-t border-border my-2" />
            {user ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-text-muted hover:text-text-primary border border-border rounded-lg py-2.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-white bg-[var(--kf-blue)] hover:bg-[var(--kf-blue)]/90 rounded-lg py-2.5 transition-colors"
                >
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
