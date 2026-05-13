"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  events: "Events",
  cfps: "CFPs",
  badges: "Badges",
  news: "News",
  "audit-log": "Audit Log",
  submissions: "Submissions",
  attendees: "Attendees",
  new: "Create",
};

function isUuid(segment: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment
  );
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.reduce<{ label: string; href: string }[]>(
    (acc, segment, i) => {
      if (isUuid(segment)) return acc;
      const href = "/" + segments.slice(0, i + 1).join("/");
      const label = LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      acc.push({ label, href });
      return acc;
    },
    []
  );

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="size-3.5 text-text-muted" aria-hidden />
            )}
            {isLast ? (
              <span className="font-medium text-text-primary">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
