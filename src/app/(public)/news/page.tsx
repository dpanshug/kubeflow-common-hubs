import type { Metadata } from "next";
import { NewsCard } from "@/components/news/news-card";
import { mockPosts } from "./mock-data";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates from the Kubeflow community in India.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          News & Updates
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Stay up to date with the latest from the Kubeflow community in India.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockPosts.map((post) => (
          <NewsCard key={post.id} post={post} featured />
        ))}
      </div>
    </div>
  );
}
