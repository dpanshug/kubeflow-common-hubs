"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { profileSchema } from "@/lib/validations/profile";
import { updateProfile } from "@/lib/profile/actions";
import { INTERESTS, INDIAN_CITIES } from "@/lib/constants";
import type { z } from "zod";

type ProfileFormValues = z.input<typeof profileSchema>;

interface ProfileEditFormProps {
  initialData: ProfileFormValues;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as never,
    defaultValues: initialData,
  });

  const watchedInterests = watch("interests") || [];
  const watchedBio = watch("bio") || "";

  function toggleInterest(interest: string) {
    const current = watchedInterests;
    if (current.includes(interest)) {
      setValue("interests", current.filter((i) => i !== interest));
    } else if (current.length < 10) {
      setValue("interests", [...current, interest]);
    }
  }

  function onSubmit(data: ProfileFormValues) {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("displayName", data.displayName);
      if (data.title) formData.set("title", data.title);
      if (data.company) formData.set("company", data.company);
      if (data.location) formData.set("location", data.location);
      if (data.bio) formData.set("bio", data.bio);
      if (data.githubUsername) formData.set("githubUsername", data.githubUsername);
      if (data.linkedinUrl) formData.set("linkedinUrl", data.linkedinUrl);
      if (data.twitterHandle) formData.set("twitterHandle", data.twitterHandle);
      if (data.website) formData.set("website", data.website);
      data.skills?.forEach((s) => formData.append("skills", s));
      data.interests?.forEach((i) => formData.append("interests", i));

      const result = await updateProfile(formData);
      if (result.error) {
        setServerError(result.error);
      } else {
        router.back();
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/members"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-4"
        >
          <ArrowLeft className="size-3" /> Back to profile
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Edit Profile</h1>
        <p className="text-sm text-text-secondary mt-1">
          Update your personal information and preferences.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary mb-1.5">
                Display name <span className="text-red-400">*</span>
              </label>
              <input
                id="displayName"
                {...register("displayName")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Job title
                </label>
                <input
                  id="title"
                  {...register("title")}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                  placeholder="e.g. ML Engineer"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Company
                </label>
                <input
                  id="company"
                  {...register("company")}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-1.5">
                City
              </label>
              <select
                id="location"
                {...register("location")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
              >
                <option value="">Select your city</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all resize-none"
                placeholder="Short bio about yourself..."
              />
              <p className="mt-1 text-xs text-text-muted">{watchedBio.length}/500</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="githubUsername" className="block text-sm font-medium text-text-secondary mb-1.5">
                GitHub username
              </label>
              <input
                id="githubUsername"
                {...register("githubUsername")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="your-username"
              />
              {errors.githubUsername && (
                <p className="mt-1 text-xs text-red-400">{errors.githubUsername.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-text-secondary mb-1.5">
                LinkedIn URL
              </label>
              <input
                id="linkedinUrl"
                {...register("linkedinUrl")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="https://linkedin.com/in/..."
              />
              {errors.linkedinUrl && (
                <p className="mt-1 text-xs text-red-400">{errors.linkedinUrl.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-text-secondary mb-1.5">
                Website
              </label>
              <input
                id="website"
                {...register("website")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
                placeholder="https://..."
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-400">{errors.website.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const isSelected = watchedInterests.includes(interest);
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
          <p className="mt-2 text-xs text-text-muted">{watchedInterests.length}/10 selected</p>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
