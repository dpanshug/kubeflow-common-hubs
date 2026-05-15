"use client";

import { useState, useReducer, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  Clock,
  Edit3,
  CheckCircle2,
  LogIn,
  Mail,
  User,
} from "lucide-react";
import { CFP_TALK_TYPES } from "@/lib/constants";
import { submitCfpProposal, submitGuestCfpProposal } from "@/lib/cfp/actions";

interface WizardProps {
  cfpId: string;
  cfpTitle: string;
  cfpDeadline: string;
  acceptedFormats: string[];
  defaultSpeakerBio: string;
  isGuest?: boolean;
}

type WizardState = {
  step: number;
  returnTo: number | null;
};

type WizardAction =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "JUMP"; step: number; returnTo: number }
  | { type: "RETURN" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT":
      return { step: state.step + 1, returnTo: null };
    case "BACK":
      return { step: Math.max(0, state.step - 1), returnTo: null };
    case "JUMP":
      return { step: action.step, returnTo: action.returnTo };
    case "RETURN":
      return { step: state.returnTo ?? state.step + 1, returnTo: null };
    default:
      return state;
  }
}

const STEPS = [
  { id: 1, label: "Talk Details" },
  { id: 2, label: "Speaker Info" },
  { id: 3, label: "Review" },
] as const;

const STORAGE_KEY_PREFIX = "cfp_wizard_";

interface WizardFormValues {
  title: string;
  abstract: string;
  talkType: string;
  outline: string;
  speakerBio: string;
  speakerName: string;
  speakerEmail: string;
}

