"use client";

import { useState, useTransition, useCallback } from "react";
import { Moon, Sun, Monitor, Shield, Trash2, Link2, Check, Eye, EyeOff, Lock } from "lucide-react";
import { useTheme } from "@/components/providers";
import {
  updateEmailPreferences,
  changePassword,
  linkOAuthProvider,
} from "@/lib/settings/actions";
import { deleteAccount } from "@/lib/profile/actions";

interface Props {
  emailPreferences: {
    badgeEarned: boolean;
    cfpStatusChange: boolean;
    eventReminders: boolean;
    weeklyDigest: boolean;
  };
  linkedProviders: Array<{
    id: string;
    provider: string;
    email?: string;
  }>;
  hasPassword: boolean;
}

export function SettingsClient({ emailPreferences, linkedProviders, hasPassword }: Props) {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const themeOptions = [
    { value: "system" as const, label: "System", icon: Monitor },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Appearance</h2>
          <div className="flex gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                    isActive
                      ? "border-[var(--kf-blue)] bg-[var(--kf-blue)]/5"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? "text-[var(--kf-blue)]" : "text-text-muted"}`} />
                  <span className={`text-xs font-medium ${isActive ? "text-[var(--kf-blue)]" : "text-text-secondary"}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Email Preferences */}
        <EmailPreferencesSection initialPrefs={emailPreferences} />

        {/* Linked Accounts */}
        <LinkedAccountsSection linkedProviders={linkedProviders} />

        {/* Security */}
        {hasPassword && <SecuritySection />}

        {/* Danger Zone */}
        <DangerZoneSection isPending={isPending} startTransition={startTransition} />
      </div>
    </div>
  );
}

function EmailPreferencesSection({
  initialPrefs,
}: {
  initialPrefs: Props["emailPreferences"];
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = useCallback(
    (key: keyof typeof prefs) => {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      setSaving(true);
      setSaved(false);

      updateEmailPreferences(updated).then(() => {
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    },
    [prefs]
  );

  const prefItems = [
    { id: "badgeEarned" as const, label: "Badge earned notifications" },
    { id: "cfpStatusChange" as const, label: "CFP status changes" },
    { id: "eventReminders" as const, label: "Event reminders" },
    { id: "weeklyDigest" as const, label: "Weekly digest" },
  ];

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Email Preferences</h2>
        {saving && <span className="text-[10px] text-text-muted">Saving...</span>}
        {saved && (
          <span className="flex items-center gap-1 text-[10px] text-green-400">
            <Check className="size-3" /> Saved
          </span>
        )}
      </div>
      <div className="space-y-3">
        {prefItems.map((pref) => (
          <label
            key={pref.id}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <span className="text-sm text-text-secondary">{pref.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[pref.id]}
              onClick={() => handleToggle(pref.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                prefs[pref.id] ? "bg-[var(--kf-blue)]" : "bg-bg-tertiary"
              }`}
            >
              <span
                className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                  prefs[pref.id] ? "translate-x-[18px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </section>
  );
}

function LinkedAccountsSection({
  linkedProviders,
}: {
  linkedProviders: Props["linkedProviders"];
}) {
  const [isPending, startTransition] = useTransition();

  const isGoogleLinked = linkedProviders.some((p) => p.provider === "google");
  const isGithubLinked = linkedProviders.some((p) => p.provider === "github");

  function handleLink(provider: "google" | "github") {
    startTransition(async () => {
      const result = await linkOAuthProvider(provider);
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Link2 className="size-4" /> Linked Accounts
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <div>
              <span className="text-sm text-text-secondary">Google</span>
              {isGoogleLinked && (
                <span className="ml-2 text-[10px] text-green-400 font-medium">Connected</span>
              )}
            </div>
          </div>
          {!isGoogleLinked && (
            <button
              onClick={() => handleLink("google")}
              disabled={isPending}
              className="text-xs text-[var(--kf-blue)] font-medium hover:underline disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <div>
              <span className="text-sm text-text-secondary">GitHub</span>
              {isGithubLinked && (
                <span className="ml-2 text-[10px] text-green-400 font-medium">Connected</span>
              )}
            </div>
          </div>
          {!isGithubLinked && (
            <button
              onClick={() => handleLink("github")}
              disabled={isPending}
              className="text-xs text-[var(--kf-blue)] font-medium hover:underline disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-text-muted mt-3">
        Linking accounts with the same email will automatically merge your identities.
      </p>
    </section>
  );
}

function SecuritySection() {
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await changePassword(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setShowForm(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Shield className="size-4" /> Security
      </h2>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <Check className="size-4" /> Password updated successfully
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-[var(--kf-blue)] font-medium hover:underline"
        >
          Change Password
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function DangerZoneSection({
  isPending,
  startTransition,
}: {
  isPending: boolean;
  startTransition: (fn: () => Promise<void>) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
      <h2 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
        <Trash2 className="size-4" /> Danger Zone
      </h2>
      <p className="text-xs text-text-secondary mb-4">
        Deleting your account will deactivate it immediately. Your data will be retained briefly for recovery purposes before permanent removal.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 rounded-lg border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Delete Account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-red-400 font-medium">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                startTransition(async () => {
                  await deleteAccount();
                });
              }}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Yes, Delete My Account"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
