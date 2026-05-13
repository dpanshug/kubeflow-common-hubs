"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { updateSubmissionStatus } from "@/lib/cfp/actions";

interface StatusControlsProps {
  submissionId: string;
  currentStatus: string;
  validTransitions: string[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  in_review: {
    label: "Move to Review",
    icon: ArrowRight,
    className:
      "border-border text-text-primary hover:bg-bg-tertiary",
  },
  shortlisted: {
    label: "Shortlist",
    icon: CheckCircle2,
    className:
      "border-[var(--kf-blue)]/30 text-[var(--kf-blue)] hover:bg-[var(--kf-blue)]/10",
  },
  approved: {
    label: "Approve",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
  },
  rejected: {
    label: "Reject",
    icon: XCircle,
    className: "border-red-500/30 text-red-400 hover:bg-red-500/10",
  },
  waitlisted: {
    label: "Waitlist",
    icon: Clock,
    className:
      "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
  },
};

export function StatusControls({
  submissionId,
  currentStatus,
  validTransitions,
}: StatusControlsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  function handleStatusChange(newStatus: string) {
    if (newStatus === "rejected" || newStatus === "approved") {
      setShowFeedback(true);
      setPendingStatus(newStatus);
      return;
    }

    executeStatusChange(newStatus);
  }

  function executeStatusChange(newStatus: string) {
    setError(null);
    setPendingStatus(newStatus);

    startTransition(async () => {
      const result = await updateSubmissionStatus(
        submissionId,
        newStatus,
        feedbackText || undefined
      );
      if (result.error) {
        setError(result.error);
        setPendingStatus(null);
      } else {
        setShowFeedback(false);
        setFeedbackText("");
        setPendingStatus(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-bg-secondary p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-text-muted">
          Change Status:
        </span>
        <span className="text-xs text-text-secondary capitalize">
          currently {currentStatus.replace(/_/g, " ")}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {showFeedback && pendingStatus && (
        <div className="mb-3">
          <label htmlFor="status-feedback" className="block text-xs font-medium text-text-secondary mb-1.5">
            Feedback for speaker (optional)
          </label>
          <textarea
            id="status-feedback"
            rows={2}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none mb-2"
            placeholder={
              pendingStatus === "approved"
                ? "Congratulations message..."
                : "Reason for decision..."
            }
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => executeStatusChange(pendingStatus)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 border-[var(--kf-blue)]/30 text-[var(--kf-blue)] hover:bg-[var(--kf-blue)]/10"
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Confirm"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFeedback(false);
                setPendingStatus(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showFeedback && (
        <div className="flex flex-wrap gap-2">
          {validTransitions.map((status) => {
            const config = STATUS_CONFIG[status];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${config.className}`}
              >
                {isPending && pendingStatus === status ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Icon className="size-3" />
                )}
                {config.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
