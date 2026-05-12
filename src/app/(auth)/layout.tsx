import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 bg-bg-primary">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[var(--kf-blue)]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-[var(--kf-teal)]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative size-10 rounded-2xl bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white font-bold text-[15px] tracking-tight">
                  KF
                </span>
              </div>
            </div>
            <span className="font-semibold text-[15px] text-text-primary group-hover:text-[var(--kf-blue)] transition-colors">
              Kubeflow Common Hubs
            </span>
          </Link>
        </div>

        {children}

        <p className="text-center text-xs text-text-muted mt-8">
          <Link href="/" className="hover:text-text-secondary transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
