import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-bg-primary">
      <div className="relative mb-6">
        <span className="text-8xl font-bold text-text-muted/20 font-mono">404</span>
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
      <p className="text-sm text-text-secondary mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors shadow-md shadow-[var(--kf-blue)]/20"
      >
        <Home className="size-4" />
        Go Home
      </Link>
    </div>
  );
}
