"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="flex justify-center mb-4">
        <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="size-6 text-red-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
