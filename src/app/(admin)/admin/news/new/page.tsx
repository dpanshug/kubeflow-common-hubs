import { NewsForm } from "../news-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Create News Post" };

export default function NewNewsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create News Post</h1>
        <p className="text-sm text-text-muted mt-1">
          Write a new article in Markdown.
        </p>
      </div>
      <NewsForm />
    </div>
  );
}
