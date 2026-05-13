"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", data.email);

      const result = await resetPassword(formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setEmailSent(true);
      }
    });
  }

  if (emailSent) {
    return (
      <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="size-6 text-green-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Check your email</h1>
        <p className="text-sm text-text-secondary mb-6">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--kf-blue)] font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-4"
      >
        <ArrowLeft className="size-3" />
        Back to sign in
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reset password</h1>
        <p className="text-sm text-text-secondary mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-lg bg-[var(--kf-blue)] text-white text-sm font-medium hover:bg-[var(--kf-blue)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--kf-blue)]/20"
        >
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
