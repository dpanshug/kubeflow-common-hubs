"use client";

import { useState, useTransition } from "react";
import { User, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { INTERESTS, INDIAN_CITIES } from "@/lib/constants";
import {
  updateOnboardingStep1,
  updateOnboardingStep2,
  updateOnboardingStep3,
  completeOnboarding,
} from "@/lib/profile/actions";

interface InitialData {
  displayName: string;
  title: string;
  company: string;
  location: string;
  githubUsername: string;
  interests: string[];
  bio: string;
}

const STEPS = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "GitHub", icon: User },
  { id: 3, label: "Interests", icon: Sparkles },
] as const;

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

function Step1Identity({
  onNext,
  defaultValues,
}: {
  onNext: () => void;
  defaultValues: { displayName: string; title: string; company: string; location: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateOnboardingStep1(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onNext();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Tell us about yourself</h2>
        <p className="text-sm text-text-secondary">This helps the community get to know you.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary mb-1.5">
          Display name <span className="text-red-400">*</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          defaultValue={defaultValues.displayName}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
          placeholder="How should we call you?"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1.5">
          Job title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={defaultValues.title}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
          placeholder="e.g. ML Engineer"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-text-secondary mb-1.5">
          Company / Organization
        </label>
        <input
          id="company"
          name="company"
          type="text"
          defaultValue={defaultValues.company}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
          placeholder="Where do you work?"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-1.5">
          City
        </label>
        <select
          id="location"
          name="location"
          defaultValue={defaultValues.location}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
        >
          <option value="">Select your city</option>
          {INDIAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50 mt-4"
      >
        {isPending ? "Saving..." : "Continue"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

function Step2Github({
  onNext,
  onBack,
  defaultValue,
}: {
  onNext: () => void;
  onBack: () => void;
  defaultValue: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateOnboardingStep2(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onNext();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Link your GitHub</h2>
        <p className="text-sm text-text-secondary">
          We&apos;ll track your Kubeflow contributions and display them on your profile.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="githubUsername" className="block text-sm font-medium text-text-secondary mb-1.5">
          GitHub username
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <input
            id="githubUsername"
            name="githubUsername"
            type="text"
            defaultValue={defaultValue}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
            placeholder="your-username"
          />
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          This is for contribution tracking only, not for login.
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Verifying..." : "Continue"} <ArrowRight className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors mt-2"
      >
        Skip this step
      </button>
    </form>
  );
}

function Step3Interests({
  onBack,
  defaultValues,
}: {
  onBack: () => void;
  defaultValues: { interests: string[]; bio: string };
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(defaultValues.interests);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
          ? [...prev, interest]
          : prev
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    selectedInterests.forEach((interest) => {
      formData.append("interests", interest);
    });

    startTransition(async () => {
      const result = await updateOnboardingStep3(formData);
      if (result.error) {
        setError(result.error);
      } else {
        await completeOnboarding();
      }
    });
  }

  function handleSkip() {
    startTransition(async () => {
      await completeOnboarding();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Pick your interests</h2>
        <p className="text-sm text-text-secondary">
          Help us personalize your experience. Select topics you care about.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[var(--kf-blue)]/20 text-[var(--kf-blue)] border border-[var(--kf-blue)]/40"
                  : "bg-bg-tertiary text-text-secondary border border-border hover:border-border-strong"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-text-muted">
        {selectedInterests.length}/10 selected
      </p>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1.5">
          Short bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={defaultValues.bio}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
          placeholder="Tell the community a bit about yourself..."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Finishing..." : "Complete Setup"} <Check className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleSkip}
        disabled={isPending}
        className="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors mt-2 disabled:opacity-50"
      >
        Skip and finish
      </button>
    </form>
  );
}

export function OnboardingWizard({ initialData }: { initialData: InitialData }) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg">
      <ProgressBar currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1Identity
          onNext={() => setCurrentStep(2)}
          defaultValues={{
            displayName: initialData.displayName,
            title: initialData.title,
            company: initialData.company,
            location: initialData.location,
          }}
        />
      )}
      {currentStep === 2 && (
        <Step2Github
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
          defaultValue={initialData.githubUsername}
        />
      )}
      {currentStep === 3 && (
        <Step3Interests
          onBack={() => setCurrentStep(2)}
          defaultValues={{
            interests: initialData.interests,
            bio: initialData.bio,
          }}
        />
      )}
    </div>
  );
}