function loadDraft(cfpId: string): Partial<WizardFormValues> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + cfpId);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveDraft(cfpId: string, data: Partial<WizardFormValues>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + cfpId, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

function clearDraft(cfpId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + cfpId);
  } catch {
    // ignore
  }
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center size-8 rounded-full text-xs font-medium transition-colors ${
              currentStep > step.id
                ? "bg-green-500/20 text-green-400"
                : currentStep === step.id
                  ? "bg-[var(--kf-blue)] text-white"
                  : "bg-bg-tertiary text-text-muted"
            }`}
          >
            {currentStep > step.id ? (
              <Check className="size-4" />
            ) : (
              step.id
            )}
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                currentStep > step.id ? "bg-green-500/40" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SubmissionWizard({
  cfpId,
  cfpTitle,
  cfpDeadline,
  acceptedFormats,
  defaultSpeakerBio,
  isGuest = false,
}: WizardProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(wizardReducer, {
    step: isGuest ? 0 : 1,
    returnTo: null,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<WizardFormValues>(() => {
    const draft = loadDraft(cfpId);
    return {
      title: draft.title ?? "",
      abstract: draft.abstract ?? "",
      talkType: draft.talkType ?? (acceptedFormats.length === 1 ? acceptedFormats[0] : ""),
      outline: draft.outline ?? "",
      speakerBio: draft.speakerBio ?? defaultSpeakerBio,
      speakerName: draft.speakerName ?? "",
      speakerEmail: draft.speakerEmail ?? "",
    };
  });

  useEffect(() => {
    if (!submitted) {
      saveDraft(cfpId, formValues);
    }
  }, [formValues, cfpId, submitted]);

  function updateField(field: keyof WizardFormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  const availableFormats = CFP_TALK_TYPES.filter(
    (t) => acceptedFormats.length === 0 || acceptedFormats.includes(t.value)
  );

  const [daysLeft] = useState(() =>
    Math.max(
      0,
      Math.ceil(
        (new Date(cfpDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    )
  );

  function validateStep0(): string | null {
    if (formValues.speakerName.trim().length < 2) return "Name must be at least 2 characters";
    if (formValues.speakerName.trim().length > 100) return "Name must be less than 100 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.speakerEmail.trim())) return "Please enter a valid email address";
    return null;
  }

  function validateStep1(): string | null {
    if (formValues.title.trim().length < 5) return "Title must be at least 5 characters";
    if (formValues.title.trim().length > 100) return "Title must be less than 100 characters";
    if (formValues.abstract.trim().length < 50) return "Abstract must be at least 50 characters";
    if (formValues.abstract.trim().length > 2000) return "Abstract must be less than 2000 characters";
    if (!formValues.talkType) return "Please select a talk type";
    return null;
  }

  function validateStep2(): string | null {
    if (formValues.speakerBio.trim().length < 20) return "Speaker bio must be at least 20 characters";
    if (formValues.speakerBio.trim().length > 1000) return "Speaker bio must be less than 1000 characters";
    if (formValues.outline.length > 5000) return "Outline must be less than 5000 characters";
    return null;
  }

  function handleNext() {
    setError(null);
    if (state.step === 0) {
      const err = validateStep0();
      if (err) { setError(err); return; }
    }
    if (state.step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (state.step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    if (state.returnTo !== null) {
      dispatch({ type: "RETURN" });
    } else {
      dispatch({ type: "NEXT" });
    }
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", formValues.title.trim());
      fd.set("abstract", formValues.abstract.trim());
      fd.set("talkType", formValues.talkType);
      fd.set("outline", formValues.outline.trim());
      fd.set("speakerBio", formValues.speakerBio.trim());

      let result;
      if (isGuest) {
        fd.set("speakerName", formValues.speakerName.trim());
        fd.set("speakerEmail", formValues.speakerEmail.trim());
        result = await submitGuestCfpProposal(cfpId, fd);
      } else {
        result = await submitCfpProposal(cfpId, fd);
      }

      if (result.error) {
        setError(result.error);
      } else {
        clearDraft(cfpId);
        setSubmitted(true);
        const data = result.data as { submissionId: string } | undefined;
        if (data?.submissionId) {
          setSubmissionId(data.submissionId);
        }
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Proposal Submitted!</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
          Your proposal &quot;{formValues.title}&quot; has been submitted to{" "}
          {cfpTitle}.
          {isGuest
            ? " We've recorded your email for future correspondence."
            : " You’ll be notified when the status changes."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/cfps/${cfpId}`)}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Back to CFP
          </button>
          {!isGuest && (
            <button
              type="button"
              onClick={() =>
                router.push(submissionId ? `/submissions/${submissionId}` : "/submissions")
              }
              className="px-4 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors"
            >
              View My Submissions
            </button>
          )}
        </div>
      </div>
    );
  }

  const talkTypeLabel =
    CFP_TALK_TYPES.find((t) => t.value === formValues.talkType)?.label ?? formValues.talkType;

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Submit Proposal</h1>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Clock className="size-3" />
          {daysLeft} days left
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-6">{cfpTitle}</p>

      {state.step > 0 && <ProgressBar currentStep={state.step} />}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 0: Identity gate (guests only) */}
      {state.step === 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Before you begin
            </h2>
            <p className="text-sm text-text-secondary">
              Sign in for a better experience, or continue as a guest.
            </p>
          </div>

          <Link
            href={`/login?next=/cfps/${cfpId}/submit`}
            aria-label="Sign in to submit your proposal"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-[var(--kf-blue)]/40 hover:bg-[var(--kf-blue)]/5 transition-all group"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--kf-blue)]/10 text-[var(--kf-blue)] group-hover:bg-[var(--kf-blue)]/20 transition-colors">
              <LogIn className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Sign In</p>
              <p className="text-xs text-text-muted">
                Track your submission, get in-app notifications, and auto-fill your profile.
              </p>
            </div>
            <ArrowRight className="size-4 text-text-muted group-hover:text-[var(--kf-blue)] transition-colors" />
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-bg-secondary px-3 text-xs text-text-muted">
                or continue as guest
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="speakerName"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Your Name <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                id="speakerName"
                type="text"
                value={formValues.speakerName}
                onChange={(e) => updateField("speakerName", e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label
                htmlFor="speakerEmail"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  Email Address <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                id="speakerEmail"
                type="email"
                value={formValues.speakerEmail}
                onChange={(e) => updateField("speakerEmail", e.target.value)}
                maxLength={254}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="jane@example.com"
              />
              <p className="mt-1 text-xs text-text-muted">
                We&apos;ll use this to contact you about your submission.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors"
            >
              Continue as Guest <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Title, Abstract, Talk Type */}
      {state.step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Talk Details
            </h2>
            <p className="text-sm text-text-secondary">
              What will you be talking about?
            </p>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Talk Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formValues.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
              placeholder="e.g. Building ML Pipelines at Scale with Kubeflow"
            />
            <p className="mt-1 text-xs text-text-muted">
              {formValues.title.length}/100
            </p>
          </div>

          <div>
            <label
              htmlFor="abstract"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Abstract <span className="text-red-400">*</span>
            </label>
            <textarea
              id="abstract"
              rows={6}
              value={formValues.abstract}
              onChange={(e) => updateField("abstract", e.target.value)}
              maxLength={2000}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
              placeholder="Describe your talk in detail. What will attendees learn? What problem does it solve?"
            />
            <p className="mt-1 text-xs text-text-muted">
              {formValues.abstract.length}/2000 (min 50)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Talk Format <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {availableFormats.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[var(--kf-blue)]/50 ${
                    formValues.talkType === format.value
                      ? "border-[var(--kf-blue)]/40 bg-[var(--kf-blue)]/5"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="talkType"
                    value={format.value}
                    checked={formValues.talkType === format.value}
                    onChange={(e) => updateField("talkType", e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center ${
                      formValues.talkType === format.value
                        ? "border-[var(--kf-blue)]"
                        : "border-border"
                    }`}
                  >
                    {formValues.talkType === format.value && (
                      <div className="size-2 rounded-full bg-[var(--kf-blue)]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {isGuest ? (
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => dispatch({ type: "BACK" })}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors mt-4"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Step 2: Speaker Info, Bio & Outline */}
      {state.step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Speaker Info
            </h2>
            <p className="text-sm text-text-secondary">
              Help reviewers learn about you and your talk structure.
            </p>
          </div>

          <div>
            <label
              htmlFor="speakerBio"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Speaker Bio <span className="text-red-400">*</span>
            </label>
            <textarea
              id="speakerBio"
              rows={4}
              value={formValues.speakerBio}
              onChange={(e) => updateField("speakerBio", e.target.value)}
              maxLength={1000}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
              placeholder="Tell reviewers about your experience and expertise..."
            />
            <p className="mt-1 text-xs text-text-muted">
              {formValues.speakerBio.length}/1000 (min 20)
            </p>
          </div>

          <div>
            <label
              htmlFor="outline"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Talk Outline{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="outline"
              rows={6}
              value={formValues.outline}
              onChange={(e) => updateField("outline", e.target.value)}
              maxLength={5000}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
              placeholder="Bullet points of what you'll cover in the talk..."
            />
            <p className="mt-1 text-xs text-text-muted">
              {formValues.outline.length}/5000
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACK" })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors"
            >
              Review <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {state.step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Review & Submit
            </h2>
            <p className="text-sm text-text-secondary">
              Double-check your proposal before submitting. You won&apos;t be
              able to edit it after submission.
            </p>
          </div>

          <div className="space-y-3">
            {isGuest && (
              <>
                <ReviewSection
                  label="Speaker Name"
                  value={formValues.speakerName}
                  onEdit={() =>
                    dispatch({ type: "JUMP", step: 0, returnTo: 3 })
                  }
                />
                <ReviewSection
                  label="Email Address"
                  value={formValues.speakerEmail}
                  onEdit={() =>
                    dispatch({ type: "JUMP", step: 0, returnTo: 3 })
                  }
                />
              </>
            )}
            <ReviewSection
              label="Talk Title"
              value={formValues.title}
              onEdit={() =>
                dispatch({ type: "JUMP", step: 1, returnTo: 3 })
              }
            />
            <ReviewSection
              label="Abstract"
              value={formValues.abstract}
              onEdit={() =>
                dispatch({ type: "JUMP", step: 1, returnTo: 3 })
              }
            />
            <ReviewSection
              label="Talk Format"
              value={talkTypeLabel}
              onEdit={() =>
                dispatch({ type: "JUMP", step: 1, returnTo: 3 })
              }
            />
            <ReviewSection
              label="Speaker Bio"
              value={formValues.speakerBio}
              onEdit={() =>
                dispatch({ type: "JUMP", step: 2, returnTo: 3 })
              }
            />
            {formValues.outline && (
              <ReviewSection
                label="Talk Outline"
                value={formValues.outline}
                onEdit={() =>
                  dispatch({ type: "JUMP", step: 2, returnTo: 3 })
                }
              />
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            Once submitted, you cannot edit your proposal. Make sure everything
            looks good.
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACK" })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#2563EB]/30 transition-all disabled:opacity-50"
            >
              {isPending ? (
                "Submitting..."
              ) : (
                <>
                  Submit Proposal <Send className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSection({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-primary p-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-[var(--kf-blue)] hover:text-[var(--kf-blue)]/80 flex items-center gap-1 transition-colors"
        >
          <Edit3 className="size-3" /> Edit
        </button>
      </div>
      <p className="text-sm text-text-primary whitespace-pre-wrap line-clamp-4">
        {value}
      </p>
    </div>
  );
}
