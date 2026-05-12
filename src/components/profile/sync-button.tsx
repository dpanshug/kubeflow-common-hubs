"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncGithubContributions } from "@/lib/profile/actions";

export function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSync() {
    setMessage(null);
    startTransition(async () => {
      const result = await syncGithubContributions();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Contributions synced! Refreshing..." });
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-bg-tertiary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`size-3 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Syncing..." : "Sync Contributions"}
      </button>
      {message && (
        <p className={`text-xs ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
