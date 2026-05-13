"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { submitReview } from "@/lib/cfp/actions";

interface ReviewFormProps {
  submissionId: string;
  existingRating?: number;
  existingFeedback: string;
  existingNotes: string;
}

export function ReviewForm({
  submissionId,
  existingRating,
  existingFeedback,
  existingNotes,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(existingFeedback);
  const [internalNotes, setInternalNotes] = useState(existingNotes);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("rating", String(rating));
      formData.set("feedback", feedback);
      formData.set("internalNotes", internalNotes);

      const result = await submitReview(submissionId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  }

  const displayRating = hoverRating || rating;

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <h2 className="text-sm font-semibold text-text-muted mb-4">
        {existingRating ? "Update Your Review" : "Submit Review"}
      </h2>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          Review saved!
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${value} out of 5`}
            >
              <Star
                className={`size-6 ${
                  value <= displayRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-border"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor="feedback"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Feedback (visible to speaker)
        </label>
        <textarea
          id="feedback"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={2000}
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
          placeholder="What did you think of this proposal?"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="internalNotes"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Internal Notes (not visible to speaker)
        </label>
        <textarea
          id="internalNotes"
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          maxLength={2000}
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
          placeholder="Private notes for reviewers..."
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : existingRating ? (
          "Update Review"
        ) : (
          "Submit Review"
        )}
      </button>
    </section>
  );
}
