import { ShieldX } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export default function SuspendedPage() {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-6 sm:p-8 shadow-lg text-center">
      <div className="flex justify-center mb-4">
        <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldX className="size-6 text-red-400" />
        </div>
      </div>
      <h1 className="text-xl font-bold text-text-primary mb-2">Account Suspended</h1>
      <p className="text-sm text-text-secondary mb-6">
        Your account has been suspended. If you believe this is an error,
        please contact the community administrators.
      </p>
      <div className="flex flex-col gap-3">
        <a
          href="mailto:admin@kubeflowcommonhubs.in"
          className="text-sm text-[var(--kf-blue)] font-medium hover:underline"
        >
          Contact Admin
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
