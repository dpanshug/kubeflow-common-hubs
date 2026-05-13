import { BadgeForm } from "../badge-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Create Badge" };

export default function NewBadgePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create Badge</h1>
        <p className="text-sm text-text-muted mt-1">
          Define a new achievement badge.
        </p>
      </div>
      <BadgeForm />
    </div>
  );
}
